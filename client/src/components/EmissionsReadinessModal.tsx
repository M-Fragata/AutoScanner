import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import type { EmissionsReadinessReport } from '../types/scanner';

interface EmissionsReadinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: EmissionsReadinessReport | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const EmissionsReadinessModal: React.FC<EmissionsReadinessModalProps> = ({
  isOpen,
  onClose,
  report,
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
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Prontidão de Emissões (I/M Readiness)
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  Inspeção Veicular
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Status dos monitores ambientais da ECU segundo a norma SAE J1979 / PROCONVE
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
          {!report ? (
            <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Nenhum relatório de prontidão disponível no momento
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Conecte o scanner OBD-II ou execute a consulta para ler o status dos monitores de emissão da centralina.
              </p>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Consultar Monitores (PID 0101)</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Card de Veredito Geral da Inspeção */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  report.verdict === 'APROVADO'
                    ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                    : report.verdict === 'REPROVADO_LUZ_MIL'
                    ? 'bg-rose-950/40 border-rose-700/80 text-rose-200'
                    : 'bg-amber-950/40 border-amber-700/80 text-amber-200'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  {report.verdict === 'APROVADO' ? (
                    <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                  ) : report.verdict === 'REPROVADO_LUZ_MIL' ? (
                    <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      Resultado para Inspeção de Emissões
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {report.verdict === 'APROVADO'
                        ? 'APTO / APROVADO'
                        : report.verdict === 'REPROVADO_LUZ_MIL'
                        ? 'REPROVADO: LUZ DE INJEÇÃO ACESA'
                        : 'REPROVADO: MONITORES INCOMPLETOS'}
                    </div>
                    <p className="text-xs mt-1 text-slate-300 max-w-xl">{report.summary}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Luz de Injeção</span>
                    <div
                      className={`text-xs font-bold ${
                        report.milStatus ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                      }`}
                    >
                      {report.milStatus ? 'ACESO (MIL ON)' : 'APAGADA (MIL OFF)'}
                    </div>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Falhas na ECU</span>
                    <div className="text-xs font-mono font-bold text-slate-200">
                      {report.dtcCount} DTC(s)
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid dos 8 Monitores de Emissões */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Checklist dos Monitores Ambientais (OBD-II)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.monitors.map((mon) => (
                    <div
                      key={mon.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between space-x-3 ${
                        !mon.supported
                          ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                          : mon.ready
                          ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                          : 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                          <span>{mon.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{mon.description}</p>
                      </div>

                      <div className="shrink-0 flex items-center space-x-1">
                        {!mon.supported ? (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                            <HelpCircle className="w-3 h-3" />
                            <span>N/A</span>
                          </span>
                        ) : mon.ready ? (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/80 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>PRONTO</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/80 flex items-center space-x-1">
                            <XCircle className="w-3 h-3 text-amber-400" />
                            <span>INCOMPLETO</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">SAE J1979 PID 0101 • Vistoria Veicular</span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Reconsultar Monitores</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
