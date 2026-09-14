export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  mileageKm: number;
}

export interface SensorTelemetry {
  rpm: number;
  coolantTempC: number;
  vehicleSpeedKmh: number;
  batteryVoltage: number;
  fuelPressureBar: number;
  intakeTempC: number;
}

export interface DtcDefinition {
  code: string;
  category: 'Powertrain' | 'Chassis' | 'Body' | 'Network';
  title: string;
  description: string;
  severity: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
  commonCauses: string[];
}

export interface ProbableCause {
  cause: string;
  probability: number;
  description: string;
}

export interface DiagnosticAction {
  stepNumber: number;
  title: string;
  action: string;
  requiredTools: string[];
}

export interface CostEstimate {
  currency: string;
  minCost: number;
  maxCost: number;
  partsDescription: string;
}

export interface AiDiagnosticReport {
  summary: string;
  severity: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
  safetyAssessment: {
    isSafeToDrive: boolean;
    safetyNote: string;
  };
  probableCauses: ProbableCause[];
  recommendedActions: DiagnosticAction[];
  costEstimate: CostEstimate;
  affectedSystems: string[];
  aiSource: 'google-gemini' | 'rule-engine-fallback';
  analyzedAt: string;
}

export interface DiagnoseRequestPayload {
  vehicle: VehicleInfo;
  dtcCodes: string[];
  symptoms?: string;
  telemetry?: SensorTelemetry;
}

export interface FullDiagnosticResult {
  vehicle: VehicleInfo;
  dtcCodes: DtcDefinition[];
  telemetry?: SensorTelemetry;
  symptoms?: string;
  aiReport: AiDiagnosticReport;
}

export interface ScanSimulationData {
  connectionStatus: 'CONNECTED' | 'DISCONNECTED';
  protocol: string;
  vin: string;
  detectedCodes: DtcDefinition[];
  telemetry: SensorTelemetry;
  scannedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: {
    type: string;
    message: string;
    statusCode: number;
    issues?: Array<{ field: string; message: string }>;
    details?: unknown;
  };
}

export interface FreezeFrameData {
  triggerDtc: string;
  rpm: number;
  vehicleSpeedKmh: number;
  coolantTempC: number;
  engineLoadPercent: number;
  fuelPressureBar: number;
  intakeTempC: number;
  throttlePercent?: number;
  timestamp: string;
}

export interface ReadinessMonitor {
  id: string;
  name: string;
  supported: boolean;
  ready: boolean;
  description: string;
}

export interface EmissionsReadinessReport {
  milStatus: boolean;
  dtcCount: number;
  verdict: 'APROVADO' | 'REPROVADO_LUZ_MIL' | 'REPROVADO_INCOMPLETO';
  monitors: ReadinessMonitor[];
  summary: string;
  checkedAt: string;
}

export interface DataLogSample {
  timestamp: number;
  timeFormatted: string;
  rpm: number;
  speed: number;
  coolantTemp: number;
  batteryVolts: number;
  fuelPressure: number;
  engineLoad: number;
  intakeTemp: number;
  throttle: number;
}

export interface PredictiveTrend {
  parameter: string;
  trend: 'ESTÁVEL' | 'ELEVAÇÃO' | 'QUEDA' | 'FLUTUAÇÃO_ANORMAL';
  significance: string;
}

export interface PredictiveReport {
  summary: string;
  wearRiskLevel: 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRÍTICO';
  confidenceScore: number;
  trends: PredictiveTrend[];
  predictedFailure: {
    component: string;
    description: string;
    estimatedTimeToFailure: string;
  };
  preventiveRecommendations: string[];
  analyzedSamplesCount: number;
  analyzedAt: string;
  aiSource: 'google-gemini' | 'rule-engine-fallback';
}

export interface PredictivePayload {
  vehicle: VehicleInfo;
  telemetryHistory: Array<{
    timestamp: number;
    rpm: number;
    coolantTempC: number;
    vehicleSpeedKmh: number;
    batteryVoltage: number;
    fuelPressureBar: number;
    intakeTempC: number;
  }>;
  symptoms?: string;
}

export interface AlarmConfig {
  coolantHighThreshold: number;
  coolantDangerThreshold: number;
  batteryLowThreshold: number;
  batteryHighThreshold: number;
  rpmRedlineThreshold: number;
  soundEnabled: boolean;
}

export type ManufacturerPreset =
  | 'Universal'
  | 'Volkswagen / Audi'
  | 'Chevrolet / GM'
  | 'Ford'
  | 'Fiat / Stellantis'
  | 'Outro';

export interface CustomPidDefinition {
  id: string;
  name: string;
  mode: string; // ex: '01', '22'
  pid: string; // ex: '5C', '1154'
  formula: string; // ex: 'A - 40', '(A * 256 + B) / 100 - 1.0'
  unit: string; // ex: '°C', 'bar', 'Nm', '%'
  minVal: number;
  maxVal: number;
  description?: string;
  manufacturer: ManufacturerPreset;
  enabled: boolean;
  lastValue?: number;
  lastUpdated?: number;
}



