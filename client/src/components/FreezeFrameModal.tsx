import React from 'react';
import {
  X,
  Snowflake,
  AlertCircle,
  Gauge,
  Thermometer,
  Activity,
  Fuel,
  Wind,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import type { FreezeFrameData, SensorTelemetry } from '../types/scanner';

interface FreezeFrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  freezeFrame: FreezeFrameData | null;
  currentTelemetry: SensorTelemetry;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const FreezeFrameModal: React.FC<FreezeFrameModalProps> = ({
  isOpen,
  onClose,
  freezeFrame,
  currentTelemetry,
  isLoading = false,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-700/60 flex items-center justify-center text-sky-400">
              <Snowflake className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Freeze Frame (Modo 02 OBD-II)
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/80">
                  Caixa Preta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Snapshot exato dos parâmetros do motor no momento em que a luz da injeção acendeu
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

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!freezeFrame ? (
            <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
              <Snowflake className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Nenhum dado de Freeze Frame registrado ou leitor desconectado
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                O Freeze Frame é gravado pela central eletrônica (ECU) apenas quando um código de anomalia grave (DTC) acende a luz de advertência no painel.
              </p>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-900/30 flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Consultar Modo 02 da ECU</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Banner de DTC Gatilho */}
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-700/60 flex items-center justify-center text-rose-300 font-mono font-bold text-sm">
                    {freezeFrame.triggerDtc}
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-rose-300 tracking-wider">
                      Código Gatilho do Congelamento
                    </div>
                    <div className="text-sm font-semibold text-slate-100">
                      Centralina disparou gravação do quadro de falha
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[11px]">
                    {new Date(freezeFrame.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Tabela de Comparação: Parâmetro no Congelamento vs Parâmetro Atual */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Comparação: Momento da Falha vs Telemetria Atual
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* RPM */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Rotação do Motor</span>
                      <Gauge className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Na Falha</div>
                        <div className="text-lg font-bold font-digital text-cyan-300">
                          {freezeFrame.rpm} <span className="text-xs font-mono text-slate-500">RPM</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Atual</div>
                        <div className="text-sm font-bold font-digital text-slate-300">
                          {currentTelemetry.rpm} <span className="text-[10px] font-mono text-slate-500">RPM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Velocidade */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Velocidade (VSS)</span>
                      <Activity className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Na Falha</div>
                        <div className="text-lg font-bold font-digital text-purple-300">
                          {freezeFrame.vehicleSpeedKmh} <span className="text-xs font-mono text-slate-500">km/h</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Atual</div>
                        <div className="text-sm font-bold font-digital text-slate-300">
                          {currentTelemetry.vehicleSpeedKmh} <span className="text-[10px] font-mono text-slate-500">km/h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Temperatura Líquido Arrefecimento */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Líquido Arrefecimento</span>
                      <Thermometer className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Na Falha</div>
                        <div className="text-lg font-bold font-digital text-emerald-300">
                          {freezeFrame.coolantTempC}°C
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Atual</div>
                        <div className="text-sm font-bold font-digital text-slate-300">
                          {currentTelemetry.coolantTempC}°C
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Carga do Motor */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Carga Calculada</span>
                      <Activity className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Na Falha</div>
                        <div className="text-lg font-bold font-digital text-amber-300">
                          {freezeFrame.engineLoadPercent}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Status</div>
                        <div className="text-xs font-semibold text-slate-300">
                          {freezeFrame.engineLoadPercent > 70 ? 'Alta Demanda' : 'Moderada'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pressão de Combustível */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Pressão de Combustível</span>
                      <Fuel className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Na Falha</div>
                        <div className="text-lg font-bold font-digital text-emerald-300">
                          {freezeFrame.fuelPressureBar.toFixed(1)} bar
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Atual</div>
                        <div className="text-sm font-bold font-digital text-slate-300">
                          {currentTelemetry.fuelPressureBar.toFixed(1)} bar
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Temperatura Ar Admissão */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium">Ar de Admissão (IAT)</span>
                      <Wind className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Na Falha</div>
                        <div className="text-lg font-bold font-digital text-indigo-300">
                          {freezeFrame.intakeTempC}°C
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Atual</div>
                        <div className="text-sm font-bold font-digital text-slate-300">
                          {currentTelemetry.intakeTempC}°C
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informação Técnica de Apoio */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Dica para o Diagnóstico:</strong> Observe se a falha ocorreu em alta carga (aceleração/subida) ou em marcha lenta, e se a temperatura do motor já havia atingido o regime normal de trabalho (85-98°C).
                </p>
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">SAE J1979 Modo 02 • Quadro 00</span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar Modo 02</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
