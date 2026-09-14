import React, { useState } from 'react';
import {
  X,
  History,
  Calendar,
  Car,
  FileText,
  Printer,
  Trash2,
  Search,
  ShieldCheck,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { SavedDiagnosticSession } from '../services/historyStorage';

interface DiagnosticHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession?: (session: SavedDiagnosticSession) => void;
}

export const DiagnosticHistoryModal: React.FC<DiagnosticHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSession,
}) => {
  const { savedSessions, removeSavedSession } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('TODAS');
  const [viewingSession, setViewingSession] = useState<SavedDiagnosticSession | null>(null);

  if (!isOpen) return null;

  // Filtragem de sessões por busca e severidade
  const filteredSessions = savedSessions.filter((s) => {
    const matchesSearch =
      s.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dtcCodes.some((code) => code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.symptoms && s.symptoms.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity =
      selectedSeverity === 'TODAS' || s.report.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRÍTICA':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80';
      case 'ALTA':
        return 'bg-orange-950/80 text-orange-300 border-orange-700/80';
      case 'MÉDIA':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = (session: SavedDiagnosticSession) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `autoscanner_report_${session.vehicle.make}_${session.vehicle.model}_${new Date(
        session.timestamp
      ).toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Histórico de Diagnósticos & Laudos
              </h2>
              <p className="text-xs text-slate-400">
                {savedSessions.length} diagnóstico(s) salvo(s) localmente no navegador
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

        {/* Corpo: Lista de Sessões vs Visualização Detalhada do Laudo */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Coluna Esquerda: Lista e Filtros */}
          <div className={`space-y-4 ${viewingSession ? 'md:col-span-5' : 'md:col-span-12'}`}>
            {/* Barra de Busca e Filtros */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por veículo, código DTC ou sintoma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Filtros Rápidos de Gravidade */}
              <div className="flex flex-wrap gap-1.5">
                {['TODAS', 'CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA'].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all border ${
                      selectedSeverity === sev
                        ? 'bg-slate-800 text-cyan-300 border-cyan-500'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Listagem de Itens */}
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-400">Nenhum laudo encontrado</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Execute um diagnóstico com IA no painel para gerar e salvar laudos automáticos.
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isSelected = viewingSession?.id === session.id;
                  const dateFormatted = new Date(session.timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={session.id}
                      onClick={() => setViewingSession(session)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Car className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-bold text-slate-100">
                            {session.vehicle.make} {session.vehicle.model} ({session.vehicle.year})
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                            session.report.severity
                          )}`}
                        >
                          {session.report.severity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[11px] font-mono">{dateFormatted}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-semibold text-slate-300">
                            {session.dtcCodes.length} DTC(s)
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Deseja excluir este laudo do histórico?')) {
                                removeSavedSession(session.id);
                                if (viewingSession?.id === session.id) setViewingSession(null);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                            title="Excluir do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {session.dtcCodes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {session.dtcCodes.slice(0, 4).map((c) => (
                            <span
                              key={c}
                              className="text-[9px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/60 px-1.5 py-0.2 rounded"
                            >
                              {c}
                            </span>
                          ))}
                          {session.dtcCodes.length > 4 && (
                            <span className="text-[9px] text-slate-500">+{session.dtcCodes.length - 4} mais</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Laudo Completo em Detalhes */}
          {viewingSession && (
            <div className="md:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between max-h-[70vh] overflow-y-auto">
              <div>
                {/* Header do Laudo */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {viewingSession.vehicle.make} {viewingSession.vehicle.model} - {viewingSession.vehicle.year}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Quilometragem: {viewingSession.vehicle.mileageKm.toLocaleString()} km • Data:{' '}
                      {new Date(viewingSession.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleExportJson(viewingSession)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Exportar JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Imprimir Laudo"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Resumo e Segurança */}
                <div className="space-y-3 mt-4">
                  <div
                    className={`p-3 rounded-xl border flex items-start space-x-3 ${
                      viewingSession.report.safetyAssessment.isSafeToDrive
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                    }`}
                  >
                    {viewingSession.report.safetyAssessment.isSafeToDrive ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {viewingSession.report.safetyAssessment.isSafeToDrive
                          ? 'Seguro para Condução Cautelosa'
                          : 'Risco de Danos Severos - Pare o Veículo'}
                      </div>
                      <p className="text-xs mt-0.5 text-slate-300">
                        {viewingSession.report.safetyAssessment.safetyNote}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-100 block mb-1">Parecer Técnico da IA:</strong>
                    {viewingSession.report.summary}
                  </div>

                  {/* Causas Prováveis */}
                  {viewingSession.report.probableCauses.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                        Causas Prováveis
                      </h4>
                      <div className="space-y-1.5">
                        {viewingSession.report.probableCauses.map((pc, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-200">{pc.cause}</span>
                            <span className="font-mono font-bold text-cyan-400">{pc.probability}% prob.</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimativa de Custos */}
                  {viewingSession.report.costEstimate && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estimativa de Reparo:</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        R$ {viewingSession.report.costEstimate.minCost} - R${' '}
                        {viewingSession.report.costEstimate.maxCost}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ação de Carregar no Painel Principal */}
              {onSelectSession && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectSession(viewingSession);
                    onClose();
                  }}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-900/40 mt-3"
                >
                  Carregar Este Diagnóstico no Painel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
