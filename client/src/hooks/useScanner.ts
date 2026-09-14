import { useState, useCallback } from 'react';
import type {
  VehicleInfo,
  FullDiagnosticResult,
  SensorTelemetry,
} from '../types/scanner';
import { requestVehicleDiagnosis } from '../services/api';
import { useAppStore } from '../store/useAppStore';

const DEFAULT_VEHICLE: VehicleInfo = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  mileageKm: 0,
};

export function useScanner(currentTelemetry: SensorTelemetry) {
  const [vehicle, setVehicle] = useState<VehicleInfo>(DEFAULT_VEHICLE);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string>('');
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<FullDiagnosticResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addDtcCode = useCallback((code: string) => {
    const formatted = code.trim().toUpperCase();
    if (!formatted) return;
    setSelectedCodes((prev) => (prev.includes(formatted) ? prev : [...prev, formatted]));
  }, []);

  const removeDtcCode = useCallback((code: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
  }, []);

  // Executa o diagnóstico completo acionando o backend e o Google Gemini AI
  const triggerAiDiagnosis = useCallback(async () => {
    if (selectedCodes.length === 0) {
      setErrorMessage('Selecione ou detecte pelo menos um código DTC para emitir o laudo.');
      return;
    }

    setIsAnalyzingAi(true);
    setErrorMessage(null);

    try {
      const result = await requestVehicleDiagnosis({
        vehicle,
        dtcCodes: selectedCodes,
        symptoms,
        telemetry: currentTelemetry,
      });

      setDiagnosticResult(result);

      // Salva automaticamente o laudo no histórico persistente da store
      try {
        const { recordSession } = useAppStore.getState();
        recordSession({
          vehicle,
          dtcCodes: selectedCodes,
          symptoms,
          telemetrySnapshot: currentTelemetry,
          report: result.aiReport,
        });
      } catch (e) {
        console.warn('Falha ao salvar sessão de histórico:', e);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao emitir diagnóstico com IA');
    } finally {
      setIsAnalyzingAi(false);
    }
  }, [vehicle, selectedCodes, symptoms, currentTelemetry]);

  const resetDiagnosis = useCallback(() => {
    setDiagnosticResult(null);
    setErrorMessage(null);
  }, []);

  return {
    vehicle,
    setVehicle,
    selectedCodes,
    setSelectedCodes,
    symptoms,
    setSymptoms,
    isAnalyzingAi,
    diagnosticResult,
    setDiagnosticResult,
    errorMessage,
    setErrorMessage,
    addDtcCode,
    removeDtcCode,
    triggerAiDiagnosis,
    resetDiagnosis,
  };
}
