import { useEffect } from 'react';
import type { SensorTelemetry } from '../types/scanner';
import { useAppStore } from '../store/useAppStore';

export function useTelemetry(initialTelemetry?: SensorTelemetry) {
  const {
    telemetry,
    isLiveStreaming,
    updateTelemetry,
    setTelemetry,
    toggleLiveStreaming,
  } = useAppStore();

  // Se inicializado com telemetria personalizada
  useEffect(() => {
    if (initialTelemetry) {
      setTelemetry(initialTelemetry);
    }
  }, [initialTelemetry, setTelemetry]);


  return {
    telemetry,
    isLiveStreaming,
    updateTelemetry,
    toggleLiveStreaming,
    setTelemetry,
  };
}
