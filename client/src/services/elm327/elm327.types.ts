export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONFIGURING'
  | 'CONNECTED'
  | 'ERROR';

export type ElmBaudRate = 9600 | 38400 | 115200;

export interface ElmDeviceInfo {
  version: string;
  protocol: string;
  batteryVoltage: number;
  vin: string | null;
}

export interface ObdLiveTelemetry {
  rpm: number;
  coolantTempC: number;
  vehicleSpeedKmh: number;
  batteryVoltage: number;
  fuelPressureBar: number;
  intakeTempC: number;
  engineLoadPercent: number;
  throttlePercent: number;
}

export interface LogEntry {
  timestamp: string;
  direction: 'TX' | 'RX' | 'INFO' | 'ERROR';
  message: string;
}

export interface ElmCommandResult {
  raw: string;
  clean: string;
  success: boolean;
}
