import React from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';

interface ClearCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isClearing: boolean;
  codesCount: number;
}

export const ClearCodesModal: React.FC<ClearCodesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isClearing,
  codesCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Limpar Falhas da ECU (Modo 04)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 text-xs text-slate-300 space-y-2.5 leading-relaxed">
          <p>
            Esta ação enviará o comando <strong>Modo 04 OBD-II</strong> para a central do veículo.
          </p>
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200">
            <ul className="list-disc list-inside space-y-1">
              <li>Apaga os <strong>{codesCount} código(s) de falha</strong> gravados na memória.</li>
              <li>Desliga a <strong>luz da injeção eletrônica (Check Engine / MIL)</strong> no painel.</li>
              <li>Reseta os monitores de prontidão (I/M Readiness).</li>
            </ul>
          </div>
          <p className="text-slate-400 italic">
            Certifique-se de que a chave do veículo está na posição Ligada (pós-chave) e o motor desligado ou em marcha lenta.
          </p>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isClearing}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isClearing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Enviando Comando Modo 04...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirmar e Apagar Falhas</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
