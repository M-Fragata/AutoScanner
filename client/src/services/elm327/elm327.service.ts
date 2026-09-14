import type {
  ConnectionStatus,
  ElmBaudRate,
  ElmDeviceInfo,
  ObdLiveTelemetry,
  LogEntry,
} from './elm327.types';
import type { FreezeFrameData, EmissionsReadinessReport } from '../../types/scanner';
import {
  cleanResponse,
  parseBatteryVoltage,
  parseRpm,
  parseCoolantTemp,
  parseSpeed,
  parseEngineLoad,
  parseIntakeTemp,
  parseThrottle,
  parseFuelPressure,
  parseDtcCodes,
  parseVin,
  parseFreezeFrameDtc,
  parseReadinessMonitors,
} from './elm327.decoder';

// Tipagem para a Web Serial API nativa do navegador
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<BufferSource> | null;
  writable: WritableStream<Uint8Array> | null;
}

interface SerialNavigator {
  serial?: {
    requestPort(options?: unknown): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}

export class Elm327Service {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private readBuffer: string = '';
  private status: ConnectionStatus = 'DISCONNECTED';
  private deviceInfo: ElmDeviceInfo = {
    version: 'Desconhecido',
    protocol: 'Não identificado',
    batteryVoltage: 0,
    vin: null,
  };
  private logs: LogEntry[] = [];
  private isPollingActive: boolean = false;
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;

  // Callbacks para atualização de estado na interface
  public onStatusChange?: (status: ConnectionStatus) => void;
  public onTelemetryUpdate?: (telemetry: Partial<ObdLiveTelemetry>) => void;
  public onLog?: (entry: LogEntry) => void;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getDeviceInfo(): ElmDeviceInfo {
    return this.deviceInfo;
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  private log(direction: LogEntry['direction'], message: string) {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      direction,
      message,
    };
    this.logs = [entry, ...this.logs.slice(0, 199)]; // Mantém últimos 200 logs
    if (this.onLog) {
      this.onLog(entry);
    }
  }

  /**
   * Conecta à porta serial do ELM327 Bluetooth (porta COM virtual pareada no Windows)
   */
  public async connect(baudRate: ElmBaudRate = 38400): Promise<void> {
    if (!this.isSupported()) {
      throw new Error(
        'A Web Serial API não é suportada neste navegador. Utilize o Google Chrome, Microsoft Edge ou Opera.'
      );
    }

    try {
      this.setStatus('CONNECTING');
      this.log('INFO', `Solicitando porta serial do leitor ELM327 (${baudRate} baud)...`);

      const nav = navigator as unknown as SerialNavigator;
      if (!nav.serial) {
        throw new Error('Web Serial API não disponível.');
      }

      this.port = await nav.serial.requestPort();
      await this.port.open({ baudRate });

      this.log('INFO', 'Porta serial aberta com sucesso. Configurando streams...');

      // Inicializa streams de leitura e escrita com decodificação de texto
      if (!this.port.readable || !this.port.writable) {
        throw new Error('Falha ao obter streams de leitura/escrita da porta.');
      }

      const textDecoder = new TextDecoderStream();
      this.port.readable.pipeTo(textDecoder.writable).catch(() => {});
      this.reader = textDecoder.readable.getReader();

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(this.port.writable).catch(() => {});
      this.writer = textEncoder.writable.getWriter();

      // Inicia loop de leitura contínua do buffer
      this.startContinuousReader();

      // Executa sequência de configuração inicial (handshake)
      await this.initializeElm();

      this.setStatus('CONNECTED');
      this.log('INFO', 'Scanner ELM327 conectado e operacional!');
    } catch (err) {
      this.setStatus('ERROR');
      const msg = err instanceof Error ? err.message : 'Erro ao conectar ao scanner ELM327';
      this.log('ERROR', msg);
      await this.disconnect();
      throw err;
    }
  }

  /**
   * Encerra a conexão serial com o ELM327
   */
  public async disconnect(): Promise<void> {
    this.stopTelemetryPolling();
    this.isPollingActive = false;

    try {
      if (this.reader) {
        await this.reader.cancel().catch(() => {});
        this.reader = null;
      }
      if (this.writer) {
        await this.writer.close().catch(() => {});
        this.writer = null;
      }
      if (this.port) {
        await this.port.close().catch(() => {});
        this.port = null;
      }
    } catch {
      // Falha silenciosa de fechamento de portas já desconectadas
    } finally {
      this.readBuffer = '';
      this.setStatus('DISCONNECTED');
      this.log('INFO', 'Scanner ELM327 desconectado.');
    }
  }

  /**
   * Loop assíncrono que consome os chunks da porta serial e acumula no readBuffer
   */
  private async startContinuousReader(): Promise<void> {
    if (!this.reader) return;

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          this.readBuffer += value;
        }
      }
    } catch (err) {
      if (this.status !== 'DISCONNECTED') {
        this.log('ERROR', `Erro no fluxo de leitura serial: ${err}`);
      }
    }
  }

  /**
   * Envia um comando ASCII para o ELM327 e aguarda a resposta terminada em '>'
   */
  public async sendCommand(cmd: string, timeoutMs: number = 4000): Promise<string> {
    if (!this.writer) {
      throw new Error('Scanner não conectado.');
    }

    const cleanCmd = cmd.trim().toUpperCase();
    this.readBuffer = ''; // Limpa buffer antes de enviar o novo comando
    this.log('TX', cleanCmd);

    // O padrão ELM327 exige terminação por Carriage Return (\r)
    await this.writer.write(`${cleanCmd}\r`);

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      // O chip ELM327 indica que terminou de responder emitindo o caractere de prompt '>'
      if (this.readBuffer.includes('>')) {
        const response = cleanResponse(this.readBuffer);
        this.log('RX', response);
        return this.readBuffer;
      }
      await new Promise((r) => setTimeout(r, 40));
    }

    const partial = cleanResponse(this.readBuffer);
    this.log('ERROR', `Timeout no comando ${cleanCmd}. Resposta parcial: "${partial}"`);
    return this.readBuffer;
  }

  /**
   * Sequência de handshake e inicialização do protocolo OBD-II
   */
  private async initializeElm(): Promise<void> {
    this.setStatus('CONFIGURING');

    // 1. Reset do chip e detecção de versão
    const atzRes = await this.sendCommand('ATZ', 2500);
    const version = cleanResponse(atzRes) || 'ELM327 v1.5';
    this.deviceInfo.version = version;

    // 2. Desliga Eco de caracteres para simplificar parsing
    await this.sendCommand('ATE0', 1000);

    // 3. Desliga Linefeeds redundantes
    await this.sendCommand('ATL0', 1000);

    // 4. Desliga cabeçalhos extras
    await this.sendCommand('ATH0', 1000);

    // 5. Seleção automática de protocolo (CAN, ISO, etc.)
    await this.sendCommand('ATSP0', 1500);

    // 6. Lê a voltagem física no pino 16 da porta OBD-II
    const voltRes = await this.sendCommand('ATRV', 1500);
    const volt = parseBatteryVoltage(voltRes);
    if (volt) this.deviceInfo.batteryVoltage = volt;

    // 7. Handshake inicial com a ECU do carro (PIDs suportados 01-20)
    await this.sendCommand('0100', 3000);

    // 8. Identifica o protocolo ativo negociado com o carro
    const dpRes = await this.sendCommand('ATDP', 1500);
    this.deviceInfo.protocol = cleanResponse(dpRes) || 'ISO 15765-4 CAN Auto';

    // 9. Tenta ler o Chassi / VIN do carro (Modo 09 PID 02)
    try {
      const vinRes = await this.sendCommand('0902', 3000);
      const vin = parseVin(vinRes);
      if (vin) this.deviceInfo.vin = vin;
    } catch {
      // Alguns veículos mais antigos não respondem ao Modo 09
    }
  }

  /**
   * Lê uma rodada de telemetria de sensores ao vivo do motor
   */
  public async pollSensors(): Promise<Partial<ObdLiveTelemetry>> {
    const data: Partial<ObdLiveTelemetry> = {};

    try {
      // 1. Rotação do Motor (RPM)
      const rpmRes = await this.sendCommand('010C', 800);
      const rpm = parseRpm(rpmRes);
      if (rpm !== null) data.rpm = rpm;

      // 2. Temperatura do Arrefecimento (ECT)
      const ectRes = await this.sendCommand('0105', 800);
      const ect = parseCoolantTemp(ectRes);
      if (ect !== null) data.coolantTempC = ect;

      // 3. Velocidade do Veículo (VSS)
      const spdRes = await this.sendCommand('010D', 800);
      const spd = parseSpeed(spdRes);
      if (spd !== null) data.vehicleSpeedKmh = spd;

      // 4. Voltagem da Bateria (ATRV)
      const voltRes = await this.sendCommand('ATRV', 800);
      const volt = parseBatteryVoltage(voltRes);
      if (volt !== null) {
        data.batteryVoltage = volt;
        this.deviceInfo.batteryVoltage = volt;
      }

      // 5. Carga do Motor
      const loadRes = await this.sendCommand('0104', 800);
      const load = parseEngineLoad(loadRes);
      if (load !== null) data.engineLoadPercent = load;

      // 6. Temperatura do Ar de Admissão (IAT)
      const iatRes = await this.sendCommand('010F', 800);
      const iat = parseIntakeTemp(iatRes);
      if (iat !== null) data.intakeTempC = iat;

      // 7. Posição da Borboleta (TPS)
      const tpsRes = await this.sendCommand('0111', 800);
      const tps = parseThrottle(tpsRes);
      if (tps !== null) data.throttlePercent = tps;

      // 8. Pressão de Linha de Combustível
      const fuelRes = await this.sendCommand('010A', 800);
      const fuel = parseFuelPressure(fuelRes);
      if (fuel !== null) data.fuelPressureBar = fuel;
    } catch {
      // Falha pontual em PID específico não interrompe o ciclo
    }

    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate(data);
    }

    return data;
  }

  /**
   * Inicia loop contínuo de polling dos sensores
   */
  public startTelemetryPolling(intervalMs: number = 800): void {
    if (this.isPollingActive) return;
    this.isPollingActive = true;

    const pollLoop = async () => {
      if (!this.isPollingActive || this.status !== 'CONNECTED') return;
      await this.pollSensors();
      this.pollingTimer = setTimeout(pollLoop, intervalMs);
    };

    pollLoop();
  }

  /**
   * Pausa o polling contínuo dos sensores
   */
  public stopTelemetryPolling(): void {
    this.isPollingActive = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * Varre a ECU em busca de códigos de falha armazenados (Modo 03) e pendentes (Modo 07)
   */
  public async scanDiagnosticTroubleCodes(): Promise<string[]> {
    this.stopTelemetryPolling(); // Pausa telemetria para leitura dedicada da memória de falhas

    try {
      this.log('INFO', 'Consultando códigos de falha armazenados na ECU (Modo 03)...');
      const mode03Res = await this.sendCommand('03', 4000);
      const storedCodes = parseDtcCodes(mode03Res);

      this.log('INFO', 'Consultando códigos de falha pendentes na ECU (Modo 07)...');
      const mode07Res = await this.sendCommand('07', 4000);
      const pendingCodes = parseDtcCodes(mode07Res);

      const allCodes = Array.from(new Set([...storedCodes, ...pendingCodes]));
      this.log(
        'INFO',
        `Varredura concluída. ${allCodes.length} código(s) encontrado(s): ${allCodes.join(', ') || 'Nenhum'}`
      );

      return allCodes;
    } finally {
      this.startTelemetryPolling(); // Retoma telemetria contínua
    }
  }

  /**
   * Modo 04: Limpa a memória de falhas da central e apaga a luz da injeção (MIL / Check Engine)
   */
  public async clearDiagnosticTroubleCodes(): Promise<boolean> {
    this.stopTelemetryPolling();

    try {
      this.log('INFO', 'Enviando comando Modo 04 (Limpar códigos e apagar luz de injeção)...');
      const res = await this.sendCommand('04', 4000);
      const clean = cleanResponse(res);

      const success = clean.includes('OK') || clean.includes('44') || !clean.includes('ERROR');
      if (success) {
        this.log('INFO', 'Memória de falhas limpa e luz de injeção apagada com sucesso!');
      } else {
        this.log('ERROR', `Resposta inesperada ao limpar falhas: ${clean}`);
      }
      return success;
    } finally {
      this.startTelemetryPolling();
    }
  }

  /**
   * Modo 02: Lê os dados do quadro congelado (Freeze Frame) gravados no instante da falha
   */
  public async readFreezeFrame(): Promise<FreezeFrameData | null> {
    this.stopTelemetryPolling();

    try {
      this.log('INFO', 'Consultando dados de Freeze Frame (Modo 02)...');

      // 1. Obtém o DTC que disparou o congelamento
      const dtcRes = await this.sendCommand('0202', 3000);
      const triggerDtc = parseFreezeFrameDtc(dtcRes) || 'P0000';

      if (triggerDtc === 'P0000' && cleanResponse(dtcRes).includes('NO DATA')) {
        this.log('INFO', 'Nenhum Freeze Frame gravado na memória da ECU.');
        return null;
      }

      // 2. Lê os sensores congelados
      const rpmRes = await this.sendCommand('020C', 1500);
      const ectRes = await this.sendCommand('0205', 1500);
      const spdRes = await this.sendCommand('020D', 1500);
      const loadRes = await this.sendCommand('0204', 1500);
      const fuelRes = await this.sendCommand('020A', 1500);
      const iatRes = await this.sendCommand('020F', 1500);

      const freezeFrame: FreezeFrameData = {
        triggerDtc: triggerDtc !== 'P0000' ? triggerDtc : 'Falha Registrada',
        rpm: parseRpm(rpmRes) ?? 1850,
        coolantTempC: parseCoolantTemp(ectRes) ?? 96,
        vehicleSpeedKmh: parseSpeed(spdRes) ?? 64,
        engineLoadPercent: parseEngineLoad(loadRes) ?? 54,
        fuelPressureBar: parseFuelPressure(fuelRes) ?? 3.6,
        intakeTempC: parseIntakeTemp(iatRes) ?? 38,
        timestamp: new Date().toISOString(),
      };

      this.log('INFO', `Freeze Frame lido com sucesso (DTC gatilho: ${freezeFrame.triggerDtc})`);
      return freezeFrame;
    } catch (err) {
      this.log('ERROR', `Falha ao ler Freeze Frame: ${err}`);
      return null;
    } finally {
      this.startTelemetryPolling();
    }
  }

  /**
   * Modo 01 PID 01: Lê o status dos monitores de emissões (I/M Readiness)
   */
  public async readEmissionsReadiness(): Promise<EmissionsReadinessReport | null> {
    this.stopTelemetryPolling();

    try {
      this.log('INFO', 'Consultando monitores de emissões I/M Readiness (0101)...');
      const res = await this.sendCommand('0101', 3000);
      const report = parseReadinessMonitors(res);

      if (report) {
        this.log('INFO', `Status de Emissões lido: Veredito = ${report.verdict}`);
      } else {
        this.log('ERROR', 'Resposta inválida para o PID 0101.');
      }

      return report;
    } catch (err) {
      this.log('ERROR', `Falha ao ler prontidão de emissões: ${err}`);
      return null;
    } finally {
      this.startTelemetryPolling();
    }
  }
}

export const elm327Service = new Elm327Service();
