import { create } from 'zustand';
import type { SensorTelemetry, VehicleInfo, AiDiagnosticReport } from '../types/scanner';
import {
  getSavedSessions,
  saveDiagnosticSession,
  deleteSavedSession,
  type SavedDiagnosticSession,
} from '../services/historyStorage';

export interface TelemetryHistoryPoint {
  timestamp: number;
  timeLabel: string;
  rpm: number;
  vehicleSpeedKmh: number;
  coolantTempC: number;
  batteryVoltage: number;
  fuelPressureBar: number;
  intakeTempC: number;
}

export type TelemetryViewMode = 'GAUGES' | 'CHARTS' | 'CARDS';

interface AppStoreState {
  // Telemetria ao vivo
  telemetry: SensorTelemetry;
  telemetryHistory: TelemetryHistoryPoint[];
  viewMode: TelemetryViewMode;
  isLiveStreaming: boolean;

  // Histórico de diagnósticos
  savedSessions: SavedDiagnosticSession[];

  // Ações de telemetria
  updateTelemetry: (data: Partial<SensorTelemetry>) => void;
  setTelemetry: (data: SensorTelemetry) => void;
  setViewMode: (mode: TelemetryViewMode) => void;
  setIsLiveStreaming: (streaming: boolean) => void;
  toggleLiveStreaming: () => void;
  clearTelemetryHistory: () => void;

  // Ações de histórico
  loadSavedSessions: () => void;
  recordSession: (params: {
    vehicle: VehicleInfo;
    dtcCodes: string[];
    symptoms?: string;
    telemetrySnapshot?: SensorTelemetry;
    report: AiDiagnosticReport;
  }) => SavedDiagnosticSession;
  removeSavedSession: (id: string) => void;
}

const INITIAL_TELEMETRY: SensorTelemetry = {
  rpm: 850,
  coolantTempC: 88,
  vehicleSpeedKmh: 0,
  batteryVoltage: 13.8,
  fuelPressureBar: 3.5,
  intakeTempC: 32,
};

const MAX_HISTORY_POINTS = 50;

export const useAppStore = create<AppStoreState>((set) => ({
  telemetry: INITIAL_TELEMETRY,
  telemetryHistory: [
    {
      timestamp: Date.now(),
      timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...INITIAL_TELEMETRY,
    },
  ],
  viewMode: 'GAUGES',
  isLiveStreaming: true,
  savedSessions: getSavedSessions(),

  updateTelemetry: (partialData) => {
    set((state) => {
      const updated: SensorTelemetry = { ...state.telemetry, ...partialData };
      const now = Date.now();
      const timeLabel = new Date(now).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newPoint: TelemetryHistoryPoint = {
        timestamp: now,
        timeLabel,
        rpm: updated.rpm,
        vehicleSpeedKmh: updated.vehicleSpeedKmh,
        coolantTempC: updated.coolantTempC,
        batteryVoltage: updated.batteryVoltage,
        fuelPressureBar: updated.fuelPressureBar,
        intakeTempC: updated.intakeTempC,
      };

      const newHistory = [...state.telemetryHistory, newPoint].slice(-MAX_HISTORY_POINTS);

      return {
        telemetry: updated,
        telemetryHistory: newHistory,
      };
    });
  },

  setTelemetry: (newTelemetry) => {
    set((state) => {
      const now = Date.now();
      const timeLabel = new Date(now).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newPoint: TelemetryHistoryPoint = {
        timestamp: now,
        timeLabel,
        ...newTelemetry,
      };

      return {
        telemetry: newTelemetry,
        telemetryHistory: [...state.telemetryHistory, newPoint].slice(-MAX_HISTORY_POINTS),
      };
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setIsLiveStreaming: (streaming) => set({ isLiveStreaming: streaming }),

  toggleLiveStreaming: () => set((state) => ({ isLiveStreaming: !state.isLiveStreaming })),

  clearTelemetryHistory: () => set({ telemetryHistory: [] }),

  loadSavedSessions: () => {
    set({ savedSessions: getSavedSessions() });
  },

  recordSession: (params) => {
    const saved = saveDiagnosticSession(params);
    set({ savedSessions: getSavedSessions() });
    return saved;
  },

  removeSavedSession: (id) => {
    const updated = deleteSavedSession(id);
    set({ savedSessions: updated });
  },
}));
