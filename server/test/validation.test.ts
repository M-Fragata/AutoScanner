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

test('Validação de Contrato Zod LLM - AiDiagnosticReportPayloadSchema aceita formato válido', async () => {
  const { AiDiagnosticReportPayloadSchema } = await import('../services/gemini.service.ts');

  const validGeminiOutput = {
    summary: 'Falha detectada no sistema de ignição do cilindro 1.',
    severity: 'ALTA',
    safetyAssessment: {
      isSafeToDrive: false,
      safetyNote: 'Evite conduzir sob alta carga para não danificar o catalisador.',
    },
    probableCauses: [
      {
        cause: 'Bobina de ignição defeituosa',
        probability: 85,
        description: 'Enrolamento secundário com fuga de corrente.',
      },
    ],
    recommendedActions: [
      {
        stepNumber: 1,
        title: 'Troca da bobina',
        action: 'Substituir bobina do cilindro 1 e testar faiscamento.',
        requiredTools: ['Chave Torx T30', 'Scanner OBD-II'],
      },
    ],
    costEstimate: {
      currency: 'BRL',
      minCost: 200,
      maxCost: 450,
      partsDescription: 'Bobina de ignição original Bosch.',
    },
    affectedSystems: ['Sistema de Ignição', 'Trem de Força'],
  };

  const parsed = AiDiagnosticReportPayloadSchema.safeParse(validGeminiOutput);
  assert.strictEqual(parsed.success, true);
});

test('Validação de Contrato Zod LLM - AiDiagnosticReportPayloadSchema rejeita severidade inválida', async () => {
  const { AiDiagnosticReportPayloadSchema } = await import('../services/gemini.service.ts');

  const invalidGeminiOutput = {
    summary: 'Diagnóstico com severidade desconhecida',
    severity: 'SUPER_URGENTE', // Não permitido pelo enum
    safetyAssessment: { isSafeToDrive: true, safetyNote: 'Tudo ok' },
    probableCauses: [],
    recommendedActions: [],
    costEstimate: { currency: 'BRL', minCost: 100, maxCost: 200, partsDescription: 'Peças' },
    affectedSystems: ['Injeção'],
  };

  const parsed = AiDiagnosticReportPayloadSchema.safeParse(invalidGeminiOutput);
  assert.strictEqual(parsed.success, false);
});

test('Validação de Contrato Zod LLM - PredictiveReportPayloadSchema valida e normaliza níveis', async () => {
  const { PredictiveReportPayloadSchema } = await import('../services/gemini.service.ts');

  const validPredictiveOutput = {
    summary: 'Gradiente de temperatura em elevação progressiva sob carga.',
    wearRiskLevel: 'ELEVADO',
    confidenceScore: 90,
    trends: [
      {
        parameter: 'Temperatura de Arrefecimento',
        trend: 'ELEVAÇÃO',
        significance: 'Elevação contínua acima de 102°C.',
      },
    ],
    predictedFailure: {
      component: 'Válvula Termostática',
      description: 'Abertura parcial restrita.',
      estimatedTimeToFailure: '500 km',
    },
    preventiveRecommendations: ['Substituição preventiva do termostato'],
  };

  const parsed = PredictiveReportPayloadSchema.safeParse(validPredictiveOutput);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    assert.strictEqual(parsed.data.wearRiskLevel, 'ELEVADO');
  }
});

