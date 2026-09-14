import React from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Wrench,
} from 'lucide-react';
import type { PredictiveReport } from '../types/scanner';

interface PredictiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PredictiveReport | null;
  isLoading: boolean;
  onReanalyze: () => void;
}

export const PredictiveAnalysisModal: React.FC<PredictiveAnalysisModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onReanalyze,
}) => {
  if (!isOpen) return null;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRÍTICO':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-700',
          indicator: 'bg-rose-500',
          title: 'RISCO CRÍTICO DE FALHA MECÂNICA',
        };
      case 'ELEVADO':
        return {
          bg: 'bg-orange-950/80 text-orange-300 border-orange-700',
          indicator: 'bg-orange-500',
          title: 'RISCO ELEVADO DE DESGASTE',
        };
      case 'MODERADO':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700',
          indicator: 'bg-amber-500',
          title: 'DESGASTE PRELIMINAR MODERADO',
        };
      default:
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
          indicator: 'bg-emerald-500',
          title: 'PARÂMETROS SAUDÁVEIS & ESTÁVEIS',
        };
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'ELEVAÇÃO':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      case 'QUEDA':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'FLUTUAÇÃO_ANORMAL':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/60';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Análise Preditiva de Séries Temporais
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  Google Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detecção precoce de anomalias dinâmicas antes do acendimento da luz de injeção MIL
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

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-200">Processando Amostras de Telemetria...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  A IA está calculando gradientes térmicos, ondulações de voltagem e estabilidade de fluxo para detectar tendências de desgaste.
                </p>
              </div>
            </div>
          ) : !report ? (
            <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
              <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Nenhuma análise preditiva executada nesta sessão
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Acione o motor preditivo para enviar a série temporal dos sensores ao Gemini AI.
              </p>
              <button
                type="button"
                onClick={onReanalyze}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-900/30 flex items-center space-x-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Iniciar Análise Preditiva</span>
              </button>
            </div>
          ) : (
            <>
              {/* Nível de Risco e Confiança */}
              {(() => {
                const badge = getRiskBadge(report.wearRiskLevel);
                return (
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${badge.bg}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${badge.indicator} animate-ping`} />
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          Classificação de Desgaste Mecânico
                        </div>
                        <div className="text-base font-bold text-white mt-0.5">{badge.title}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Confiança IA</div>
                        <div className="text-sm font-bold font-digital text-cyan-300">{report.confidenceScore}%</div>
                      </div>
                      <div className="border-l border-slate-800 pl-3">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Amostras</div>
                        <div className="text-sm font-bold font-digital text-slate-200">{report.analyzedSamplesCount}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Resumo Técnico da IA */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parecer Preditivo do Engenheiro de Telemetria:</span>
                </div>
                <p className="leading-relaxed text-slate-200">{report.summary}</p>
              </div>

              {/* Falha Prevista e Janela Temporal */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs uppercase tracking-wide">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <span>Componente com Degradação Precoce</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Janela Prevista: {report.predictedFailure.estimatedTimeToFailure}</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-sm font-bold text-white mb-1">
                    {report.predictedFailure.component}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {report.predictedFailure.description}
                  </p>
                </div>
              </div>

              {/* Tabela de Tendências Anômalas */}
              {report.trends.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Tendências dos Sensores Identificadas na Série Temporal</span>
                  </div>

                  <div className="space-y-2">
                    {report.trends.map((tr, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs font-semibold text-slate-200">{tr.parameter}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTrendBadge(tr.trend)}`}>
                            {tr.trend}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{tr.significance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendações Preventivas */}
              {report.preventiveRecommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ações Preventivas Antes de Disparar a Luz de Injeção</span>
                  </div>

                  <div className="space-y-1.5">
                    {report.preventiveRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Fonte IA: {report?.aiSource || 'google-gemini'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={onReanalyze}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan-900/40 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Recalcular Tendências</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
