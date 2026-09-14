import React, { useState } from 'react';
import { AlertTriangle, Plus, X, Tag } from 'lucide-react';

interface DtcSelectorProps {
  selectedCodes: string[];
  onAddCode: (code: string) => void;
  onRemoveCode: (code: string) => void;
}

const COMMON_CODES = [
  { code: 'P0300', label: 'Falha Ignição Múltipla' },
  { code: 'P0420', label: 'Eficiência Catalisador Baixa' },
  { code: 'P0171', label: 'Mistura Excessivamente Pobre' },
  { code: 'P0128', label: 'Termostato Arrefecimento' },
  { code: 'P0340', label: 'Sensor Posição Comando' },
  { code: 'P0455', label: 'Vazamento Evap Grosso' },
  { code: 'P0500', label: 'Sensor de Velocidade VSS' },
  { code: 'P0700', label: 'Controle Transmissão TCM' },
];

export const DtcSelector: React.FC<DtcSelectorProps> = ({
  selectedCodes,
  onAddCode,
  onRemoveCode,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = customInput.trim().toUpperCase();

    // Valida formato básico de código DTC (P, C, B, U seguido de 4 hex)
    if (!/^[PCBU][0-9A-Fa-f]{4}$/.test(formatted)) {
      setInputError('Formato inválido. Ex: P0300, C0035, B1200, U0100');
      return;
    }

    setInputError(null);
    onAddCode(formatted);
    setCustomInput('');
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-200 uppercase tracking-wide">
            Códigos de Falha OBD-II (DTC)
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {selectedCodes.length} código(s) ativo(s)
        </span>
      </div>

      {/* Tags de códigos selecionados */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[44px] p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
        {selectedCodes.length === 0 ? (
          <span className="text-xs text-slate-500 italic flex items-center">
            Nenhum código DTC selecionado. Adicione códigos abaixo ou execute a varredura da ECU.
          </span>
        ) : (
          selectedCodes.map((code) => (
            <span
              key={code}
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold font-mono bg-amber-950/70 text-amber-300 border border-amber-800/70 shadow-sm"
            >
              <Tag className="w-3 h-3 mr-1.5 opacity-70" />
              {code}
              <button
                type="button"
                onClick={() => onRemoveCode(code)}
                className="ml-2 hover:text-rose-400 focus:outline-none transition-colors"
                title={`Remover código ${code}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Input para adicionar código customizado */}
      <form onSubmit={handleAddCustom} className="mb-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={5}
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value.toUpperCase());
                setInputError(null);
              }}
              placeholder="Digitar código DTC (ex: P0300)"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 rounded-lg text-xs font-bold flex items-center space-x-1 border border-slate-700 hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
        {inputError && (
          <p className="text-rose-400 text-xs mt-1.5 font-medium">{inputError}</p>
        )}
      </form>

      {/* Sugestões de códigos comuns */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Falhas Comuns para Inserção Rápida:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_CODES.map((item) => {
            const isSelected = selectedCodes.includes(item.code);
            return (
              <button
                key={item.code}
                type="button"
                disabled={isSelected}
                onClick={() => onAddCode(item.code)}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
                  isSelected
                    ? 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed line-through'
                    : 'bg-slate-900 text-slate-300 border-slate-700/60 hover:text-amber-300 hover:border-amber-500/40 cursor-pointer'
                }`}
                title={item.label}
              >
                {item.code} - {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
