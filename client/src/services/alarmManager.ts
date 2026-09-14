import type { SensorTelemetry, AlarmConfig } from '../types/scanner';
import { audioAlerts } from './audioAlerts';

export interface ActiveAlarmViolation {
  id: string;
  message: string;
  severity: 'WARNING' | 'DANGER';
  sensorValue: number;
  threshold: number;
}

const STORAGE_KEY = 'autoscanner_alarm_config_v1';

const DEFAULT_CONFIG: AlarmConfig = {
  coolantHighThreshold: 102,
  coolantDangerThreshold: 108,
  batteryLowThreshold: 11.8,
  batteryHighThreshold: 15.0,
  rpmRedlineThreshold: 5800,
  soundEnabled: true,
};

class AlarmManagerService {
  private config: AlarmConfig = DEFAULT_CONFIG;

  constructor() {
    this.loadConfig();
  }

  public getConfig(): AlarmConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<AlarmConfig>): AlarmConfig {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.warn('Falha ao salvar configuração de alarmes no storage:', e);
      }
    }
    audioAlerts.setMuted(!this.config.soundEnabled);
    return { ...this.config };
  }

  private loadConfig(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
        audioAlerts.setMuted(!this.config.soundEnabled);
      }
    } catch {
      this.config = DEFAULT_CONFIG;
    }
  }

  /**
   * Avalia a telemetria recebida e retorna violações ativas com disparo sonoro correspondente
   */
  public evaluateTelemetry(telemetry: SensorTelemetry): ActiveAlarmViolation[] {
    const violations: ActiveAlarmViolation[] = [];

    // 1. Temperatura do arrefecimento
    if (telemetry.coolantTempC >= this.config.coolantDangerThreshold) {
      violations.push({
        id: 'coolant_danger',
        message: `PERIGO: Superaquecimento do Motor (${telemetry.coolantTempC}°C >= ${this.config.coolantDangerThreshold}°C)! Pare o veículo.`,
        severity: 'DANGER',
        sensorValue: telemetry.coolantTempC,
        threshold: this.config.coolantDangerThreshold,
      });
    } else if (telemetry.coolantTempC >= this.config.coolantHighThreshold) {
      violations.push({
        id: 'coolant_warn',
        message: `ATENÇÃO: Temperatura do Arrefecimento elevada (${telemetry.coolantTempC}°C >= ${this.config.coolantHighThreshold}°C).`,
        severity: 'WARNING',
        sensorValue: telemetry.coolantTempC,
        threshold: this.config.coolantHighThreshold,
      });
    }

    // 2. Tensão da bateria / alternador
    if (telemetry.batteryVoltage <= this.config.batteryLowThreshold) {
      violations.push({
        id: 'battery_low',
        message: `Subtensão Elétrica (${telemetry.batteryVoltage}V <= ${this.config.batteryLowThreshold}V). Alternador inoperante ou bateria descarregada.`,
        severity: 'WARNING',
        sensorValue: telemetry.batteryVoltage,
        threshold: this.config.batteryLowThreshold,
      });
    } else if (telemetry.batteryVoltage >= this.config.batteryHighThreshold) {
      violations.push({
        id: 'battery_high',
        message: `Sobretensão Crítica (${telemetry.batteryVoltage}V >= ${this.config.batteryHighThreshold}V). Risco de queima de módulos eletrônicos!`,
        severity: 'DANGER',
        sensorValue: telemetry.batteryVoltage,
        threshold: this.config.batteryHighThreshold,
      });
    }

    // 3. Rotação do motor (Shift light / Redline)
    if (telemetry.rpm >= this.config.rpmRedlineThreshold) {
      violations.push({
        id: 'rpm_redline',
        message: `CORTE DE GIRO: Rotação no limite (${telemetry.rpm} RPM >= ${this.config.rpmRedlineThreshold} RPM)!`,
        severity: 'DANGER',
        sensorValue: telemetry.rpm,
        threshold: this.config.rpmRedlineThreshold,
      });
    }

    // Disparo de áudio se habilitado
    if (this.config.soundEnabled && violations.length > 0) {
      const hasDanger = violations.some((v) => v.severity === 'DANGER');
      if (hasDanger) {
        audioAlerts.playDangerAlert();
      } else {
        audioAlerts.playWarningBeep();
      }
    }

    return violations;
  }
}

export const alarmManager = new AlarmManagerService();
