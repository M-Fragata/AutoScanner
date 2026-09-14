import test, { after, before } from 'node:test';
import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../app.ts';

let server: Server;
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

test('API GET /api/health - Deve retornar status online', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(response.status, 200);

  const body = (await response.json()) as { status: string; service: string };
  assert.strictEqual(body.status, 'online');
  assert.strictEqual(body.service, 'AutoScanner API');
});

test('API GET /api/scanner/dtc-codes - Retorna listagem de códigos padrão', async () => {
  const response = await fetch(`${baseUrl}/api/scanner/dtc-codes`);
  assert.strictEqual(response.status, 200);

  const body = (await response.json()) as { success: boolean; data: Array<{ code: string }> };
  assert.strictEqual(body.success, true);
  assert.ok(body.data.length > 0);
  assert.ok(body.data.some((c) => c.code === 'P0300'));
});

test('API GET /api/scanner/dtc-codes/P0300 - Retorna detalhes do código específico', async () => {
  const response = await fetch(`${baseUrl}/api/scanner/dtc-codes/p0300`);
  assert.strictEqual(response.status, 200);

  const body = (await response.json()) as { success: boolean; data: { code: string; title: string } };
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.code, 'P0300');
});

test('API GET /api/scanner/dtc-codes/P9999 - Retorna 404 para código inexistente', async () => {
  const response = await fetch(`${baseUrl}/api/scanner/dtc-codes/p9999`);
  assert.strictEqual(response.status, 404);

  const body = (await response.json()) as { success: boolean; error: { statusCode: number } };
  assert.strictEqual(body.success, false);
  assert.strictEqual(body.error.statusCode, 404);
});

test('API GET /api/scanner/simulate - Retorna dados simulados da centralina', async () => {
  const response = await fetch(`${baseUrl}/api/scanner/simulate`);
  assert.strictEqual(response.status, 200);

  const body = (await response.json()) as { success: boolean; data: { connectionStatus: string; vin: string } };
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.connectionStatus, 'CONNECTED');
  assert.ok(body.data.vin.length > 0);
});

test('API POST /api/scanner/diagnose - Validação com Zod bloqueia payload inválido (HTTP 400)', async () => {
  const invalidPayload = {
    vehicle: {
      make: '',
      model: 'Corolla',
      year: 1950,
      mileageKm: -1,
    },
    dtcCodes: ['CODIGO_INVALIDO'],
  };

  const response = await fetch(`${baseUrl}/api/scanner/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidPayload),
  });

  assert.strictEqual(response.status, 400);

  const body = (await response.json()) as {
    success: boolean;
    error: { type: string; issues: Array<{ field: string; message: string }> };
  };
  assert.strictEqual(body.success, false);
  assert.strictEqual(body.error.type, 'VALIDATION_ERROR');
  assert.ok(body.error.issues.length >= 3);
});

test('API POST /api/scanner/diagnose - Diagnóstico com payload válido retorna 200 e laudo técnico', async () => {
  const validPayload = {
    vehicle: {
      make: 'Chevrolet',
      model: 'Onix',
      year: 2022,
      mileageKm: 35000,
    },
    dtcCodes: ['P0420'],
    symptoms: 'Consumo elevado de combustível',
    telemetry: {
      rpm: 800,
      coolantTempC: 90,
      vehicleSpeedKmh: 0,
      batteryVoltage: 14.0,
      fuelPressureBar: 3.6,
      intakeTempC: 30,
    },
  };

  const response = await fetch(`${baseUrl}/api/scanner/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload),
  });

  assert.strictEqual(response.status, 200);

  const body = (await response.json()) as {
    success: boolean;
    data: { vehicle: { model: string }; aiReport: { summary: string; severity: string } };
  };

  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.vehicle.model, 'Onix');
  assert.ok(body.data.aiReport);
  assert.ok(body.data.aiReport.summary.length > 0);
});
