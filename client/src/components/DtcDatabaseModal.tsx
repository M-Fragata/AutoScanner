import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Plus,
  Check,
  Cpu,
  ShieldAlert,
  Car,
  Network,
  Disc,
} from 'lucide-react';
import { searchOfflineDtc, OFFLINE_DTC_CATALOG } from '../services/dtcDatabase';
import type { DtcDefinition } from '../types/scanner';

interface DtcDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCodes: string[];
  onSelectCode: (code: string) => void;
  onRemoveCode: (code: string) => void;
}

type CategoryTab = 'ALL' | 'Powertrain' | 'Chassis' | 'Body' | 'Network';

export const DtcDatabaseModal: React.FC<DtcDatabaseModalProps> = ({
  isOpen,
  onClose,
  selectedCodes,
  onSelectCode,
  onRemoveCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('ALL');

  const filteredCodes = useMemo(() => {
    return searchOfflineDtc(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  const getSeverityBadge = (severity: DtcDefinition['severity']) => {
    switch (severity) {
      case 'CRÍTICA':
        return 'bg-red-950/80 text-red-400 border-red-700/60';
      case 'ALTA':
        return 'bg-amber-950/80 text-amber-400 border-amber-700/60';
      case 'MÉDIA':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60';
      case 'BAIXA':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCategoryIcon = (category: DtcDefinition['category']) => {
    switch (category) {
      case 'Powertrain':
        return <Cpu className="w-3.5 h-3.5 mr-1 text-cyan-400" />;
      case 'Chassis':
        return <Disc className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
      case 'Body':
        return <Car className="w-3.5 h-3.5 mr-1 text-purple-400" />;
      case 'Network':
        return <Network className="w-3.5 h-3.5 mr-1 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Base de Conhecimento DTC (SAE J2012)
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  100% Offline
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Catálogo técnico de falhas automotivas com causas comuns e gravidade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca e Filtros de Categoria */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por código (ex: P0300, C0035, U0100) ou termo (ex: sonda, catalisador, ignição, abs)..."
              className="w-full pl-11 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtros de Categoria */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              Todos ({OFFLINE_DTC_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('Powertrain')}
              className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeCategory === 'Powertrain'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Powertrain / Motor (P)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('Chassis')}
              className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeCategory === 'Chassis'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Disc className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Chassis / Freios (C)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('Body')}
              className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeCategory === 'Body'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Carroceria / Airbag (B)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('Network')}
              className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeCategory === 'Network'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Rede / Barramento CAN (U)
            </button>
          </div>
        </div>

        {/* Lista de Códigos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredCodes.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold text-slate-400">Nenhum código encontrado</p>
              <p className="text-xs text-slate-500 mt-1">
                Tente buscar por outro código ou termo técnico.
              </p>
            </div>
          ) : (
            filteredCodes.map((item) => {
              const isSelected = selectedCodes.includes(item.code);

              return (
                <div
                  key={item.code}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-xl font-mono text-base font-bold text-cyan-300 shadow-sm">
                        {item.code}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                          item.severity
                        )}`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          onRemoveCode(item.code);
                        } else {
                          onSelectCode(item.code);
                        }
                      }}
                      className={`inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-cyan-600 hover:text-white hover:border-cyan-500'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Selecionado</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar ao Diagnóstico</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{item.description}</p>

                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Causas Prováveis Frequentes:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
                      {item.commonCauses.map((cause, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-cyan-400 text-xs leading-none mt-1">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>
            Exibindo <strong className="text-cyan-400">{filteredCodes.length}</strong> de{' '}
            {OFFLINE_DTC_CATALOG.length} códigos cadastrados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
