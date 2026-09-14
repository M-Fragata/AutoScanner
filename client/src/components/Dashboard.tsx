import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './Header';
import { TelemetryDisplay } from './TelemetryDisplay';
import { VehicleForm } from './VehicleForm';
import { ScannerControl } from './ScannerControl';
import { DtcSelector } from './DtcSelector';
import { AiReportView } from './AiReportView';
import { Elm327Modal } from './Elm327Modal';
import { ObdTerminalModal } from './ObdTerminalModal';
import { ClearCodesModal } from './ClearCodesModal';
import { DiagnosticHistoryModal } from './DiagnosticHistoryModal';
import { FreezeFrameModal } from './FreezeFrameModal';
import { EmissionsReadinessModal } from './EmissionsReadinessModal';
import { AlarmConfigModal } from './AlarmConfigModal';
import { PredictiveAnalysisModal } from './PredictiveAnalysisModal';
import { HudDisplayModal } from './HudDisplayModal';
import { DtcDatabaseModal } from './DtcDatabaseModal';
import { CustomPidModal } from './CustomPidModal';
import { useTelemetry } from '../hooks/useTelemetry';
import { useScanner } from '../hooks/useScanner';
import { useElm327 } from '../hooks/useElm327';
import { useAppStore } from '../store/useAppStore';
import { elm327Service } from '../services/elm327/elm327.service';
import { alarmManager, type ActiveAlarmViolation } from '../services/alarmManager';
import { customPidService } from '../services/customPidService';
import { checkApiHealth, requestPredictiveAnalysis } from '../services/api';
import { AlertCircle, Wrench, ShieldAlert, CheckCircle2, Bell } from 'lucide-react';
import type { ObdLiveTelemetry } from '../services/elm327/elm327.types';
import type { SavedDiagnosticSession } from '../services/historyStorage';
import type { FreezeFrameData, EmissionsReadinessReport, PredictiveReport } from '../types/scanner';

export const Dashboard: React.FC = () => {
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isFreezeFrameOpen, setIsFreezeFrameOpen] = useState<boolean>(false);
  const [isEmissionsOpen, setIsEmissionsOpen] = useState<boolean>(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [isPredictiveModalOpen, setIsPredictiveModalOpen] = useState<boolean>(false);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(false);
  const [isDtcDatabaseOpen, setIsDtcDatabaseOpen] = useState<boolean>(false);
  const [isCustomPidsOpen, setIsCustomPidsOpen] = useState<boolean>(false);
  const [freezeFrameData, setFreezeFrameData] = useState<FreezeFrameData | null>(null);
  const [emissionsReport, setEmissionsReport] = useState<EmissionsReadinessReport | null>(null);
  const [predictiveReport, setPredictiveReport] = useState<PredictiveReport | null>(null);
  const [isLoadingSprint2, setIsLoadingSprint2] = useState<boolean>(false);
  const [isLoadingPredictive, setIsLoadingPredictive] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { savedSessions, telemetryHistory, setIsLiveStreaming } = useAppStore();

  // Hook de controle de telemetria automotiva (simulação e estado dos mostradores)
  const {
    telemetry,
    isLiveStreaming,
    toggleLiveStreaming,
    setTelemetry,
    updateTelemetry,
  } = useTelemetry();

  // Callback chamado quando o scanner físico ELM327 envia telemetria real do motor
  const handleHardwareTelemetry = useCallback(
    (realData: Partial<ObdLiveTelemetry>) => {
      updateTelemetry(realData);
    },
    [updateTelemetry]
  );

  // Hook de controle de comunicação com o leitor físico ELM327 Bluetooth via Web Serial API
  const {
    status: hardwareStatus,
    deviceInfo,
    isHardwareConnected,
    isSupported: isSerialSupported,
    logs: terminalLogs,
    isScanningDtc: isScanningHardwareDtc,
    isClearingDtc,
    hardwareError,
    connect: connectHardware,
    disconnect: disconnectHardware,
    scanDtc: scanHardwareDtc,
    clearDtc: clearHardwareDtc,
    sendRawCommand,
  } = useElm327(handleHardwareTelemetry);

  // Hook de controle do fluxo de diagnóstico e IA
  const {
    vehicle,
    setVehicle,
    selectedCodes,
    setSelectedCodes,
    symptoms,
    setSymptoms,
    isAnalyzingAi,
    diagnosticResult,
    setDiagnosticResult,
    errorMessage,
    setErrorMessage,
    addDtcCode,
    removeDtcCode,
    triggerAiDiagnosis,
    resetDiagnosis,
  } = useScanner(telemetry);

  // Carrega diagnóstico anterior selecionado pelo usuário no histórico
  const handleSelectSavedSession = (session: SavedDiagnosticSession) => {
    setVehicle(session.vehicle);
    if (session.symptoms) setSymptoms(session.symptoms);
    setSelectedCodes(session.dtcCodes);
    if (session.telemetrySnapshot) {
      setTelemetry(session.telemetrySnapshot);
    }
    setDiagnosticResult({
      vehicle: session.vehicle,
      dtcCodes: [],
      symptoms: session.symptoms,
      telemetry: session.telemetrySnapshot,
      aiReport: session.report,
    });
    setSuccessToast(`Laudo de ${session.vehicle.make} ${session.vehicle.model} carregado com sucesso.`);
    setTimeout(() => {
      const el = document.getElementById('ai-report-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Verificação periódica da integridade do backend
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      const online = await checkApiHealth();
      if (isMounted) setIsApiOnline(online);
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Limpa toast de sucesso após 4 segundos
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Ativa streaming ao vivo quando o scanner físico estiver conectado e zera quando desconectado
  useEffect(() => {
    if (isHardwareConnected) {
      setIsLiveStreaming(true);
    } else {
      setIsLiveStreaming(false);
      setTelemetry({
        rpm: 0,
        coolantTempC: 0,
        vehicleSpeedKmh: 0,
        batteryVoltage: 0,
        fuelPressureBar: 0,
        intakeTempC: 0,
      });
    }
  }, [isHardwareConnected, setIsLiveStreaming, setTelemetry]);

  // Avaliação em tempo real dos limites de segurança de telemetria (Sprint 3: Alarmes)
  // Derivado durante render para evitar setState síncrono dentro de effect
  const activeViolations: ActiveAlarmViolation[] = useMemo(
    () => alarmManager.evaluateTelemetry(telemetry),
    [telemetry]
  );

  // Simulação/atualização de valores dos PIDs customizados ativos (Sprint 4: PIDs)
  useEffect(() => {
    customPidService.simulateLiveValues();
  }, [telemetry]);

  // Executa varredura: se scanner físico estiver conectado, lê ECU real; senão, avisa erro
  const handleEcuScan = async () => {
    if (isHardwareConnected) {
      setErrorMessage(null);
      const realCodes = await scanHardwareDtc();
      if (realCodes.length > 0) {
        realCodes.forEach((c) => addDtcCode(c));
        setSuccessToast(`Centralina lida com sucesso! ${realCodes.length} código(s) detectado(s).`);
      } else {
        setSuccessToast('Varredura concluída: Nenhum código de falha ativo retornado pela ECU.');
      }
    } else {
      setErrorMessage('Nenhum scanner ELM327 conectado. Conecte o aparelho via Bluetooth ou USB para realizar a leitura da centralina.');
      setIsHardwareModalOpen(true);
    }
  };

  // Executa limpeza de falhas da central (Modo 04)
  const handleConfirmClearCodes = async () => {
    if (isHardwareConnected) {
      const success = await clearHardwareDtc();
      if (success) {
        selectedCodes.forEach((c) => removeDtcCode(c));
        setIsClearModalOpen(false);
        setSuccessToast('Comando Modo 04 executado: Memória da ECU limpa e luz de injeção apagada.');
      }
    } else {
      setErrorMessage('Nenhum scanner ELM327 conectado. Conecte o aparelho via Bluetooth ou USB para apagar os códigos da ECU.');
      setIsClearModalOpen(false);
    }
  };

  // Consulta de Freeze Frame (Modo 02 da ECU)
  const handleFetchFreezeFrame = async () => {
    setIsLoadingSprint2(true);
    setErrorMessage(null);
    try {
      if (isHardwareConnected) {
        const data = await elm327Service.readFreezeFrame();
        setFreezeFrameData(data);
      } else {
        setFreezeFrameData(null);
        setErrorMessage('Conecte o scanner ELM327 ao veículo para consultar o quadro de Freeze Frame (Modo 02).');
      }
    } catch {
      setErrorMessage('Falha ao consultar quadro de Freeze Frame.');
    } finally {
      setIsLoadingSprint2(false);
    }
  };

  const handleOpenFreezeFrame = async () => {
    setIsFreezeFrameOpen(true);
    await handleFetchFreezeFrame();
  };

  // Consulta de Prontidão de Emissões (I/M Readiness - Modo 01 PID 01)
  const handleFetchEmissions = async () => {
    setIsLoadingSprint2(true);
    setErrorMessage(null);
    try {
      if (isHardwareConnected) {
        const data = await elm327Service.readEmissionsReadiness();
        setEmissionsReport(data);
      } else {
        setEmissionsReport(null);
        setErrorMessage('Conecte o scanner ELM327 ao veículo para consultar a prontidão de emissões (I/M Readiness Modo 01).');
      }
    } catch {
      setErrorMessage('Falha ao consultar prontidão de emissões.');
    } finally {
      setIsLoadingSprint2(false);
    }
  };

  const handleOpenEmissions = async () => {
    setIsEmissionsOpen(true);
    await handleFetchEmissions();
  };

  // Análise Preditiva de Desgaste e Tendências por IA (Sprint 3: G-09)
  const handleRunPredictive = async () => {
    setIsLoadingPredictive(true);
    try {
      const historyToSend =
        telemetryHistory.length > 0
          ? telemetryHistory
          : [
              {
                timestamp: Date.now(),
                timeLabel: new Date().toLocaleTimeString(),
                rpm: telemetry.rpm,
                vehicleSpeedKmh: telemetry.vehicleSpeedKmh,
                coolantTempC: telemetry.coolantTempC,
                batteryVoltage: telemetry.batteryVoltage,
                fuelPressureBar: telemetry.fuelPressureBar,
                intakeTempC: telemetry.intakeTempC,
              },
            ];

      const rep = await requestPredictiveAnalysis({
        vehicle,
        telemetryHistory: historyToSend,
        symptoms: symptoms || undefined,
      });
      setPredictiveReport(rep);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar análise preditiva por IA.';
      setErrorMessage(msg);
    } finally {
      setIsLoadingPredictive(false);
    }
  };

  const handleOpenPredictive = async () => {
    setIsPredictiveModalOpen(true);
    if (!predictiveReport) {
      await handleRunPredictive();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Barra de Navegação e Status */}
      <Header
        isApiOnline={isApiOnline}
        isHardwareConnected={isHardwareConnected}
        hardwareVersion={deviceInfo.version}
        savedCount={savedSessions.length}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenAlarmConfig={() => setIsAlarmModalOpen(true)}
        onOpenHud={() => setIsHudOpen(true)}
        onOpenDtcDatabase={() => setIsDtcDatabaseOpen(true)}
        onOpenCustomPids={() => setIsCustomPidsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner de Erro Global ou de Hardware */}
        {(errorMessage || hardwareError) && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 flex items-center justify-between shadow-lg shadow-rose-950/30 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-sm font-medium">{errorMessage || hardwareError}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
              }}
              className="text-xs px-3 py-1 bg-rose-900/60 hover:bg-rose-900 rounded-lg text-rose-200 border border-rose-700/60 transition-colors"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* Toast de Sucesso */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 flex items-center space-x-3 shadow-lg shadow-emerald-950/30 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-semibold">{successToast}</p>
          </div>
        )}

        {/* Banner de Aviso de API Offline */}
        {!isApiOnline && (
          <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-800 text-amber-200 flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm">
              <strong className="font-semibold">Servidor Backend Não Detectado:</strong> Certifique-se de que a API está ativa no terminal (`npm run dev` na pasta server).
            </p>
          </div>
        )}

        {/* Banner de Violação Crítica de Alarmes (Sprint 3: G-06) */}
        {activeViolations.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600 text-rose-100 flex items-center justify-between shadow-xl shadow-rose-950/50 animate-pulse">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-rose-200">
                  ALERTA DE SEGURANÇA VEICULAR ATIVO ({activeViolations.length})
                </p>
                <p className="text-xs text-rose-300">
                  {activeViolations.map((v) => v.message).join(' • ')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAlarmModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 rounded-lg text-rose-100 border border-rose-600 font-semibold transition-colors shrink-0 cursor-pointer"
            >
              Ajustar Limites
            </button>
          </div>
        )}

        {/* Telemetria de Sensores em Tempo Real */}
        <TelemetryDisplay
          telemetry={telemetry}
          isLiveStreaming={isLiveStreaming}
          isHardwareConnected={isHardwareConnected}
          onToggleStreaming={toggleLiveStreaming}
          onOpenHud={() => setIsHudOpen(true)}
          onOpenCustomPids={() => setIsCustomPidsOpen(true)}
          onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        />

        {/* Grid de Configuração: Ficha do Carro & Interface do Scanner OBD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VehicleForm
            vehicle={vehicle}
            symptoms={symptoms}
            onVehicleChange={setVehicle}
            onSymptomsChange={setSymptoms}
          />

          <ScannerControl
            isScanningEcu={isScanningHardwareDtc}
            isAnalyzingAi={isAnalyzingAi}
            isHardwareConnected={isHardwareConnected}
            hardwareVersion={deviceInfo.version}
            protocolInfo={isHardwareConnected ? deviceInfo.protocol : null}
            vinInfo={isHardwareConnected && deviceInfo.vin ? deviceInfo.vin : null}
            selectedCodesCount={selectedCodes.length}
            onScanEcu={handleEcuScan}
            onDiagnoseAi={triggerAiDiagnosis}
            onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
            onOpenTerminal={() => setIsTerminalOpen(true)}
            onOpenClearModal={() => setIsClearModalOpen(true)}
            onOpenFreezeFrame={handleOpenFreezeFrame}
            onOpenEmissions={handleOpenEmissions}
            onOpenPredictive={handleOpenPredictive}
          />
        </div>

        {/* Seletor de Códigos de Falha OBD-II */}
        <DtcSelector
          selectedCodes={selectedCodes}
          onAddCode={addDtcCode}
          onRemoveCode={removeDtcCode}
        />

        {/* Exibição do Laudo Técnico Inteligente Gerado pela IA */}
        {diagnosticResult && (
          <div id="ai-report-section" className="pt-2">
            <AiReportView
              result={diagnosticResult}
              onReset={resetDiagnosis}
            />
          </div>
        )}
      </main>

      {/* Modal de Conexão Hardware ELM327 */}
      <Elm327Modal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        status={hardwareStatus}
        deviceInfo={deviceInfo}
        isSupported={isSerialSupported}
        onConnect={connectHardware}
        onDisconnect={disconnectHardware}
      />

      {/* Modal de Terminal Serial OBD-II */}
      <ObdTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        logs={terminalLogs}
        isConnected={isHardwareConnected}
        onSendCommand={sendRawCommand}
      />

      {/* Modal de Confirmação para Limpar Falhas (Modo 04) */}
      <ClearCodesModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearCodes}
        isClearing={isClearingDtc}
        codesCount={selectedCodes.length}
      />

      {/* Modal de Histórico de Diagnósticos & Laudos */}
      <DiagnosticHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectSession={handleSelectSavedSession}
      />

      {/* Modal de Freeze Frame (Modo 02 da ECU) */}
      <FreezeFrameModal
        isOpen={isFreezeFrameOpen}
        onClose={() => setIsFreezeFrameOpen(false)}
        freezeFrame={freezeFrameData}
        currentTelemetry={telemetry}
        isLoading={isLoadingSprint2}
        onRefresh={handleFetchFreezeFrame}
      />

      {/* Modal de Prontidão de Emissões (I/M Readiness) */}
      <EmissionsReadinessModal
        isOpen={isEmissionsOpen}
        onClose={() => setIsEmissionsOpen(false)}
        report={emissionsReport}
        isLoading={isLoadingSprint2}
        onRefresh={handleFetchEmissions}
      />

      {/* Modal de Configuração de Alarmes */}
      <AlarmConfigModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
      />

      {/* Modal de Análise Preditiva de Tendências (Sprint 3: G-09) */}
      <PredictiveAnalysisModal
        isOpen={isPredictiveModalOpen}
        onClose={() => setIsPredictiveModalOpen(false)}
        report={predictiveReport}
        isLoading={isLoadingPredictive}
        onReanalyze={handleRunPredictive}
      />

      {/* Modal do Modo HUD Cockpit (Sprint 4: G-05) */}
      <HudDisplayModal
        isOpen={isHudOpen}
        onClose={() => setIsHudOpen(false)}
        telemetry={telemetry}
        activeViolations={activeViolations}
      />

      {/* Modal da Base de Conhecimento DTC Offline (Sprint 4: G-08) */}
      <DtcDatabaseModal
        isOpen={isDtcDatabaseOpen}
        onClose={() => setIsDtcDatabaseOpen(false)}
        selectedCodes={selectedCodes}
        onSelectCode={(code) => {
          addDtcCode(code);
          setSuccessToast(`Código ${code} adicionado com sucesso ao diagnóstico.`);
        }}
        onRemoveCode={removeDtcCode}
      />

      {/* Modal de PIDs Customizados e Fórmulas Matemáticas (Sprint 4: G-10) */}
      <CustomPidModal
        isOpen={isCustomPidsOpen}
        onClose={() => setIsCustomPidsOpen(false)}
      />

      {/* Rodapé Informativo */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>AutoScanner Pro • Suporte a ELM327 Bluetooth / USB & Google Gemini AI</span>
          </div>
          <span className="text-slate-600">
            Web Serial API nativa • Diagnósticos Mode 01, 03, 04, 07, 09
          </span>
        </div>
      </footer>
    </div>
  );
};
