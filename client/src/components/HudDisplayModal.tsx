import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  Zap,
  Gauge,
  Thermometer,
  Fuel,
  BatteryCharging,
} from 'lucide-react';
import type { SensorTelemetry } from '../types/scanner';
import type { ActiveAlarmViolation } from '../services/alarmManager';
import { customPidService } from '../services/customPidService';

interface HudDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: SensorTelemetry;
  activeViolations?: ActiveAlarmViolation[];
}

type HudColorTheme = 'green' | 'cyan' | 'amber' | 'red';

export const HudDisplayModal: React.FC<HudDisplayModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  activeViolations = [],
}) => {
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<HudColorTheme>('green');

  // Suporte a tecla Escape e atalhos
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key.toLowerCase() === 'm') {
        setIsMirrored((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Listener de alteração do modo tela cheia pelo navegador
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!isOpen) return null;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignora restrições do navegador
    }
  };

  // Cores dinâmicas segundo o tema selecionado
  const getThemeClasses = () => {
    switch (theme) {
      case 'green':
        return {
          primaryText: 'text-emerald-400',
          secondaryText: 'text-emerald-500',
          accentBg: 'bg-emerald-500',
          border: 'border-emerald-500/40',
          glow: 'drop-shadow-[0_0_25px_rgba(52,211,153,0.6)]',
          barGradient: 'from-emerald-600 via-emerald-400 to-amber-400',
        };
      case 'cyan':
        return {
          primaryText: 'text-cyan-400',
          secondaryText: 'text-cyan-500',
          accentBg: 'bg-cyan-500',
          border: 'border-cyan-500/40',
          glow: 'drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]',
          barGradient: 'from-cyan-600 via-cyan-400 to-amber-400',
        };
      case 'amber':
        return {
          primaryText: 'text-amber-400',
          secondaryText: 'text-amber-500',
          accentBg: 'bg-amber-500',
          border: 'border-amber-500/40',
          glow: 'drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]',
          barGradient: 'from-amber-600 via-amber-400 to-red-500',
        };
      case 'red':
        return {
          primaryText: 'text-rose-500',
          secondaryText: 'text-rose-600',
          accentBg: 'bg-rose-500',
          border: 'border-rose-500/40',
          glow: 'drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]',
          barGradient: 'from-rose-700 via-rose-500 to-amber-300',
        };
    }
  };

  const currentTheme = getThemeClasses();
  const enabledCustomPids = customPidService.getEnabledPids();

  // Cálculo da porcentagem do tacômetro (0 a 8000 RPM)
  const rpmPercent = Math.min(Math.max((telemetry.rpm / 8000) * 100, 0), 100);
  const isRedline = telemetry.rpm >= 5800;
  const hasCriticalAlarm = activeViolations.some((v) => v.severity === 'DANGER');

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black select-none overflow-hidden flex flex-col justify-between ${
        hasCriticalAlarm ? 'border-8 border-rose-600 animate-pulse' : ''
      }`}
    >
      {/* Barra Superior de Controles (Não espelhada para fácil toque) */}
      <div className="w-full flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-zinc-900 z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Gauge className={`w-5 h-5 ${currentTheme.primaryText}`} />
            <span className={`text-sm font-black tracking-widest uppercase ${currentTheme.primaryText}`}>
              Modo HUD Cockpit
            </span>
          </div>

          <span className="hidden sm:inline text-xs text-zinc-500 font-mono">
            {isMirrored ? 'Espelhamento Para-brisa Ativo' : 'Visualização Direta'}
          </span>
        </div>

        {/* Controles de Configuração do HUD */}
        <div className="flex items-center space-x-2">
          {/* Alternador de Espelhamento */}
          <button
            type="button"
            onClick={() => setIsMirrored((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isMirrored
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-md shadow-zinc-900'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Espelhar horizontalmente para refletir no para-brisa à noite (Atalho: M)"
          >
            <FlipHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">
              {isMirrored ? 'Espelhado (Para-brisa)' : 'Espelhar'}
            </span>
          </button>

          {/* Seletor de Cores Neon */}
          <div className="flex items-center space-x-1 bg-zinc-900 px-2 py-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setTheme('green')}
              className={`w-4 h-4 rounded-full bg-emerald-500 transition-transform ${
                theme === 'green' ? 'scale-125 ring-2 ring-white' : 'opacity-60'
              }`}
              title="Tema Verde Neon"
            />
            <button
              type="button"
              onClick={() => setTheme('cyan')}
              className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${
                theme === 'cyan' ? 'scale-125 ring-2 ring-white' : 'opacity-60'
              }`}
              title="Tema Ciano Elétrico"
            />
            <button
              type="button"
              onClick={() => setTheme('amber')}
              className={`w-4 h-4 rounded-full bg-amber-400 transition-transform ${
                theme === 'amber' ? 'scale-125 ring-2 ring-white' : 'opacity-60'
              }`}
              title="Tema Âmbar Clássico"
            />
            <button
              type="button"
              onClick={() => setTheme('red')}
              className={`w-4 h-4 rounded-full bg-rose-500 transition-transform ${
                theme === 'red' ? 'scale-125 ring-2 ring-white' : 'opacity-60'
              }`}
              title="Tema Vermelho Esportivo"
            />
          </div>

          {/* Alternador Tela Cheia */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            title="Modo Tela Cheia (Atalho: F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Fechar HUD */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            title="Sair do Modo HUD (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área Central de Projeção (Sujeita a transform: scaleX(-1) quando isMirrored = true) */}
      <div
        className={`flex-1 flex flex-col justify-center items-center px-4 py-8 transition-transform duration-300 ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
      >
        {/* Velocímetro Digital Monstruoso */}
        <div className="flex flex-col items-center justify-center my-auto text-center">
          <div className="flex items-baseline justify-center">
            <span
              className={`font-mono font-black text-9xl sm:text-[14rem] leading-none tracking-tighter tabular-nums ${currentTheme.primaryText} ${currentTheme.glow}`}
            >
              {Math.round(telemetry.vehicleSpeedKmh)}
            </span>
          </div>
          <span
            className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-widest mt-2 uppercase ${currentTheme.secondaryText}`}
          >
            KM / H
          </span>
        </div>

        {/* Régua de Tacômetro (RPM) com Shift-Light */}
        <div className="w-full max-w-4xl px-4 my-6">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 mb-1.5">
            <span className="flex items-center space-x-1.5">
              <Zap className={`w-4 h-4 ${isRedline ? 'text-rose-500 animate-bounce' : currentTheme.primaryText}`} />
              <span>ROTAÇÃO DO MOTOR</span>
            </span>
            <span className={`text-sm font-black tabular-nums ${isRedline ? 'text-rose-400 animate-pulse' : currentTheme.primaryText}`}>
              {Math.round(telemetry.rpm)} RPM
            </span>
          </div>

          {/* Barra de Progresso Dinâmica */}
          <div className="w-full h-5 bg-zinc-900 rounded-xl overflow-hidden p-0.5 border border-zinc-800 relative">
            <div
              className={`h-full rounded-lg transition-all duration-100 bg-gradient-to-r ${currentTheme.barGradient} ${
                isRedline ? 'animate-pulse' : ''
              }`}
              style={{ width: `${rpmPercent}%` }}
            />
            {/* Marcador de Redline aos 5800 RPM (72.5%) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]"
              style={{ left: '72.5%' }}
              title="Corte de Giro (5800 RPM)"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
            <span>0</span>
            <span>2000</span>
            <span>4000</span>
            <span className="text-rose-500 font-bold">5800 (REDLINE)</span>
            <span>8000</span>
          </div>
        </div>

        {/* Grid de Mostradores Secundários de Telemetria */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
          {/* ECT */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center space-x-3">
            <Thermometer className={`w-5 h-5 shrink-0 ${currentTheme.primaryText}`} />
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-500">Arrefecimento</p>
              <p className={`text-lg font-mono font-black tabular-nums ${currentTheme.primaryText}`}>
                {telemetry.coolantTempC}°C
              </p>
            </div>
          </div>

          {/* Bateria */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center space-x-3">
            <BatteryCharging className={`w-5 h-5 shrink-0 ${currentTheme.primaryText}`} />
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-500">Tensão Bateria</p>
              <p className={`text-lg font-mono font-black tabular-nums ${currentTheme.primaryText}`}>
                {telemetry.batteryVoltage.toFixed(1)}V
              </p>
            </div>
          </div>

          {/* Pressão de Combustível */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center space-x-3">
            <Fuel className={`w-5 h-5 shrink-0 ${currentTheme.primaryText}`} />
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-500">Combustível</p>
              <p className={`text-lg font-mono font-black tabular-nums ${currentTheme.primaryText}`}>
                {telemetry.fuelPressureBar.toFixed(1)} bar
              </p>
            </div>
          </div>

          {/* Admissão / IAT ou Carga */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center space-x-3">
            <Gauge className={`w-5 h-5 shrink-0 ${currentTheme.primaryText}`} />
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-500">Temp. Admissão</p>
              <p className={`text-lg font-mono font-black tabular-nums ${currentTheme.primaryText}`}>
                {telemetry.intakeTempC}°C
              </p>
            </div>
          </div>
        </div>

        {/* PIDs Customizados Ativos (se houver) */}
        {enabledCustomPids.length > 0 && (
          <div className="w-full max-w-4xl flex flex-wrap justify-center gap-3 px-4 mt-4">
            {enabledCustomPids.slice(0, 3).map((pid) => (
              <div
                key={pid.id}
                className="px-3.5 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800/80 text-center font-mono"
              >
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">
                  {pid.name}
                </span>
                <span className={`text-sm font-extrabold ${currentTheme.primaryText}`}>
                  {pid.lastValue !== undefined ? pid.lastValue : '--'} {pid.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé Informativo Mínimo */}
      <div className="w-full text-center py-3 bg-zinc-950/80 border-t border-zinc-900 text-[11px] text-zinc-600 font-mono">
        Posicione o dispositivo sob o para-brisa • Pressione <strong className="text-zinc-400">ESC</strong> para sair ou <strong className="text-zinc-400">M</strong> para inverter espelhamento
      </div>
    </div>
  );
};
