import { useState, useCallback } from 'react';
import type {
  VehicleInfo,
  FullDiagnosticResult,
  SensorTelemetry,
} from '../types/scanner';
import { simulateEcuScan, requestVehicleDiagnosis } from '../services/api';
import { useAppStore } from '../store/useAppStore';

const DEFAULT_VEHICLE: VehicleInfo = {
  make: 'Volkswagen',
  model: 'Golf GTI',
  year: 2021,
  mileageKm: 54000,
};

export function useScanner(currentTelemetry: SensorTelemetry) {
  const [vehicle, setVehicle] = useState<VehicleInfo>(DEFAULT_VEHICLE);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['P0300', 'P0171']);
  const [symptoms, setSymptoms] = useState<string>('Motor engasgando em subidas e luz de injeção acesa intermitente');
  const [isScanningEcu, setIsScanningEcu] = useState<boolean>(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<FullDiagnosticResult | null>(null);
  const [protocolInfo, setProtocolInfo] = useState<string | null>(null);
  const [vinInfo, setVinInfo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addDtcCode = useCallback((code: string) => {
    const formatted = code.trim().toUpperCase();
    if (!formatted) return;
    setSelectedCodes((prev) => (prev.includes(formatted) ? prev : [...prev, formatted]));
  }, []);

  const removeDtcCode = useCallback((code: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
  }, []);

  // Simula conexão com o protocolo OBD-II do carro e varredura da central (ECU)
  const triggerEcuScan = useCallback(
    async (onScanComplete?: (telemetry: SensorTelemetry) => void) => {
      setIsScanningEcu(true);
      setErrorMessage(null);

      try {
        // Delay simulado de handshake do protocolo OBD-II (1.5s)
        await new Promise((r) => setTimeout(r, 1200));

        const scanData = await simulateEcuScan();
        setProtocolInfo(scanData.protocol);
        setVinInfo(scanData.vin);

        const detected = scanData.detectedCodes.map((d) => d.code);
        setSelectedCodes(detected);

        if (onScanComplete) {
          onScanComplete(scanData.telemetry);
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Erro ao escanear ECU');
      } finally {
        setIsScanningEcu(false);
      }
    },
    []
  );

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
    isScanningEcu,
    isAnalyzingAi,
    diagnosticResult,
    setDiagnosticResult,
    protocolInfo,
    vinInfo,
    errorMessage,
    setErrorMessage,
    addDtcCode,
    removeDtcCode,
    triggerEcuScan,
    triggerAiDiagnosis,
    resetDiagnosis,
  };
}
