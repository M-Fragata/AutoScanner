import type { CustomPidDefinition } from '../types/scanner';

const STORAGE_KEY = 'autoscanner_custom_pids_v1';

export const DEFAULT_CUSTOM_PID_PRESETS: CustomPidDefinition[] = [
  {
    id: 'vw_oil_temp',
    name: 'Temperatura do Óleo do Motor',
    mode: '01',
    pid: '5C',
    formula: 'A - 40',
    unit: '°C',
    minVal: 40,
    maxVal: 150,
    description: 'Temperatura do óleo lubrificante no cárter (motores VW EA888 TSI e EA211).',
    manufacturer: 'Volkswagen / Audi',
    enabled: true,
    lastValue: 92,
  },
  {
    id: 'vw_boost_pressure',
    name: 'Pressão Relativa do Turbo (Boost)',
    mode: '01',
    pid: '0B',
    formula: '(A * 0.01) - 1.0',
    unit: 'bar',
    minVal: -1.0,
    maxVal: 2.2,
    description: 'Pressão de sobrealimentação da turbina relativa à pressão atmosférica.',
    manufacturer: 'Volkswagen / Audi',
    enabled: true,
    lastValue: 0.85,
  },
  {
    id: 'gm_trans_temp',
    name: 'Temperatura do Óleo do Câmbio ATF',
    mode: '22',
    pid: '1940',
    formula: 'A - 40',
    unit: '°C',
    minVal: 30,
    maxVal: 140,
    description: 'Temperatura do fluido hidráulico da transmissão automática (GM 6T30/6T40).',
    manufacturer: 'Chevrolet / GM',
    enabled: false,
    lastValue: 78,
  },
  {
    id: 'ford_hpfp_pressure',
    name: 'Pressão da Linha de Alta HPFP',
    mode: '22',
    pid: '0237',
    formula: '(A * 256 + B) * 0.01',
    unit: 'bar',
    minVal: 0,
    maxVal: 200,
    description: 'Pressão da bomba de injeção direta de combustível (Ford EcoBoost).',
    manufacturer: 'Ford',
    enabled: false,
    lastValue: 140,
  },
  {
    id: 'univ_fuel_level',
    name: 'Nível de Combustível do Tanque',
    mode: '01',
    pid: '2F',
    formula: '(A * 100) / 255',
    unit: '%',
    minVal: 0,
    maxVal: 100,
    description: 'Percentual volumétrico de combustível restante no tanque.',
    manufacturer: 'Universal',
    enabled: true,
    lastValue: 65,
  },
  {
    id: 'univ_ecu_voltage',
    name: 'Tensão Interna do Módulo ECU',
    mode: '01',
    pid: '42',
    formula: '(A * 256 + B) / 1000',
    unit: 'V',
    minVal: 9,
    maxVal: 16,
    description: 'Tensão medida diretamente pelos conversores AD internos da centralina.',
    manufacturer: 'Universal',
    enabled: true,
    lastValue: 14.15,
  },
];

export interface FormulaVariables {
  A: number;
  B: number;
  C: number;
  D: number;
}

/**
 * Avaliador matemático seguro sem uso de eval().
 * Implementa o algoritmo Shunting-yard para converter expressões infix em RPN
 * e avalia operadores +, -, *, /, ^, parênteses e funções min/max/round.
 */
export function evaluateSafeFormula(formula: string, vars: FormulaVariables): number {
  const clean = formula.trim();
  if (!clean) return 0;

  // Substitui variáveis A, B, C, D por seus valores numéricos
  // Tokenização
  const tokens: string[] = [];
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let numStr = '';
      while (i < clean.length && /[0-9.]/.test(clean[i])) {
        numStr += clean[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let ident = '';
      while (i < clean.length && /[a-zA-Z0-9]/.test(clean[i])) {
        ident += clean[i];
        i++;
      }
      const upper = ident.toUpperCase();
      if (upper === 'A') tokens.push(String(vars.A));
      else if (upper === 'B') tokens.push(String(vars.B));
      else if (upper === 'C') tokens.push(String(vars.C));
      else if (upper === 'D') tokens.push(String(vars.D));
      else tokens.push(ident.toLowerCase());
      continue;
    }

    if (['+', '-', '*', '/', '^', '(', ')'].includes(char)) {
      // Trata números negativos unários (ex: "-1.0" ou "(-1)")
      if (
        char === '-' &&
        (tokens.length === 0 || ['(', '+', '-', '*', '/', '^'].includes(tokens[tokens.length - 1]))
      ) {
        let numStr = '-';
        i++;
        while (i < clean.length && /[0-9.]/.test(clean[i])) {
          numStr += clean[i];
          i++;
        }
        tokens.push(numStr);
        continue;
      }

      tokens.push(char);
      i++;
      continue;
    }

    i++;
  }

  // Precedência de operadores
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  const outputQueue: string[] = [];
  const operatorStack: string[] = [];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if (token in precedence) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop();
      }
    }
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop()!);
  }

  // Avaliação da notação polonesa reversa (RPN)
  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (!isNaN(Number(token))) {
      evalStack.push(Number(token));
    } else {
      const b = evalStack.pop() ?? 0;
      const a = evalStack.pop() ?? 0;
      let res = 0;

      switch (token) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
          res = a * b;
          break;
        case '/':
          res = b === 0 ? 0 : a / b;
          break;
        case '^':
          res = Math.pow(a, b);
          break;
        default:
          res = 0;
      }
      evalStack.push(res);
    }
  }

  const finalResult = evalStack.length > 0 ? evalStack[0] : 0;
  return isNaN(finalResult) || !isFinite(finalResult) ? 0 : finalResult;
}

/**
 * Extrai os bytes hexadecimais de uma resposta do ELM327 (ex: "41 5C 68" ou "62 19 40 55")
 */
export function extractHexBytes(rawHex: string): FormulaVariables {
  // Remove caracteres de retorno e espaços duplicados
  const cleaned = rawHex
    .replace(/[>\r\n]/g, '')
    .trim()
    .toUpperCase();

  const parts = cleaned.split(/\s+/).filter((p) => /^[0-9A-F]{2}$/.test(p));

  // Se tiver prefixo de resposta OBD (ex: "41 5C", pula os primeiros 2 bytes de echo)
  let byteOffset = 0;
  if (parts.length >= 3 && (parts[0] === '41' || parts[0].startsWith('4'))) {
    byteOffset = 2; // Pula modo e PID
  } else if (parts.length >= 4 && parts[0] === '62') {
    byteOffset = 3; // Pula Modo 22 e PID de 2 bytes
  }

  const payload = parts.slice(byteOffset);

  return {
    A: payload.length > 0 ? parseInt(payload[0], 16) : 0,
    B: payload.length > 1 ? parseInt(payload[1], 16) : 0,
    C: payload.length > 2 ? parseInt(payload[2], 16) : 0,
    D: payload.length > 3 ? parseInt(payload[3], 16) : 0,
  };
}

export function testCustomPidFormula(
  formula: string,
  sampleHex: string
): { success: boolean; result?: number; formatted?: string; error?: string } {
  try {
    const vars = extractHexBytes(sampleHex);
    const result = evaluateSafeFormula(formula, vars);
    const rounded = Number(result.toFixed(2));
    return {
      success: true,
      result: rounded,
      formatted: `${rounded} (A=${vars.A}, B=${vars.B}, C=${vars.C}, D=${vars.D})`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro na fórmula matemática',
    };
  }
}

class CustomPidManagerService {
  private pids: CustomPidDefinition[] = [];

  constructor() {
    this.loadPids();
  }

  public getPids(): CustomPidDefinition[] {
    return this.pids;
  }

  public getEnabledPids(): CustomPidDefinition[] {
    return this.pids.filter((p) => p.enabled);
  }

  public savePids(pids: CustomPidDefinition[]): void {
    this.pids = pids;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pids));
    } catch {
      // Ignora erro de localStorage
    }
  }

  public loadPids(): CustomPidDefinition[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CustomPidDefinition[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.pids = parsed;
          return this.pids;
        }
      }
    } catch {
      // Fallback
    }

    this.pids = [...DEFAULT_CUSTOM_PID_PRESETS];
    this.savePids(this.pids);
    return this.pids;
  }

  public addPid(pid: Omit<CustomPidDefinition, 'id'>): CustomPidDefinition {
    const newPid: CustomPidDefinition = {
      ...pid,
      id: `pid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    this.pids.push(newPid);
    this.savePids(this.pids);
    return newPid;
  }

  public updatePid(id: string, updates: Partial<CustomPidDefinition>): boolean {
    const idx = this.pids.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    this.pids[idx] = { ...this.pids[idx], ...updates };
    this.savePids(this.pids);
    return true;
  }

  public deletePid(id: string): boolean {
    const initialLen = this.pids.length;
    this.pids = this.pids.filter((p) => p.id !== id);
    if (this.pids.length !== initialLen) {
      this.savePids(this.pids);
      return true;
    }
    return false;
  }

  public togglePid(id: string): boolean {
    const pid = this.pids.find((p) => p.id === id);
    if (!pid) return false;
    pid.enabled = !pid.enabled;
    this.savePids(this.pids);
    return true;
  }

  public importPreset(preset: CustomPidDefinition): void {
    const existing = this.pids.find((p) => p.mode === preset.mode && p.pid === preset.pid);
    if (!existing) {
      this.addPid(preset);
    } else {
      this.updatePid(existing.id, { enabled: true });
    }
  }

  public resetToDefaults(): CustomPidDefinition[] {
    this.pids = [...DEFAULT_CUSTOM_PID_PRESETS];
    this.savePids(this.pids);
    return this.pids;
  }

  /**
   * Simula a variação suave de valores para os PIDs customizados ativos
   */
  public simulateLiveValues(): void {
    const now = Date.now();
    this.pids.forEach((p) => {
      if (!p.enabled) return;

      const current = p.lastValue ?? (p.minVal + p.maxVal) / 2;
      const step = (p.maxVal - p.minVal) * 0.02;
      const delta = (Math.random() - 0.5) * step;
      let next = current + delta;

      if (next > p.maxVal) next = p.maxVal;
      if (next < p.minVal) next = p.minVal;

      p.lastValue = Number(next.toFixed(2));
      p.lastUpdated = now;
    });
  }
}

export const customPidService = new CustomPidManagerService();
