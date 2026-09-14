import test from 'node:test';
import assert from 'node:assert';
import { scannerService } from '../services/scanner.service.ts';
import type { DiagnosticInput } from '../services/gemini.service.ts';

test('ScannerService - Listagem de códigos DTC cadastrados', () => {
  const codes = scannerService.getAllDtcCodes();
  assert.ok(Array.isArray(codes));
  assert.ok(codes.length >= 5);

  const p0300 = codes.find((c) => c.code === 'P0300');
  assert.ok(p0300);
  assert.strictEqual(p0300?.severity, 'ALTA');
});

test('ScannerService - Busca de código por string insensível a maiúsculas', () => {
  const code = scannerService.getDtcByCode('p0420');
  assert.ok(code);
  assert.strictEqual(code?.code, 'P0420');
  assert.strictEqual(code?.category, 'Powertrain');

  const notFound = scannerService.getDtcByCode('P9999');
  assert.strictEqual(notFound, null);
});

test('ScannerService - Simulação de varredura OBD-II da centralina', () => {
  const scan = scannerService.simulateEcuScan();
  assert.strictEqual(scan.connectionStatus, 'CONNECTED');
  assert.ok(scan.vin.length > 10);
  assert.ok(scan.telemetry.rpm > 0);
  assert.ok(scan.telemetry.coolantTempC > 0);
  assert.ok(scan.telemetry.batteryVoltage >= 12);
});

test('ScannerService - Execução de diagnóstico completo com geração de laudo', async () => {
  const input: DiagnosticInput = {
    vehicle: {
      make: 'Volkswagen',
      model: 'Golf GTI',
      year: 2020,
      mileageKm: 60000,
    },
    dtcCodes: ['P0300', 'P0171'],
    symptoms: 'Motor falhando em aceleração e luz de injeção piscando',
    telemetry: {
      rpm: 950,
      coolantTempC: 98,
      vehicleSpeedKmh: 0,
      batteryVoltage: 13.9,
      fuelPressureBar: 3.2,
      intakeTempC: 35,
    },
  };

  const diagnosis = await scannerService.diagnoseVehicle(input);

  assert.strictEqual(diagnosis.vehicle.model, 'Golf GTI');
  assert.strictEqual(diagnosis.dtcCodes.length, 2);
  assert.ok(diagnosis.aiReport);
  assert.ok(['BAIXA', 'MÉDIA', 'ALTA', 'CRÍTICA'].includes(diagnosis.aiReport.severity));
  assert.ok(diagnosis.aiReport.probableCauses.length > 0);
  assert.ok(diagnosis.aiReport.recommendedActions.length > 0);
  assert.ok(diagnosis.aiReport.costEstimate.minCost > 0);
});
