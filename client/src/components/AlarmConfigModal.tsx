import React, { useState } from 'react';
import { X, Bell, Volume2, VolumeX, Check, RefreshCw } from 'lucide-react';
import { alarmManager } from '../services/alarmManager';
import { audioAlerts } from '../services/audioAlerts';
import type { AlarmConfig } from '../types/scanner';

interface AlarmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const AlarmConfigModal: React.FC<AlarmConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<AlarmConfig>(alarmManager.getConfig());
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    alarmManager.saveConfig(config);
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleTestSound = () => {
    audioAlerts.playDangerAlert();
    setTestStatus('Alarme disparado!');
    setTimeout(() => setTestStatus(null), 2000);
  };

  const handleResetDefaults = () => {
    const defaults = alarmManager.saveConfig({
      coolantHighThreshold: 102,
      coolantDangerThreshold: 108,
      batteryLowThreshold: 11.8,
      batteryHighThreshold: 15.0,
      rpmRedlineThreshold: 5800,
      soundEnabled: true,
    });
    setConfig(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Configuração de Alarmes & Limiares
              </h2>
              <p className="text-xs text-slate-400">
                Ajuste os limites de segurança para emissão de alertas visuais e sonoros
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo de Configurações */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Toggle de Alerta Sonoro */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {config.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="text-sm font-bold text-slate-200">Síntese Sonora de Alarme</div>
                <p className="text-xs text-slate-400">
                  Emite bips automotivos sintetizados no alto-falante via Web Audio API
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTestSound}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 border border-slate-700 transition-colors"
              >
                {testStatus || 'Testar Som'}
              </button>

              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  config.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    config.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Limiares de Temperatura */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Temperatura do Arrefecimento (°C)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-400 font-semibold">Alerta Inicial</span>
                  <span className="font-mono font-bold text-slate-200">{config.coolantHighThreshold}°C</span>
                </div>
                <input
                  type="range"
                  min="95"
                  max="110"
                  value={config.coolantHighThreshold}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, coolantHighThreshold: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-rose-400 font-semibold">Perigo Crítico</span>
                  <span className="font-mono font-bold text-slate-200">{config.coolantDangerThreshold}°C</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="120"
                  value={config.coolantDangerThreshold}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, coolantDangerThreshold: Number(e.target.value) }))
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Limiares de Tensão da Bateria */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tensão da Bateria & Alternador (V)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-400 font-semibold">Subtensão (Descarga)</span>
                  <span className="font-mono font-bold text-slate-200">{config.batteryLowThreshold.toFixed(1)}V</span>
                </div>
                <input
                  type="range"
                  step="0.1"
                  min="10.5"
                  max="12.5"
                  value={config.batteryLowThreshold}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, batteryLowThreshold: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-rose-400 font-semibold">Sobretensão (Alternador)</span>
                  <span className="font-mono font-bold text-slate-200">{config.batteryHighThreshold.toFixed(1)}V</span>
                </div>
                <input
                  type="range"
                  step="0.1"
                  min="14.5"
                  max="16.5"
                  value={config.batteryHighThreshold}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, batteryHighThreshold: Number(e.target.value) }))
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Limite de Rotação (Shift Light) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Alerta de Corte de Giro (RPM Redline)
              </span>
              <span className="font-mono font-bold text-rose-400">{config.rpmRedlineThreshold} RPM</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <input
                type="range"
                step="100"
                min="4000"
                max="7500"
                value={config.rpmRedlineThreshold}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, rpmRedlineThreshold: Number(e.target.value) }))
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-900/40 flex items-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Limiares</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
