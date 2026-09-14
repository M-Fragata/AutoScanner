import test from 'node:test';
import assert from 'node:assert';
import { scannerService } from '../services/scanner.service.ts';
import type { PredictiveInput } from '../services/gemini.service.ts';

test('ScannerService - Análise Preditiva de Falhas por Série Temporal', async () => {
  const input: PredictiveInput = {
    vehicle: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      mileageKm: 42000,
    },
    telemetryHistory: [
      { timestamp: 1710423000000, rpm: 800, coolantTempC: 90, vehicleSpeedKmh: 0, batteryVoltage: 13.9, fuelPressureBar: 3.5, intakeTempC: 30 },
      { timestamp: 1710423005000, rpm: 1200, coolantTempC: 93, vehicleSpeedKmh: 20, batteryVoltage: 13.8, fuelPressureBar: 3.5, intakeTempC: 31 },
      { timestamp: 1710423010000, rpm: 2200, coolantTempC: 98, vehicleSpeedKmh: 50, batteryVoltage: 13.7, fuelPressureBar: 3.4, intakeTempC: 33 },
      { timestamp: 1710423015000, rpm: 2800, coolantTempC: 104, vehicleSpeedKmh: 75, batteryVoltage: 13.6, fuelPressureBar: 3.3, intakeTempC: 35 },
      { timestamp: 1710423020000, rpm: 3200, coolantTempC: 109, vehicleSpeedKmh: 90, batteryVoltage: 13.5, fuelPressureBar: 3.2, intakeTempC: 37 },
    ],
    symptoms: 'Temperatura subindo rapidamente em velocidade de rodovia',
  };

  const report = await scannerService.predictVehicleWear(input);

  assert.ok(report);
  assert.ok(report.summary.length > 10);
  assert.ok(['BAIXO', 'MODERADO', 'ELEVADO', 'CRÍTICO'].includes(report.wearRiskLevel));
  assert.ok(report.confidenceScore >= 50 && report.confidenceScore <= 100);
  assert.ok(report.trends.length > 0);
  assert.ok(report.predictedFailure.component.length > 0);
  assert.ok(report.preventiveRecommendations.length > 0);
  assert.strictEqual(report.analyzedSamplesCount, 5);
});
