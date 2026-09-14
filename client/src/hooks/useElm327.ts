import { useState, useEffect, useCallback } from 'react';
import { elm327Service } from '../services/elm327/elm327.service';
import type {
  ConnectionStatus,
  ElmBaudRate,
  ElmDeviceInfo,
  ObdLiveTelemetry,
  LogEntry,
} from '../services/elm327/elm327.types';

export function useElm327(onTelemetryReceived?: (telemetry: Partial<ObdLiveTelemetry>) => void) {
  const [status, setStatus] = useState<ConnectionStatus>(elm327Service.getStatus());
  const [deviceInfo, setDeviceInfo] = useState<ElmDeviceInfo>(elm327Service.getDeviceInfo());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScanningDtc, setIsScanningDtc] = useState<boolean>(false);
  const [isClearingDtc, setIsClearingDtc] = useState<boolean>(false);
  const [hardwareError, setHardwareError] = useState<string | null>(null);

  useEffect(() => {
    // Configura listeners do serviço singleton
    elm327Service.onStatusChange = (newStatus) => {
      setStatus(newStatus);
      setDeviceInfo({ ...elm327Service.getDeviceInfo() });
    };

    elm327Service.onTelemetryUpdate = (telemetry) => {
      setDeviceInfo({ ...elm327Service.getDeviceInfo() });
      if (onTelemetryReceived) {
        onTelemetryReceived(telemetry);
      }
    };

    elm327Service.onLog = (entry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 199)]);
    };

    return () => {
      elm327Service.onStatusChange = undefined;
      elm327Service.onTelemetryUpdate = undefined;
      elm327Service.onLog = undefined;
    };
  }, [onTelemetryReceived]);

  const connect = useCallback(async (baudRate: ElmBaudRate = 38400) => {
    setHardwareError(null);
    try {
      await elm327Service.connect(baudRate);
      setDeviceInfo({ ...elm327Service.getDeviceInfo() });
      elm327Service.startTelemetryPolling(800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão serial com o ELM327';
      setHardwareError(msg);
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    setHardwareError(null);
    await elm327Service.disconnect();
    setStatus('DISCONNECTED');
  }, []);

  const scanDtc = useCallback(async (): Promise<string[]> => {
    setHardwareError(null);
    setIsScanningDtc(true);
    try {
      const codes = await elm327Service.scanDiagnosticTroubleCodes();
      return codes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao escanear códigos da ECU';
      setHardwareError(msg);
      return [];
    } finally {
      setIsScanningDtc(false);
    }
  }, []);

  const clearDtc = useCallback(async (): Promise<boolean> => {
    setHardwareError(null);
    setIsClearingDtc(true);
    try {
      const success = await elm327Service.clearDiagnosticTroubleCodes();
      return success;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao limpar códigos de falha';
      setHardwareError(msg);
      return false;
    } finally {
      setIsClearingDtc(false);
    }
  }, []);

  const sendRawCommand = useCallback(async (cmd: string): Promise<string> => {
    return elm327Service.sendCommand(cmd);
  }, []);

  return {
    status,
    deviceInfo,
    isHardwareConnected: status === 'CONNECTED',
    isSupported: elm327Service.isSupported(),
    logs,
    isScanningDtc,
    isClearingDtc,
    hardwareError,
    setHardwareError,
    connect,
    disconnect,
    scanDtc,
    clearDtc,
    sendRawCommand,
  };
}
