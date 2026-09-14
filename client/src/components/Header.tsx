import React, { useState } from 'react';
import {
  Activity,
  Bluetooth,
  Sparkles,
  ShieldCheck,
  History,
  Bell,
  Gauge,
  BookOpen,
  Sliders,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  isApiOnline: boolean;
  isHardwareConnected: boolean;
  hardwareVersion: string | null;
  savedCount?: number;
  onOpenHardwareModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenAlarmConfig: () => void;
  onOpenHud: () => void;
  onOpenDtcDatabase: () => void;
  onOpenCustomPids: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isApiOnline,
  isHardwareConnected,
  hardwareVersion,
  savedCount = 0,
  onOpenHardwareModal,
  onOpenHistoryModal,
  onOpenAlarmConfig,
  onOpenHud,
  onOpenDtcDatabase,
  onOpenCustomPids,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra principal - sempre em linha única, altura flexível */}
        <div className="flex items-center justify-between gap-3 py-3 min-h-[64px]">
          {/* Logo & Branding - não encolhe demais, texto trunca com responsividade */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-extrabold text-[17px] sm:text-xl tracking-tight text-white whitespace-nowrap">
                  Auto<span className="text-cyan-400">Scanner</span>
                </span>
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shrink-0">
                  <Sparkles className="w-3 h-3 mr-1 text-cyan-400" />
                  AI 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block leading-none mt-0.5 truncate">
                Diagnóstico Automotivo Inteligente & Telemetria OBD-II
              </p>
            </div>
          </div>

          {/* Ações Desktop - visível apenas em lg+ */}
          <nav className="hidden lg:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenHistoryModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/60 hover:text-cyan-300 transition-all cursor-pointer shadow-sm whitespace-nowrap"
              title="Ver histórico de laudos técnicos salvos"
            >
              <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Histórico</span>
              {savedCount > 0 && (
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/40 leading-none">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenAlarmConfig}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/60 hover:text-amber-300 transition-all cursor-pointer shadow-sm whitespace-nowrap"
              title="Configurar limiares de temperatura, tensão e giro com alerta sonoro"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Alarmes</span>
            </button>

            {/* Sprint 4: Modo HUD Cockpit */}
            <button
              type="button"
              onClick={onOpenHud}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border bg-emerald-950/60 text-emerald-300 border-emerald-600/70 hover:bg-emerald-900/70 transition-all cursor-pointer shadow-sm shadow-emerald-950/40 whitespace-nowrap"
              title="Modo HUD Head-Up Display para para-brisa noturno"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>HUD</span>
            </button>

            {/* Sprint 4: Base DTC Offline */}
            <button
              type="button"
              onClick={onOpenDtcDatabase}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/60 hover:text-cyan-300 transition-all cursor-pointer shadow-sm whitespace-nowrap"
              title="Consultar catálogo de códigos de falha SAE J2012 offline"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>DTCs</span>
            </button>

            {/* Sprint 4: Editor de PIDs Customizados */}
            <button
              type="button"
              onClick={onOpenCustomPids}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border bg-slate-900 text-slate-300 border-slate-800 hover:border-purple-500/60 hover:text-purple-300 transition-all cursor-pointer shadow-sm whitespace-nowrap"
              title="Editor de PIDs proprietários e fórmulas matemáticas"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>PIDs</span>
            </button>

            <button
              type="button"
              onClick={onOpenHardwareModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                isHardwareConnected
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60 shadow-sm shadow-emerald-950/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/60 hover:text-cyan-300'
              }`}
              title="Clique para configurar o scanner Bluetooth / USB"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isHardwareConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}
              />
              <Bluetooth className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-mono hidden xl:inline">
                {isHardwareConnected ? hardwareVersion || 'ELM327 Ativo' : 'Conectar ELM327'}
              </span>
              <span className="font-mono xl:hidden">{isHardwareConnected ? 'ELM327' : 'Conectar'}</span>
            </button>

            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${
                isApiOnline
                  ? 'bg-cyan-950/50 text-cyan-400 border-cyan-800/50'
                  : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{isApiOnline ? 'API Conectada' : 'API Offline'}</span>
            </div>
          </nav>

          {/* Área mobile / tablet: status essenciais + botão hamburger */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {/* ELM327 compacto sempre visível no mobile */}
            <button
              type="button"
              onClick={onOpenHardwareModal}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isHardwareConnected
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
              aria-label={isHardwareConnected ? 'ELM327 conectado' : 'Conectar ELM327'}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isHardwareConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <Bluetooth className="w-4 h-4 text-cyan-400 shrink-0" />
            </button>

            {/* Indicador API compacto - só ponto + ícone no mobile */}
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full border shrink-0 ${
                isApiOnline
                  ? 'bg-cyan-950/50 text-cyan-400 border-cyan-800/50'
                  : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
              }`}
              title={isApiOnline ? 'API Conectada' : 'API Offline'}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>

            {/* Botão hamburger */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Painel mobile expansível */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 py-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onOpenHistoryModal();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border bg-slate-900 text-slate-200 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Histórico</span>
                {savedCount > 0 && (
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/30 leading-none">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onOpenAlarmConfig();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border bg-slate-900 text-slate-200 border-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Alarmes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onOpenHud();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60 transition-all cursor-pointer"
              >
                <Gauge className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Modo HUD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onOpenDtcDatabase();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border bg-slate-900 text-slate-200 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Base DTC</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onOpenCustomPids();
                }}
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border bg-slate-900 text-slate-200 border-slate-800 hover:border-purple-500/50 hover:text-purple-300 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
                <span>PIDs Customizados & Fórmulas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onOpenHardwareModal();
                }}
                className={`col-span-2 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  isHardwareConnected
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-950/60'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isHardwareConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <Bluetooth className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono text-xs sm:text-sm truncate">
                  {isHardwareConnected ? hardwareVersion || 'ELM327 Ativo' : 'Conectar ELM327 (Bluetooth / USB)'}
                </span>
              </button>

              <div
                className={`col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border ${
                  isApiOnline
                    ? 'bg-cyan-950/30 text-cyan-400 border-cyan-800/50'
                    : 'bg-rose-950/30 text-rose-300 border-rose-800/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isApiOnline ? 'API Conectada • Backend Online' : 'API Offline • Verifique o servidor'}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isApiOnline ? 'bg-cyan-400 animate-pulse' : 'bg-rose-400'}`} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
