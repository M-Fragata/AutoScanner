import type {
  ApiResponse,
  DtcDefinition,
  FullDiagnosticResult,
  DiagnoseRequestPayload,
  ScanSimulationData,
  PredictivePayload,
  PredictiveReport,
} from '../types/scanner';

const API_BASE = '/api';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchDtcCodes(search?: string): Promise<DtcDefinition[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/scanner/dtc-codes${query}`);
  const json = (await res.json()) as ApiResponse<DtcDefinition[]>;

  if (!res.ok || !json.data) {
    throw new Error(json.error?.message || 'Falha ao buscar códigos DTC');
  }

  return json.data;
}

export async function fetchDtcByCode(code: string): Promise<DtcDefinition> {
  const res = await fetch(`${API_BASE}/scanner/dtc-codes/${encodeURIComponent(code)}`);
  const json = (await res.json()) as ApiResponse<DtcDefinition>;

  if (!res.ok || !json.data) {
    throw new Error(json.error?.message || `Código ${code} não encontrado`);
  }

  return json.data;
}

export async function simulateEcuScan(): Promise<ScanSimulationData> {
  const res = await fetch(`${API_BASE}/scanner/simulate`);
  const json = (await res.json()) as ApiResponse<ScanSimulationData>;

  if (!res.ok || !json.data) {
    throw new Error(json.error?.message || 'Falha ao simular varredura da centralina');
  }

  return json.data;
}

export async function requestVehicleDiagnosis(
  payload: DiagnoseRequestPayload
): Promise<FullDiagnosticResult> {
  const res = await fetch(`${API_BASE}/scanner/diagnose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as ApiResponse<FullDiagnosticResult>;

  if (!res.ok || !json.data) {
    if (json.error?.issues && json.error.issues.length > 0) {
      const issuesText = json.error.issues.map((i) => `${i.field}: ${i.message}`).join(', ');
      throw new Error(`Dados inválidos: ${issuesText}`);
    }
    throw new Error(json.error?.message || 'Falha ao executar diagnóstico');
  }

  return json.data;
}

export async function requestPredictiveAnalysis(
  payload: PredictivePayload
): Promise<PredictiveReport> {
  const res = await fetch(`${API_BASE}/scanner/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as ApiResponse<PredictiveReport>;

  if (!res.ok || !json.data) {
    if (json.error?.issues && json.error.issues.length > 0) {
      const issuesText = json.error.issues.map((i) => `${i.field}: ${i.message}`).join(', ');
      throw new Error(`Dados inválidos: ${issuesText}`);
    }
    throw new Error(json.error?.message || 'Falha ao processar análise preditiva');
  }

  return json.data;
}

