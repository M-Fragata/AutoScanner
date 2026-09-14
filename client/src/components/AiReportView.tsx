import React from 'react';
import {
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import type { FullDiagnosticResult } from '../types/scanner';

interface AiReportViewProps {
  result: FullDiagnosticResult;
  onReset: () => void;
}

export const AiReportView: React.FC<AiReportViewProps> = ({ result, onReset }) => {
  const { aiReport, vehicle, dtcCodes } = result;

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRÍTICA':
        return {
          badge: 'bg-rose-950/80 text-rose-300 border-rose-600/80 shadow-rose-900/40',
          border: 'border-rose-700/50',
          glow: 'from-rose-500/10',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
        };
      case 'ALTA':
        return {
          badge: 'bg-amber-950/80 text-amber-300 border-amber-600/80 shadow-amber-900/40',
          border: 'border-amber-700/50',
          glow: 'from-amber-500/10',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case 'MÉDIA':
        return {
          badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-600/80 shadow-yellow-900/40',
          border: 'border-yellow-700/50',
          glow: 'from-yellow-500/10',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        };
      default:
        return {
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 shadow-emerald-900/40',
          border: 'border-emerald-700/50',
          glow: 'from-emerald-500/10',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        };
    }
  };

  const severityStyle = getSeverityStyle(aiReport.severity);

  return (
    <div
      className={`glass-panel-glow rounded-3xl p-6 sm:p-8 border ${severityStyle.border} shadow-2xl relative overflow-hidden transition-all`}
    >
      {/* Background ambient gradient */}
      <div
        className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-b ${severityStyle.glow} to-transparent rounded-full blur-3xl pointer-events-none`}
      />

      {/* Header do Laudo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Laudo Técnico de Inteligência Artificial
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Diagnóstico emitido para <span className="font-semibold text-slate-200">{vehicle.make} {vehicle.model}</span> ({vehicle.year}) • {vehicle.mileageKm.toLocaleString('pt-BR')} KM
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Badge de Severidade */}
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-lg ${severityStyle.badge}`}
          >
            {severityStyle.icon}
            <span>SEVERIDADE {aiReport.severity}</span>
          </div>

          <button
            onClick={onReset}
            type="button"
            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Realizar nova análise"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta de Segurança & Dirigibilidade */}
      <div
        className={`my-6 p-4 sm:p-5 rounded-2xl border flex items-start space-x-3.5 ${
          aiReport.safetyAssessment.isSafeToDrive
            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {aiReport.safetyAssessment.isSafeToDrive ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          ) : (
            <AlertOctagon className="w-6 h-6 text-rose-400 animate-pulse" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-1">
            {aiReport.safetyAssessment.isSafeToDrive
              ? 'Condição Segura para Condução com Cautela'
              : 'ATENÇÃO: Não Recomendado Rodar com o Veículo'}
          </h3>
          <p className="text-sm opacity-90 leading-relaxed">
            {aiReport.safetyAssessment.safetyNote}
          </p>
        </div>
      </div>

      {/* Resumo do Diagnóstico */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
          <Cpu className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
          Síntese do Engenheiro Mecânico Virtual
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed">
          {aiReport.summary}
        </p>
      </div>

      {/* Grid com Causas Prováveis e Estimativa de Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Causas Prováveis (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-400" />
            Causas Raízes Mais Prováveis
          </h4>
          <div className="space-y-3">
            {aiReport.probableCauses.map((cause, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-200">{cause.cause}</span>
                  <span className="font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    {cause.probability}% probabilidade
                  </span>
                </div>
                {/* Progress bar de probabilidade */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cause.probability}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{cause.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Estimativa de Custos e Sistemas Afetados (1 col) */}
        <div className="space-y-4">
          {/* Card de Custo */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-1.5 text-emerald-400" />
              Estimativa Média de Reparo
            </h4>
            <div className="mb-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-digital text-emerald-300">
                R$ {aiReport.costEstimate.minCost.toLocaleString('pt-BR')} - {aiReport.costEstimate.maxCost.toLocaleString('pt-BR')}
              </div>
              <span className="text-[11px] text-slate-400">Peças e mão de obra estimada</span>
            </div>
            <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
              {aiReport.costEstimate.partsDescription}
            </p>
          </div>

          {/* Sistemas Afetados */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-indigo-400" />
              Sistemas Afetados
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {aiReport.affectedSystems.map((sys, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-800/50"
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Roteiro Passo a Passo de Diagnóstico & Reparo */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 mb-6">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center">
          <Wrench className="w-4 h-4 mr-1.5 text-cyan-400" />
          Roteiro Técnico Recomendado para Reparo
        </h4>
        <div className="space-y-3">
          {aiReport.recommendedActions.map((action) => (
            <div
              key={action.stepNumber}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col sm:flex-row sm:items-start gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center justify-center text-xs font-bold shrink-0">
                {action.stepNumber}
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-slate-200 mb-1">
                  {action.title}
                </h5>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  {action.action}
                </p>
                {action.requiredTools && action.requiredTools.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Ferramental:
                    </span>
                    {action.requiredTools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhes dos Códigos DTC Envolvidos */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 mb-6">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
          Códigos DTC Catalogados
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dtcCodes.map((dtc) => (
            <div
              key={dtc.code}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {dtc.code}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold uppercase">
                  {dtc.category}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 mb-1">
                {dtc.title}
              </div>
              <p className="text-[11px] text-slate-400">{dtc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer do Laudo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-4 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <span>Fonte do Motor:</span>
          <span className="font-semibold text-cyan-400">
            {aiReport.aiSource === 'google-gemini'
              ? 'Google Generative AI (Gemini 2.5 Flash)'
              : 'Motor Heurístico Especializado Automotivo'}
          </span>
        </div>
        <div>
          <span>Analisado em: </span>
          <span className="font-mono text-slate-400">
            {new Date(aiReport.analyzedAt).toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
};
