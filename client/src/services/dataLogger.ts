import type { SensorTelemetry, DataLogSample } from '../types/scanner';

class DataLoggerService {
  private isRecording: boolean = false;
  private samples: DataLogSample[] = [];
  private startTime: number | null = null;
  public onStateChange?: (isRecording: boolean, count: number) => void;

  public startLogging(): void {
    this.isRecording = true;
    this.startTime = Date.now();
    this.samples = [];
    this.notify();
  }

  public stopLogging(): DataLogSample[] {
    this.isRecording = false;
    this.notify();
    return [...this.samples];
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getSampleCount(): number {
    return this.samples.length;
  }

  public getSamples(): DataLogSample[] {
    return [...this.samples];
  }

  public getDurationSeconds(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  public addSample(telemetry: SensorTelemetry): void {
    if (!this.isRecording) return;

    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const sample: DataLogSample = {
      timestamp: now,
      timeFormatted,
      rpm: telemetry.rpm,
      speed: telemetry.vehicleSpeedKmh,
      coolantTemp: telemetry.coolantTempC,
      batteryVolts: telemetry.batteryVoltage,
      fuelPressure: telemetry.fuelPressureBar,
      engineLoad: Math.round((telemetry.rpm / 7000) * 100),
      intakeTemp: telemetry.intakeTempC,
      throttle: Math.round((telemetry.vehicleSpeedKmh / 220) * 100),
    };

    this.samples.push(sample);
    this.notify();
  }

  public exportToCsv(filenamePrefix: string = 'autoscanner_telemetria'): boolean {
    if (this.samples.length === 0) return false;

    const headers = [
      'Timestamp_Epoch_ms',
      'Horario',
      'Rotacao_RPM',
      'Velocidade_kmh',
      'Temperatura_Arrefecimento_C',
      'Tensao_Bateria_V',
      'Pressao_Combustivel_bar',
      'Temperatura_Admissao_IAT_C',
      'Carga_Motor_pct',
    ];

    const rows = this.samples.map((s) => [
      s.timestamp,
      `"${s.timeFormatted}"`,
      s.rpm,
      s.speed,
      s.coolantTemp,
      s.batteryVolts,
      s.fuelPressure,
      s.intakeTemp,
      s.engineLoad,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  }

  public clear(): void {
    this.samples = [];
    this.startTime = null;
    this.notify();
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange(this.isRecording, this.samples.length);
    }
  }
}

export const dataLogger = new DataLoggerService();
