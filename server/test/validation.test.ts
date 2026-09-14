import test from 'node:test';
import assert from 'node:assert';
import {
  vehicleSchema,
  diagnoseBodySchema,
  codeParamSchema,
  telemetrySchema,
} from '../controllers/scanner.controller.ts';

test('Validação de Veículo - Dados válidos', () => {
  const validVehicle = {
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    mileageKm: 45000,
  };

  const result = vehicleSchema.safeParse(validVehicle);
  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.make, 'Honda');
    assert.strictEqual(result.data.year, 2021);
  }
});

test('Validação de Veículo - Falha com dados inválidos', () => {
  const invalidVehicle = {
    make: '',
    model: 'Civic',
    year: 1950, // Menor que o mínimo de 1980
    mileageKm: -100, // Negativo
  };

  const result = vehicleSchema.safeParse(invalidVehicle);
  assert.strictEqual(result.success, false);
  if (!result.success) {
    const errorFields = result.error.errors.map((e) => e.path[0]);
    assert.ok(errorFields.includes('make'));
    assert.ok(errorFields.includes('year'));
    assert.ok(errorFields.includes('mileageKm'));
  }
});

test('Validação de Código DTC no Param - Normalização e formato', () => {
  const validParam = { code: 'p0300' };
  const result = codeParamSchema.safeParse(validParam);
  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.code, 'P0300'); // Converte para maiúsculo
  }

  const invalidParam = { code: 'INVALID_CODE' };
  const invalidResult = codeParamSchema.safeParse(invalidParam);
  assert.strictEqual(invalidResult.success, false);
});

test('Validação de Telemetria - Limites de sensores automotivos', () => {
  const validTelemetry = {
    rpm: 850,
    coolantTempC: 90,
    vehicleSpeedKmh: 60,
    batteryVoltage: 14.1,
    fuelPressureBar: 3.8,
    intakeTempC: 28,
  };

  const result = telemetrySchema.safeParse(validTelemetry);
  assert.strictEqual(result.success, true);

  const invalidTelemetry = {
    rpm: 15000, // Acima do limite de 12000
    coolantTempC: 300,
    vehicleSpeedKmh: -5,
    batteryVoltage: 40,
    fuelPressureBar: 50,
    intakeTempC: 200,
  };

  const invalidResult = telemetrySchema.safeParse(invalidTelemetry);
  assert.strictEqual(invalidResult.success, false);
});

test('Validação do Payload de Diagnóstico - Bloqueio de requisições sem códigos DTC', () => {
  const payloadWithoutCodes = {
    vehicle: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      mileageKm: 32000,
    },
    dtcCodes: [],
  };

  const result = diagnoseBodySchema.safeParse(payloadWithoutCodes);
  assert.strictEqual(result.success, false);
});
