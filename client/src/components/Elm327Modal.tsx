import React, { useState } from 'react';
import {
  X,
  Bluetooth,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { ConnectionStatus, ElmBaudRate, ElmDeviceInfo } from '../services/elm327/elm327.types';

interface Elm327ModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ConnectionStatus;
  deviceInfo: ElmDeviceInfo;
  isSupported: boolean;
  onConnect: (baudRate: ElmBaudRate) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export const Elm327Modal: React.FC<Elm327ModalProps> = ({
  isOpen,
  onClose,
  status,
  deviceInfo,
  isSupported,
  onConnect,
  onDisconnect,
}) => {
  const [baudRate, setBaudRate] = useState<ElmBaudRate>(38400);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectClick = async () => {
    setErrorText(null);
    setIsConnecting(true);
    try {
      await onConnect(baudRate);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Falha ao conectar.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectClick = async () => {
    setErrorText(null);
    try {
      await onDisconnect();
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Falha ao desconectar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Conexão Scanner Físico ELM327
              </h3>
              <p className="text-xs text-slate-400">
                Suporte nativo a adaptadores Bluetooth SPP e cabos USB OBD-II
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta caso navegador não suporte Web Serial */}
        {!isSupported && (
          <div className="my-4 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <strong className="font-semibold block mb-1">Navegador Incompatível:</strong>
              A Web Serial API está disponível no <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong> e <strong>Opera</strong> no Windows, Linux, Mac ou Android.
            </div>
          </div>
        )}

        {/* Erro de conexão */}
        {errorText && (
          <div className="my-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Informações do Dispositivo Conectado */}
        {status === 'CONNECTED' ? (
          <div className="my-5 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 space-y-2.5">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dispositivo Pareado & Conectado ao Veículo</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">CHIP / FIRMWARE:</span>
                <span className="font-mono font-bold text-slate-200">{deviceInfo.version}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">TENSÃO BATERIA (PIN 16):</span>
                <span className="font-mono font-bold text-emerald-300">
                  {deviceInfo.batteryVoltage ? `${deviceInfo.batteryVoltage}V` : 'Calculando...'}
                </span>
              </div>
              <div className="col-span-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">PROTOCOLO AUTOMOTIVO:</span>
                <span className="font-mono font-bold text-cyan-300">{deviceInfo.protocol}</span>
              </div>
              {deviceInfo.vin && (
                <div className="col-span-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">NÚMERO DE CHASSI (VIN):</span>
                  <span className="font-mono font-bold text-amber-300">{deviceInfo.vin}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Instruções passo a passo */
          <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2 font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Como conectar seu ELM327 Bluetooth no Windows:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
              <li>Ligue a ignição do carro e plugue o leitor na tomada OBD-II.</li>
              <li>
                No Windows, acesse <strong>Configurações &gt; Bluetooth</strong> e pareie com <strong>"OBDII"</strong> (código PIN padrão: <code>1234</code> ou <code>0000</code>).
              </li>
              <li>
                Clique no botão abaixo e selecione a porta serial (porta COM virtual) criada pelo Bluetooth.
              </li>
            </ol>
          </div>
        )}

        {/* Seleção de Baud Rate */}
        {status !== 'CONNECTED' && (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Velocidade de Comunicação (Baud Rate):</span>
              <span className="text-[10px] text-slate-500 font-normal">Padrão ELM327: 38400 bps</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([38400, 9600, 115200] as ElmBaudRate[]).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setBaudRate(rate)}
                  className={`py-2 px-3 text-xs rounded-xl font-mono border font-semibold transition-all ${
                    baudRate === rate
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-600 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {rate} bps
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center space-x-3 pt-2">
          {status === 'CONNECTED' ? (
            <button
              type="button"
              onClick={handleDisconnectClick}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Power className="w-4 h-4" />
              <span>Desconectar Scanner ELM327</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnectClick}
              disabled={isConnecting || !isSupported}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Conectando e Negociando Protocolo...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-cyan-200" />
                  <span>Localizar e Conectar Leitor Bluetooth</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-semibold border border-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
