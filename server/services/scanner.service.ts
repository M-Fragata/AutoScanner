import { OBD_DTC_DATABASE } from '../utils/sampleCodes.ts';
import type { DtcDefinition } from '../utils/sampleCodes.ts';
import { geminiService } from './gemini.service.ts';
import type {
  DiagnosticInput,
  AiDiagnosticReport,
  SensorTelemetry,
  PredictiveInput,
  PredictiveReport,
} from './gemini.service.ts';

export interface ScanSimulationResult {
  connectionStatus: 'CONNECTED' | 'DISCONNECTED';
  protocol: string;
  vin: string;
  detectedCodes: DtcDefinition[];
  telemetry: SensorTelemetry;
  scannedAt: string;
}

export interface FullDiagnosticResponse {
  vehicle: DiagnosticInput['vehicle'];
  dtcCodes: DtcDefinition[];
  telemetry?: SensorTelemetry;
  symptoms?: string;
  aiReport: AiDiagnosticReport;
}

export class ScannerService {
  public getAllDtcCodes(): DtcDefinition[] {
    return Object.values(OBD_DTC_DATABASE);
  }

  public getDtcByCode(code: string): DtcDefinition | null {
    const normalized = code.trim().toUpperCase();
    return OBD_DTC_DATABASE[normalized] || null;
  }

  public simulateEcuScan(): ScanSimulationResult {
    // Simula varredura da central eletrônica com códigos e telemetria automotiva realista
    const samplePicks = ['P0300', 'P0171'];
    const detectedCodes = samplePicks
      .map((code) => OBD_DTC_DATABASE[code])
      .filter((def): def is DtcDefinition => Boolean(def));

    const simulatedTelemetry: SensorTelemetry = {
      rpm: 850 + Math.floor(Math.random() * 100),
      coolantTempC: 92 + Math.floor(Math.random() * 8),
      vehicleSpeedKmh: 0,
      batteryVoltage: 13.8 + Math.round(Math.random() * 4) / 10,
      fuelPressureBar: 3.5 + Math.round(Math.random() * 3) / 10,
      intakeTempC: 32 + Math.floor(Math.random() * 5),
    };

    return {
      connectionStatus: 'CONNECTED',
      protocol: 'ISO 15765-4 CAN (11 bit ID, 500 kbaud)',
      vin: '9BWCA45U7FP001824',
      detectedCodes,
      telemetry: simulatedTelemetry,
      scannedAt: new Date().toISOString(),
    };
  }

  public async diagnoseVehicle(input: DiagnosticInput): Promise<FullDiagnosticResponse> {
    const aiReport = await geminiService.generateDiagnosticReport(input);

    const enrichedCodes: DtcDefinition[] = input.dtcCodes.map((code) => {
      const existing = this.getDtcByCode(code);
      if (existing) {
        return existing;
      }
      return {
        code: code.toUpperCase(),
        category: 'Powertrain',
        title: `Código OBD-II ${code.toUpperCase()}`,
        description: 'Código de anomalia reportado pela ECU.',
        severity: 'MÉDIA',
        commonCauses: ['Verificar dados em tempo real e sensores associados'],
      };
    });

    return {
      vehicle: input.vehicle,
      dtcCodes: enrichedCodes,
      telemetry: input.telemetry,
      symptoms: input.symptoms,
      aiReport,
    };
  }

  public async predictVehicleWear(input: PredictiveInput): Promise<PredictiveReport> {
    return geminiService.generatePredictiveReport(input);
  }
}

export const scannerService = new ScannerService();

