import React from 'react';
import {
  Cpu,
  Sparkles,
  RefreshCw,
  Zap,
  Binary,
  CheckCircle2,
  Bluetooth,
  Terminal,
  Trash2,
  Radio,
  Snowflake,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface ScannerControlProps {
  isScanningEcu: boolean;
  isAnalyzingAi: boolean;
  isHardwareConnected: boolean;
  hardwareVersion: string | null;
  protocolInfo: string | null;
  vinInfo: string | null;
  selectedCodesCount: number;
  onScanEcu: () => void;
  onDiagnoseAi: () => void;
  onOpenHardwareModal: () => void;
  onOpenTerminal: () => void;
  onOpenClearModal: () => void;
  onOpenFreezeFrame: () => void;
  onOpenEmissions: () => void;
  onOpenPredictive: () => void;
}

export const ScannerControl: React.FC<ScannerControlProps> = ({
  isScanningEcu,
  isAnalyzingAi,
  isHardwareConnected,
  hardwareVersion,
  protocolInfo,
  vinInfo,
  selectedCodesCount,
  onScanEcu,
  onDiagnoseAi,
  onOpenHardwareModal,
  onOpenTerminal,
  onOpenClearModal,
  onOpenFreezeFrame,
  onOpenEmissions,
  onOpenPredictive,
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-200 uppercase tracking-wide">
              Interface do Scanner OBD-II
            </h2>
          </div>

          {/* Badge de Modo */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
              isHardwareConnected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900 text-cyan-300 border-slate-750'
            }`}
          >
            {isHardwareConnected ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>ELM327 FÍSICO</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>MODO SIMULAÇÃO</span>
              </>
            )}
          </div>
        </div>

        {/* Informações da ECU conectada */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center">
              <Bluetooth className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Interface / Chip:
            </span>
            <span className="font-mono text-slate-200 font-semibold truncate max-w-[200px]">
              {isHardwareConnected ? hardwareVersion || 'ELM327 Bluetooth' : 'Simulador Virtual CAN'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center">
              <Binary className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Protocolo OBD-II:
            </span>
            <span className="font-mono text-cyan-300 font-semibold truncate max-w-[200px]">
              {protocolInfo || 'ISO 15765-4 CAN (500 kbps)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Chassi / VIN:
            </span>
            <span className="font-mono text-slate-200 font-medium tracking-wider">
              {vinInfo || (isHardwareConnected ? 'Lendo ECU...' : '9BWCA45U7FP001824')}
            </span>
          </div>
        </div>

        {/* Status das falhas detectadas e atalhos de ferramentas */}
        <div className="flex items-center justify-between px-1 mb-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Falhas Selecionadas:</span>
            <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              {selectedCodesCount} código(s)
            </span>
          </div>

          {/* Botão para Terminal OBD */}
          <button
            type="button"
            onClick={onOpenTerminal}
            className="flex items-center space-x-1 text-slate-400 hover:text-cyan-300 font-mono transition-colors"
            title="Abrir Terminal Serial OBD-II para envio manual de comandos AT"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Terminal Serial</span>
          </button>
        </div>
      </div>

      {/* Ações principais */}
      <div className="space-y-2.5">
        {/* Ferramentas Avançadas OBD-II (Sprint 2: Freeze Frame & Emissões) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenFreezeFrame}
            className="py-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-700/60 text-slate-300 hover:text-sky-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            title="Visualizar snapshot dos sensores no instante da falha (Modo 02)"
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">Freeze Frame (02)</span>
          </button>

          <button
            type="button"
            onClick={onOpenEmissions}
            className="py-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            title="Verificar se os monitores estão prontos para inspeção veicular (PID 0101)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Prontidão (I/M)</span>
          </button>
        </div>

        {/* Botão de Conectar Hardware Físico Bluetooth */}
        <button
          type="button"
          onClick={onOpenHardwareModal}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all cursor-pointer shadow-md ${
            isHardwareConnected
              ? 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border-emerald-700/60'
              : 'bg-slate-800/90 hover:bg-slate-750 text-cyan-300 border-cyan-800/50 hover:border-cyan-500'
          }`}
        >
          <Bluetooth className="w-4 h-4 text-cyan-400" />
          <span>
            {isHardwareConnected
              ? 'Scanner Físico Conectado • Configurações'
              : 'Conectar Scanner Bluetooth (ELM327)'}
          </span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Botão de Varredura da ECU */}
          <button
            type="button"
            onClick={onScanEcu}
            disabled={isScanningEcu || isAnalyzingAi}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-semibold text-xs flex items-center justify-center space-x-2 border border-slate-700 hover:border-cyan-500/60 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isScanningEcu ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Lendo ECU...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {isHardwareConnected ? 'Ler Falhas Reais da ECU' : 'Varredura Simulada'}
                </span>
              </>
            )}
          </button>

          {/* Botão de Limpeza de Falhas (Modo 04) */}
          <button
            type="button"
            onClick={onOpenClearModal}
            disabled={isScanningEcu || isAnalyzingAi || selectedCodesCount === 0}
            className="py-2.5 px-3 rounded-xl bg-slate-850 hover:bg-rose-950/40 text-rose-300 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-slate-750 hover:border-rose-700/60 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Limpar memória de falhas da ECU e apagar luz de injeção (Modo 04)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Apagar Falhas (Modo 04)</span>
          </button>
        </div>

        {/* Botão de Manutenção Preditiva (Gemini AI - Séries Temporais) */}
        <button
          type="button"
          onClick={onOpenPredictive}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-700/60 text-indigo-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Análise Preditiva de Tendências (IA Gemini)</span>
        </button>

        {/* Botão Principal: Diagnóstico Inteligente Gemini */}
        <button
          type="button"
          onClick={onDiagnoseAi}
          disabled={isScanningEcu || isAnalyzingAi || selectedCodesCount === 0}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-cyan-400/30"
        >
          {isAnalyzingAi ? (
            <>
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
              <span>Gerando Laudo com Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>Diagnosticar com Google Gemini AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
