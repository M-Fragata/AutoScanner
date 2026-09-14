import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Thermometer,
  BatteryCharging,
  Fuel,
  Wind,
  Play,
  Pause,
  Radio,
  LineChart as LineChartIcon,
  LayoutGrid,
  Circle,
  Download,
  Sliders,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CircularGauge } from './gauges/CircularGauge';
import { TelemetryChart } from './gauges/TelemetryChart';
import { dataLogger } from '../services/dataLogger';
import { customPidService } from '../services/customPidService';

import type { SensorTelemetry } from '../types/scanner';

interface TelemetryDisplayProps {
  telemetry?: SensorTelemetry;
  isLiveStreaming?: boolean;
  onToggleStreaming?: () => void;
  onOpenHud?: () => void;
  onOpenCustomPids?: () => void;
}

export const TelemetryDisplay: React.FC<TelemetryDisplayProps> = ({
  onToggleStreaming,
  onOpenHud,
  onOpenCustomPids,
}) => {
  const {
    telemetry,
    telemetryHistory,
    viewMode,
    setViewMode,
    isLiveStreaming,
    toggleLiveStreaming: storeToggleStreaming,
  } = useAppStore();

  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [sampleCount, setSampleCount] = useState<number>(0);

  // Escuta atualizações do dataLogger
  useEffect(() => {
    dataLogger.onStateChange = (recording, count) => {
      setIsLogging(recording);
      setSampleCount(count);
    };
  }, []);

  // Adiciona amostra de telemetria sempre que os sensores atualizarem durante gravação
  useEffect(() => {
    if (isLogging) {
      dataLogger.addSample(telemetry);
    }
  }, [telemetry, isLogging]);

  const handleStartLogging = () => {
    dataLogger.startLogging();
    dataLogger.addSample(telemetry);
  };

  const handleStopAndExport = () => {
    dataLogger.stopLogging();
    dataLogger.exportToCsv();
  };

  const handleToggle = () => {
    if (onToggleStreaming) {
      onToggleStreaming();
    } else {
      storeToggleStreaming();
    }
  };

  // Helpers de estilo para o modo de cards sintéticos
  const getCoolantColor = (temp: number) => {
    if (temp < 75) return 'text-sky-400 border-sky-500/30 bg-sky-950/20';
    if (temp <= 100) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (temp <= 108) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/20 animate-pulse';
  };

  const getBatteryColor = (volts: number) => {
    if (volts < 12.2) return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
    if (volts <= 14.5) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
  };

  const rpmPercent = Math.min(100, Math.round((telemetry.rpm / 7000) * 100));

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Barra de Ferramentas da Telemetria: Título, Modos de Exibição e Play/Pause */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Radio className={`w-4 h-4 ${isLiveStreaming ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <h2 className="text-base font-bold text-slate-200 tracking-wide uppercase">
            Telemetria Automotiva em Tempo Real
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Seletor de Modo de Visualização */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('GAUGES')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'GAUGES'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Manômetros Automotivos Esportivos"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manômetros</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('CHARTS')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'CHARTS'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Gráfico Temporal em Onda (Osciloscópio)"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Onda / Gráficos</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cards Digitais Sintéticos"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          {/* Botão de Data Logging (CSV) */}
          {!isLogging ? (
            <button
              type="button"
              onClick={handleStartLogging}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border bg-slate-900/90 text-slate-300 border-slate-800 hover:border-cyan-500/60 hover:text-cyan-300 cursor-pointer shadow-sm"
              title="Iniciar gravação contínua da viagem para exportação em planilha CSV"
            >
              <Circle className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
              <span className="hidden sm:inline">Gravar CSV</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopAndExport}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border bg-rose-950/80 text-rose-200 border-rose-700 hover:bg-rose-900 cursor-pointer shadow-md shadow-rose-950/50 animate-pulse"
              title="Clique para parar a gravação e baixar o arquivo CSV"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Gravando ({sampleCount}) • Baixar CSV</span>
            </button>
          )}

          {/* Botão Modo HUD Cockpit */}
          {onOpenHud && (
            <button
              type="button"
              onClick={onOpenHud}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60 cursor-pointer shadow-sm shadow-emerald-950/40"
              title="Abrir Modo HUD Head-Up Display em tela cheia para para-brisa"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">HUD</span>
            </button>
          )}

          {/* Botão Play / Pause Streaming */}
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
              isLiveStreaming
                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700/50 hover:bg-cyan-900/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={isLiveStreaming ? 'Pausar leitura de sensores' : 'Retomar leitura de sensores'}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Ao Vivo</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Pausado</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Renderização Condicional por Modo */}
      {viewMode === 'GAUGES' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Manômetro Tacômetro (RPM) */}
          <CircularGauge
            value={telemetry.rpm}
            min={0}
            max={7000}
            label="Rotação"
            unit="RPM"
            colorScheme="cyan"
            warningThreshold={4500}
            dangerThreshold={5800}
            size={160}
            subtitle="Tacômetro"
          />

          {/* Manômetro Velocímetro (VSS) */}
          <CircularGauge
            value={telemetry.vehicleSpeedKmh}
            min={0}
            max={220}
            label="Velocidade"
            unit="km/h"
            colorScheme="purple"
            size={160}
            subtitle="Sensor VSS"
          />

          {/* Manômetro Temperatura Líquido Arrefecimento (ECT) */}
          <CircularGauge
            value={telemetry.coolantTempC}
            min={40}
            max={120}
            label="Arrefecimento"
            unit="°C"
            colorScheme="emerald"
            warningThreshold={100}
            dangerThreshold={108}
            size={160}
            subtitle={telemetry.coolantTempC > 105 ? 'Superaquecendo' : 'Faixa ideal: 85-98°C'}
          />

          {/* Manômetro Tensão Bateria / Alternador */}
          <CircularGauge
            value={telemetry.batteryVoltage}
            min={10}
            max={16}
            decimals={1}
            label="Bateria / Alt."
            unit="V"
            colorScheme="amber"
            warningThreshold={12.0}
            dangerThreshold={11.5}
            size={160}
            subtitle={telemetry.batteryVoltage >= 13.5 ? 'Alternador Ativo' : 'Carga Baixa'}
          />

          {/* Manômetro Pressão de Linha de Combustível */}
          <CircularGauge
            value={telemetry.fuelPressureBar}
            min={0}
            max={6}
            decimals={1}
            label="Pressão Comb."
            unit="bar"
            colorScheme="emerald"
            size={160}
            subtitle="Linha Regulada"
          />

          {/* Manômetro Temperatura Ar de Admissão (IAT) */}
          <CircularGauge
            value={telemetry.intakeTempC}
            min={10}
            max={70}
            label="Ar Admissão"
            unit="°C"
            colorScheme="indigo"
            warningThreshold={55}
            dangerThreshold={65}
            size={160}
            subtitle="Sensor IAT"
          />
        </div>
      )}

      {viewMode === 'CHARTS' && (
        <TelemetryChart history={telemetryHistory} />
      )}

      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* RPM Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Rotação</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-digital text-cyan-300 tracking-wider">
                {telemetry.rpm}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">RPM</div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.rpm > 5500 ? 'bg-rose-500' : telemetry.rpm > 3500 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${rpmPercent}%` }}
              />
            </div>
          </div>

          {/* Temperatura Líquido Arrefecimento Card */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${getCoolantColor(telemetry.coolantTempC)}`}>
            <div className="flex items-center justify-between opacity-80 mb-1">
              <span className="text-xs font-semibold uppercase">Líquido Arref.</span>
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-bold font-digital tracking-wider">
                {telemetry.coolantTempC}°C
              </div>
              <div className="text-[10px] opacity-75 font-medium">
                {telemetry.coolantTempC > 105 ? 'SUPERQUECENDO' : 'Normal'}
              </div>
            </div>
            <div className="text-[9px] opacity-60 mt-2">Faixa ideal: 85° - 100°C</div>
          </div>

          {/* Bateria Card */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${getBatteryColor(telemetry.batteryVoltage)}`}>
            <div className="flex items-center justify-between opacity-80 mb-1">
              <span className="text-xs font-semibold uppercase">Bateria / Alt.</span>
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-bold font-digital tracking-wider">
                {telemetry.batteryVoltage.toFixed(1)}V
              </div>
              <div className="text-[10px] opacity-75 font-medium">
                {telemetry.batteryVoltage >= 13.5 ? 'Alternador Carregando' : 'Abaixo do Padrão'}
              </div>
            </div>
            <div className="text-[9px] opacity-60 mt-2">Faixa ideal: 13.5 - 14.4V</div>
          </div>

          {/* Pressão Combustível Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Pressão Comb.</span>
              <Fuel className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-digital text-emerald-300 tracking-wider">
                {telemetry.fuelPressureBar.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">BAR (Linha)</div>
            </div>
            <div className="text-[9px] text-slate-400 mt-2">Pressão regulada</div>
          </div>

          {/* Temperatura Admissão Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Ar Admissão</span>
              <Wind className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-digital text-indigo-300 tracking-wider">
                {telemetry.intakeTempC}°C
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Sensor IAT</div>
            </div>
            <div className="text-[9px] text-slate-400 mt-2">Fluxo coletor</div>
          </div>

          {/* Velocidade Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Velocidade</span>
              <Gauge className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-digital text-purple-300 tracking-wider">
                {telemetry.vehicleSpeedKmh}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">KM/H (VSS)</div>
            </div>
            <div className="text-[9px] text-slate-400 mt-2">Sensor de velocidade</div>
          </div>
        </div>
      )}

      {/* PIDs Customizados Ativos na Telemetria */}
      {customPidService.getEnabledPids().length > 0 && (
        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Sensores Customizados:
            </span>
            <div className="flex flex-wrap gap-2">
              {customPidService.getEnabledPids().map((pid) => (
                <div
                  key={pid.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-purple-900/50 flex items-center space-x-1.5 font-mono"
                >
                  <span className="text-[10px] text-slate-400">{pid.name}:</span>
                  <span className="font-extrabold text-purple-300">
                    {pid.lastValue !== undefined ? pid.lastValue : '--'} {pid.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {onOpenCustomPids && (
            <button
              type="button"
              onClick={onOpenCustomPids}
              className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              Configurar PIDs →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
