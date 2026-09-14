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

  // Simulação de oscilações naturais de telemetria automotiva em tempo real
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // Leve flutuação de RPM em marcha lenta (+/- 30 rpm)
      const rpmNoise = Math.floor((Math.random() - 0.5) * 40);
      const newRpm = Math.max(750, Math.min(telemetry.rpm + rpmNoise, 6500));

      // Leve oscilação de voltagem (+/- 0.05V)
      const voltNoise = Math.round((Math.random() - 0.5) * 10) / 100;
      const newVolt = Number(Math.max(11.8, Math.min(telemetry.batteryVoltage + voltNoise, 14.6)).toFixed(2));

      // Oscilação de pressão de combustível
      const fuelNoise = Math.round((Math.random() - 0.5) * 4) / 100;
      const newFuel = Number(Math.max(2.8, Math.min(telemetry.fuelPressureBar + fuelNoise, 4.5)).toFixed(2));

      updateTelemetry({
        rpm: newRpm,
        batteryVoltage: newVolt,
        fuelPressureBar: newFuel,
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLiveStreaming, telemetry.rpm, telemetry.batteryVoltage, telemetry.fuelPressureBar, updateTelemetry]);

  return {
    telemetry,
    isLiveStreaming,
    updateTelemetry,
    toggleLiveStreaming,
    setTelemetry,
  };
}
