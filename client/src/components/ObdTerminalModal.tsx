import React, { useState } from 'react';
import { Terminal, X, Send, ArrowUpRight, ArrowDownLeft, Info, AlertCircle } from 'lucide-react';
import type { LogEntry } from '../services/elm327/elm327.types';

interface ObdTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  isConnected: boolean;
  onSendCommand: (cmd: string) => Promise<string>;
}

const QUICK_COMMANDS = [
  { label: 'Reset (ATZ)', cmd: 'ATZ' },
  { label: 'Bateria (ATRV)', cmd: 'ATRV' },
  { label: 'RPM (010C)', cmd: '010C' },
  { label: 'Temp (0105)', cmd: '0105' },
  { label: 'Velocidade (010D)', cmd: '010D' },
  { label: 'Falhas Ativas (03)', cmd: '03' },
  { label: 'Falhas Pendentes (07)', cmd: '07' },
  { label: 'Chassi / VIN (0902)', cmd: '0902' },
  { label: 'Protocolo (ATDP)', cmd: 'ATDP' },
];

export const ObdTerminalModal: React.FC<ObdTerminalModalProps> = ({
  isOpen,
  onClose,
  logs,
  isConnected,
  onSendCommand,
}) => {
  const [command, setCommand] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isSending || !isConnected) return;

    setIsSending(true);
    const cmd = command;
    setCommand('');
    try {
      await onSendCommand(cmd);
    } catch {
      // O log de erro já é registrado pelo service
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickCommand = async (cmd: string) => {
    if (isSending || !isConnected) return;
    setIsSending(true);
    try {
      await onSendCommand(cmd);
    } catch {
      // O log de erro já é registrado pelo service
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[580px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              Terminal OBD-II Serial / ELM327
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                isConnected
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-950 text-rose-300 border border-rose-700/60'
              }`}
            >
              {isConnected ? 'ONLINE' : 'DESCONECTADO'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Comandos Rápidos */}
        <div className="px-6 py-2.5 bg-slate-900/50 border-b border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 mr-1">
            Atalhos:
          </span>
          {QUICK_COMMANDS.map((item) => (
            <button
              key={item.cmd}
              type="button"
              disabled={!isConnected || isSending}
              onClick={() => handleQuickCommand(item.cmd)}
              className="text-xs px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-cyan-300 font-mono shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Log Stream Terminal */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 bg-slate-950 flex flex-col-reverse">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
              Nenhuma comunicação serial registrada até o momento.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-1.5 rounded flex items-start space-x-2 ${
                  log.direction === 'TX'
                    ? 'bg-cyan-950/30 text-cyan-300 border-l-2 border-cyan-500'
                    : log.direction === 'RX'
                    ? 'bg-emerald-950/20 text-emerald-300 border-l-2 border-emerald-500'
                    : log.direction === 'ERROR'
                    ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                    : 'bg-slate-900/50 text-slate-400'
                }`}
              >
                <span className="text-[10px] text-slate-500 shrink-0 select-none">
                  {log.timestamp}
                </span>

                <span className="shrink-0">
                  {log.direction === 'TX' ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  ) : log.direction === 'RX' ? (
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                  ) : log.direction === 'ERROR' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </span>

                <span className="font-semibold break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value.toUpperCase())}
            disabled={!isConnected || isSending}
            placeholder={
              isConnected
                ? 'Digite o comando OBD-II (ex: ATRV, 010C, 03, 0902)...'
                : 'Conecte o scanner ELM327 para enviar comandos...'
            }
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 uppercase disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!isConnected || isSending || !command.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center space-x-1.5 shadow-md shadow-cyan-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
