import type { VehicleInfo, SensorTelemetry, AiDiagnosticReport } from '../types/scanner';

export interface SavedDiagnosticSession {
  id: string;
  timestamp: string;
  vehicle: VehicleInfo;
  dtcCodes: string[];
  symptoms?: string;
  telemetrySnapshot?: SensorTelemetry;
  report: AiDiagnosticReport;
}

const STORAGE_KEY = 'autoscanner_diagnostic_history_v1';
const MAX_SESSIONS = 30;

export function getSavedSessions(): SavedDiagnosticSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Falha ao carregar histórico de diagnósticos:', err);
    return [];
  }
}

export function saveDiagnosticSession(
  session: Omit<SavedDiagnosticSession, 'id' | 'timestamp'>
): SavedDiagnosticSession {
  const existing = getSavedSessions();
  const newSession: SavedDiagnosticSession = {
    ...session,
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  const updated = [newSession, ...existing.filter((s) => s.id !== newSession.id)].slice(0, MAX_SESSIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Falha ao salvar sessão no localStorage:', err);
  }

  return newSession;
}

export function deleteSavedSession(id: string): SavedDiagnosticSession[] {
  const existing = getSavedSessions();
  const updated = existing.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Falha ao excluir sessão do histórico:', err);
  }
  return updated;
}

export function clearAllSavedSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Falha ao limpar histórico:', err);
  }
}
