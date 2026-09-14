/**
 * Funções puras para decodificação de respostas do protocolo OBD-II / ELM327.
 * Suporta Modos 01, 02 (Freeze Frame), 03, 04, 07 e 09.
 */
import type { EmissionsReadinessReport, ReadinessMonitor } from '../../types/scanner.ts';

// Limpa caracteres especiais, prompt '>' e quebras de linha
export function cleanResponse(raw: string): string {
  return raw
    .replace(/>/g, '')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Remove espaços para análise de sequência contínua de bytes hexadecimais
export function stripSpaces(raw: string): string {
  return cleanResponse(raw).replace(/\s+/g, '').toUpperCase();
}

/**
 * Decodifica a voltagem lida pelo comando ATRV (ex: "13.8V" -> 13.8)
 */
export function parseBatteryVoltage(response: string): number | null {
  const match = response.match(/(\d+\.?\d*)\s*V/i);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? null : Number(val.toFixed(1));
  }
  return null;
}

/**
 * Decodifica Rotação do Motor (RPM) - Modo 01 PID 0C ou Modo 02 PID 0C
 * Fórmula SAE J1979: ((A * 256) + B) / 4
 */
export function parseRpm(response: string): number | null {
  const hex = stripSpaces(response);
  const m1 = hex.indexOf('410C');
  const m2 = hex.indexOf('420C');
  const index = m1 !== -1 ? m1 : m2;
  if (index === -1) return null;

  // No Modo 02 pode haver um byte de número de quadro (ex: "420C00AABB")
  const isMode02WithFrame = m2 !== -1 && hex.length >= index + 10 && hex.substring(index + 4, index + 6) === '00';
  const offset = isMode02WithFrame ? 6 : 4;

  if (hex.length < index + offset + 4) return null;

  const a = parseInt(hex.substring(index + offset, index + offset + 2), 16);
  const b = parseInt(hex.substring(index + offset + 2, index + offset + 4), 16);
  if (isNaN(a) || isNaN(b)) return null;

  return Math.round(((a * 256) + b) / 4);
}

/**
 * Decodifica Temperatura do Líquido de Arrefecimento (ECT) - Modo 01 PID 05 ou Modo 02 PID 05
 * Fórmula SAE J1979: A - 40 (°C)
 */
export function parseCoolantTemp(response: string): number | null {
  const hex = stripSpaces(response);
  const m1 = hex.indexOf('4105');
  const m2 = hex.indexOf('4205');
  const index = m1 !== -1 ? m1 : m2;
  if (index === -1) return null;

  const isMode02WithFrame = m2 !== -1 && hex.length >= index + 8 && hex.substring(index + 4, index + 6) === '00';
  const offset = isMode02WithFrame ? 6 : 4;

  if (hex.length < index + offset + 2) return null;

  const a = parseInt(hex.substring(index + offset, index + offset + 2), 16);
  if (isNaN(a)) return null;

  return a - 40;
}

/**
 * Decodifica Velocidade do Veículo (VSS) - Modo 01 PID 0D ou Modo 02 PID 0D
 * Fórmula SAE J1979: A (km/h)
 */
export function parseSpeed(response: string): number | null {
  const hex = stripSpaces(response);
  const m1 = hex.indexOf('410D');
  const m2 = hex.indexOf('420D');
  const index = m1 !== -1 ? m1 : m2;
  if (index === -1) return null;

  const isMode02WithFrame = m2 !== -1 && hex.length >= index + 8 && hex.substring(index + 4, index + 6) === '00';
  const offset = isMode02WithFrame ? 6 : 4;

  if (hex.length < index + offset + 2) return null;

  const a = parseInt(hex.substring(index + offset, index + offset + 2), 16);
  if (isNaN(a)) return null;

  return a;
}

/**
 * Decodifica Carga Calculada do Motor - Modo 01 PID 04 ou Modo 02 PID 04
 * Fórmula SAE J1979: (A * 100) / 255 (%)
 */
export function parseEngineLoad(response: string): number | null {
  const hex = stripSpaces(response);
  const m1 = hex.indexOf('4104');
  const m2 = hex.indexOf('4204');
  const index = m1 !== -1 ? m1 : m2;
  if (index === -1) return null;

  const isMode02WithFrame = m2 !== -1 && hex.length >= index + 8 && hex.substring(index + 4, index + 6) === '00';
  const offset = isMode02WithFrame ? 6 : 4;

  if (hex.length < index + offset + 2) return null;

  const a = parseInt(hex.substring(index + offset, index + offset + 2), 16);
  if (isNaN(a)) return null;

  return Math.round((a * 100) / 255);
}

/**
 * Decodifica Temperatura do Ar de Admissão (IAT) - Modo 01 PID 0F ou Modo 02 PID 0F
 * Fórmula SAE J1979: A - 40 (°C)
 */
export function parseIntakeTemp(response: string): number | null {
  const hex = stripSpaces(response);
  const m1 = hex.indexOf('410F');
  const m2 = hex.indexOf('420F');
  const index = m1 !== -1 ? m1 : m2;
  if (index === -1) return null;

  const isMode02WithFrame = m2 !== -1 && hex.length >= index + 8 && hex.substring(index + 4, index + 6) === '00';
  const offset = isMode02WithFrame ? 6 : 4;

  if (hex.length < index + offset + 2) return null;

  const a = parseInt(hex.substring(index + offset, index + offset + 2), 16);
  if (isNaN(a)) return null;

  return a - 40;
}

/**
 * Decodifica Posição da Borboleta (TPS) - Modo 01 PID 11 ou Modo 02 PID 11
 * Fórmula SAE J1979: (A * 100) / 255 (%)
 */
export function parseThrottle(response: string): number | null {
  const hex = stripSpaces(response);
  const m1 = hex.indexOf('4111');
  const m2 = hex.indexOf('4211');
  const index = m1 !== -1 ? m1 : m2;
  if (index === -1) return null;

  const isMode02WithFrame = m2 !== -1 && hex.length >= index + 8 && hex.substring(index + 4, index + 6) === '00';
  const offset = isMode02WithFrame ? 6 : 4;

  if (hex.length < index + offset + 2) return null;

  const a = parseInt(hex.substring(index + offset, index + offset + 2), 16);
  if (isNaN(a)) return null;

  return Math.round((a * 100) / 255);
}

/**
 * Decodifica Pressão de Combustível da Linha - Modo 01 PID 0A ou Modo 02 PID 0A
 * Fórmula SAE J1979: A * 3 (kPa) -> convertido para BAR (/ 100)
 */
export function parseFuelPressure(response: string): number | null {
  const hex = stripSpaces(response);
  const m1 = hex.indexOf('410A');
  const m2 = hex.indexOf('420A');
  const index = m1 !== -1 ? m1 : m2;
  if (index === -1) return null;

  const isMode02WithFrame = m2 !== -1 && hex.length >= index + 8 && hex.substring(index + 4, index + 6) === '00';
  const offset = isMode02WithFrame ? 6 : 4;

  if (hex.length < index + offset + 2) return null;

  const a = parseInt(hex.substring(index + offset, index + offset + 2), 16);
  if (isNaN(a)) return null;

  const bar = (a * 3) / 100;
  return Number(bar.toFixed(1));
}

const SYSTEM_PREFIX_MAP: Record<string, string> = {
  '0': 'P0', '1': 'P1', '2': 'P2', '3': 'P3',
  '4': 'C0', '5': 'C1', '6': 'C2', '7': 'C3',
  '8': 'B0', '9': 'B1', 'A': 'B2', 'B': 'B3',
  'C': 'U0', 'D': 'U1', 'E': 'U2', 'F': 'U3',
};

/**
 * Decodifica o código DTC que causou o Freeze Frame (Modo 02 PID 02)
 * Resposta típica: "42 02 00 03 00" -> P0300
 */
export function parseFreezeFrameDtc(response: string): string | null {
  const hex = stripSpaces(response);
  const index = hex.indexOf('4202');
  if (index === -1) return null;

  // Pode ter byte de frame 00 antes do código: 42 02 00 03 00
  let payload = hex.substring(index + 4);
  if (payload.startsWith('00') && payload.length >= 6) {
    payload = payload.substring(2);
  }

  if (payload.length < 4 || payload.substring(0, 4) === '0000') return null;

  const firstChar = payload[0];
  const prefix = SYSTEM_PREFIX_MAP[firstChar];
  if (!prefix) return null;

  return `${prefix}${payload.substring(1, 4)}`;
}

/**
 * Decodifica Códigos de Falha DTC (Modo 03 e Modo 07)
 */
export function parseDtcCodes(response: string): string[] {
  const clean = cleanResponse(response).toUpperCase();

  if (
    clean.includes('NO DATA') ||
    clean.includes('UNABLE TO CONNECT') ||
    clean.includes('ERROR') ||
    clean.includes('BUS INIT')
  ) {
    return [];
  }

  const hex = stripSpaces(response);
  const modeIndex = Math.max(hex.indexOf('43'), hex.indexOf('47'));
  if (modeIndex === -1) return [];

  const dataPayload = hex.substring(modeIndex + 2);
  const codes: string[] = [];

  for (let i = 0; i + 4 <= dataPayload.length; i += 4) {
    const chunk = dataPayload.substring(i, i + 4);
    if (chunk === '0000') continue;

    const firstChar = chunk[0];
    const prefix = SYSTEM_PREFIX_MAP[firstChar];
    if (prefix) {
      const code = `${prefix}${chunk.substring(1, 4)}`;
      if (!codes.includes(code)) {
        codes.push(code);
      }
    }
  }

  return codes;
}

/**
 * Decodifica o Status dos Monitores de Emissões / I/M Readiness (Modo 01 PID 01)
 * Resposta típica: "41 01 81 07 65 04" (4 bytes A, B, C, D)
 */
export function parseReadinessMonitors(response: string): EmissionsReadinessReport | null {
  const hex = stripSpaces(response);
  const index = hex.indexOf('4101');
  if (index === -1 || hex.length < index + 12) return null;

  const byteA = parseInt(hex.substring(index + 4, index + 6), 16);
  const byteB = parseInt(hex.substring(index + 6, index + 8), 16);
  const byteC = parseInt(hex.substring(index + 8, index + 10), 16);
  const byteD = parseInt(hex.substring(index + 10, index + 12), 16);

  if (isNaN(byteA) || isNaN(byteB) || isNaN(byteC) || isNaN(byteD)) return null;

  // Byte A: Bit 7 = MIL Status, Bits 0-6 = DTC Count
  const milStatus = Boolean((byteA & 0x80) !== 0);
  const dtcCount = byteA & 0x7f;

  const monitors: ReadinessMonitor[] = [];

  // Monitores Contínuos (Byte B)
  // Bit 0 = Misfire sup, Bit 4 = Misfire complete (0 = ready, 1 = not ready)
  monitors.push({
    id: 'misfire',
    name: 'Falha de Combustão (Misfire)',
    supported: Boolean((byteB & 0x01) !== 0),
    ready: Boolean((byteB & 0x10) === 0),
    description: 'Monitoramento de falha de ignição e queima nos cilindros.',
  });

  // Bit 1 = Fuel System sup, Bit 5 = Fuel System complete
  monitors.push({
    id: 'fuel_system',
    name: 'Sistema de Combustível',
    supported: Boolean((byteB & 0x02) !== 0),
    ready: Boolean((byteB & 0x20) === 0),
    description: 'Controle de dosagem e malha fechada de injeção.',
  });

  // Bit 2 = Comprehensive Components sup, Bit 6 = Comprehensive complete
  monitors.push({
    id: 'components',
    name: 'Componentes Abrangentes',
    supported: Boolean((byteB & 0x04) !== 0),
    ready: Boolean((byteB & 0x40) === 0),
    description: 'Sensores essenciais de entrada e atuadores da ECU.',
  });

  // Monitores Não Contínuos (Byte C = Supported, Byte D = Completed se bit for 0)
  const nonContinuousDefs = [
    { id: 'catalyst', bit: 0, name: 'Catalisador (CAT)', desc: 'Eficiência de conversão catalítica dos gases de escape.' },
    { id: 'heated_catalyst', bit: 1, name: 'Aquecedor do Catalisador', desc: 'Aquecimento rápido do catalisador na partida a frio.' },
    { id: 'evap', bit: 2, name: 'Sistema Evaporativo (EVAP)', desc: 'Purga e contenção de vapores do tanque de combustível.' },
    { id: 'secondary_air', bit: 3, name: 'Ar Secundário (AIR)', desc: 'Injeção de ar fresco pós-combustão no coletor de escape.' },
    { id: 'ac_refrigerant', bit: 4, name: 'Gás do Ar Condicionado', desc: 'Monitor de retenção e vazamento de gás refrigerante.' },
    { id: 'o2_sensor', bit: 5, name: 'Sensor de Oxigênio (Sonda Lambda)', desc: 'Resiliência e tempo de resposta da sonda lambda.' },
    { id: 'o2_heater', bit: 6, name: 'Aquecedor da Sonda Lambda', desc: 'Resistência de pré-aquecimento do sensor de O2.' },
    { id: 'egr_vvt', bit: 7, name: 'Válvula EGR / Comando VVT', desc: 'Recirculação de gases de escape e sincronismo variável.' },
  ];

  for (const def of nonContinuousDefs) {
    const isSupported = Boolean((byteC & (1 << def.bit)) !== 0);
    // Em OBD-II, o bit é 0 quando o teste está concluído (Ready)
    const isReady = isSupported && Boolean((byteD & (1 << def.bit)) === 0);

    monitors.push({
      id: def.id,
      name: def.name,
      supported: isSupported,
      ready: isReady,
      description: def.desc,
    });
  }

  // Julgamento do veredito de inspeção veicular
  const supportedMonitors = monitors.filter((m) => m.supported);
  const incompleteMonitors = supportedMonitors.filter((m) => !m.ready);

  let verdict: EmissionsReadinessReport['verdict'] = 'APROVADO';
  let summary = 'Todos os monitores de emissões concluídos com sucesso. Veículo apto para inspeção.';

  if (milStatus) {
    verdict = 'REPROVADO_LUZ_MIL';
    summary = `Luz de injeção (MIL) acesa com ${dtcCount} código(s) de falha ativo(s). Veículo reprovado na inspeção veicular.`;
  } else if (incompleteMonitors.length > 0) {
    verdict = 'REPROVADO_INCOMPLETO';
    summary = `${incompleteMonitors.length} monitor(es) ainda não completaram o ciclo de rodagem. Conduza o veículo em ciclo urbano e rodovia para finalizar os autotestes.`;
  }

  return {
    milStatus,
    dtcCount,
    verdict,
    monitors,
    summary,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Decodifica o Número do Chassi (VIN) do Modo 09 PID 02
 */
export function parseVin(response: string): string | null {
  const hex = stripSpaces(response);
  const modeIndex = hex.indexOf('4902');
  if (modeIndex === -1) return null;

  const rawBytes = hex.substring(modeIndex + 4);
  let ascii = '';

  for (let i = 0; i < rawBytes.length; i += 2) {
    const byte = parseInt(rawBytes.substring(i, i + 2), 16);
    if (byte >= 33 && byte <= 126) {
      ascii += String.fromCharCode(byte);
    }
  }

  const match = ascii.match(/[A-HJ-NPR-Z0-9]{17}/);
  return match ? match[0] : ascii.length >= 10 ? ascii.slice(0, 17) : null;
}
