import { getGeminiClient } from '../utils/geminiClient.ts';
import { OBD_DTC_DATABASE } from '../utils/sampleCodes.ts';
import type { DtcDefinition } from '../utils/sampleCodes.ts';

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  mileageKm: number;
}

export interface SensorTelemetry {
  rpm: number;
  coolantTempC: number;
  vehicleSpeedKmh: number;
  batteryVoltage: number;
  fuelPressureBar: number;
  intakeTempC: number;
}

export interface DiagnosticInput {
  vehicle: VehicleInfo;
  dtcCodes: string[];
  symptoms?: string;
  telemetry?: SensorTelemetry;
}

export interface ProbableCause {
  cause: string;
  probability: number;
  description: string;
}

export interface DiagnosticAction {
  stepNumber: number;
  title: string;
  action: string;
  requiredTools: string[];
}

export interface CostEstimate {
  currency: string;
  minCost: number;
  maxCost: number;
  partsDescription: string;
}

export interface AiDiagnosticReport {
  summary: string;
  severity: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
  safetyAssessment: {
    isSafeToDrive: boolean;
    safetyNote: string;
  };
  probableCauses: ProbableCause[];
  recommendedActions: DiagnosticAction[];
  costEstimate: CostEstimate;
  affectedSystems: string[];
  aiSource: 'google-gemini' | 'rule-engine-fallback';
  analyzedAt: string;
}

export class GeminiService {
  public async generateDiagnosticReport(input: DiagnosticInput): Promise<AiDiagnosticReport> {
    const client = getGeminiClient();

    if (client) {
      try {
        const report = await this.callGeminiApi(client, input);
        if (report) {
          return report;
        }
      } catch (err) {
        console.warn('⚠️ Erro ao chamar API do Gemini, acionando motor heurístico de fallback:', err);
      }
    }

    return this.generateHeuristicReport(input);
  }

  private async callGeminiApi(
    client: NonNullable<ReturnType<typeof getGeminiClient>>,
    input: DiagnosticInput
  ): Promise<AiDiagnosticReport | null> {
    const prompt = this.buildPrompt(input);

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      return null;
    }

    const parsed = JSON.parse(text) as {
      summary?: string;
      severity?: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
      safetyAssessment?: { isSafeToDrive: boolean; safetyNote: string };
      probableCauses?: ProbableCause[];
      recommendedActions?: DiagnosticAction[];
      costEstimate?: CostEstimate;
      affectedSystems?: string[];
    };

    return {
      summary: parsed.summary || 'Diagnóstico preliminar gerado por IA.',
      severity: parsed.severity || 'MÉDIA',
      safetyAssessment: parsed.safetyAssessment || {
        isSafeToDrive: false,
        safetyNote: 'Recomenda-se conduzir o veículo cautelosamente até a oficina mais próxima.',
      },
      probableCauses: parsed.probableCauses || [],
      recommendedActions: parsed.recommendedActions || [],
      costEstimate: parsed.costEstimate || {
        currency: 'BRL',
        minCost: 150,
        maxCost: 800,
        partsDescription: 'Verificação em oficina especializada.',
      },
      affectedSystems: parsed.affectedSystems || ['Injeção Eletrônica', 'Motor'],
      aiSource: 'google-gemini',
      analyzedAt: new Date().toISOString(),
    };
  }

  private buildPrompt(input: DiagnosticInput): string {
    return `Você é um Engenheiro Mecânico Automotivo especialista em diagnósticos OBD-II e injeção eletrônica.
Analise os seguintes dados do veículo e emita um laudo técnico minucioso em formato JSON estrito:

Veículo:
- Marca/Modelo: ${input.vehicle.make} ${input.vehicle.model}
- Ano de Fabricação: ${input.vehicle.year}
- Quilometragem: ${input.vehicle.mileageKm} km

Códigos de Falha OBD-II (DTC):
${input.dtcCodes.length > 0 ? input.dtcCodes.join(', ') : 'Nenhum código DTC ativo informado'}

Sintomas descritos pelo condutor:
${input.symptoms || 'Nenhum sintoma anormal reportado verbalmente'}

Leituras de Telemetria de Sensores:
${
  input.telemetry
    ? `- RPM: ${input.telemetry.rpm}
- Temperatura do Motor: ${input.telemetry.coolantTempC}°C
- Velocidade: ${input.telemetry.vehicleSpeedKmh} km/h
- Voltagem da Bateria: ${input.telemetry.batteryVoltage} V
- Pressão de Combustível: ${input.telemetry.fuelPressureBar} bar
- Temperatura do Ar de Admissão: ${input.telemetry.intakeTempC}°C`
    : 'Telemetria em tempo real não fornecida.'
}

Retorne ESTRITAMENTE uma resposta JSON com o seguinte schema:
{
  "summary": "Resumo técnico claro e compreensível para o condutor e mecânico",
  "severity": "BAIXA" | "MÉDIA" | "ALTA" | "CRÍTICA",
  "safetyAssessment": {
    "isSafeToDrive": boolean,
    "safetyNote": "Orientações imediatas sobre segurança e dirigibilidade"
  },
  "probableCauses": [
    {
      "cause": "Nome do componente ou causa provável",
      "probability": 75,
      "description": "Explicação detalhada do motivo da falha"
    }
  ],
  "recommendedActions": [
    {
      "stepNumber": 1,
      "title": "Ação a ser executada",
      "action": "Procedimento de diagnóstico ou reparo",
      "requiredTools": ["Multímetro", "Chave de vela"]
    }
  ],
  "costEstimate": {
    "currency": "BRL",
    "minCost": 200,
    "maxCost": 600,
    "partsDescription": "Estimativa dos componentes ou serviços a serem substituídos/revisados"
  },
  "affectedSystems": ["Sistema de Ignição", "Alimentação de Combustível"]
}`;
  }

  private generateHeuristicReport(input: DiagnosticInput): AiDiagnosticReport {
    const knownDefinitions: DtcDefinition[] = input.dtcCodes
      .map((code) => OBD_DTC_DATABASE[code.toUpperCase()])
      .filter((d): d is DtcDefinition => Boolean(d));

    let maxSeverity: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA' = 'BAIXA';
    const severityHierarchy = { BAIXA: 1, MÉDIA: 2, ALTA: 3, CRÍTICA: 4 };

    for (const def of knownDefinitions) {
      if (severityHierarchy[def.severity] > severityHierarchy[maxSeverity]) {
        maxSeverity = def.severity;
      }
    }

    if (input.telemetry) {
      if (input.telemetry.coolantTempC > 108 || input.telemetry.batteryVoltage < 11.5) {
        maxSeverity = 'CRÍTICA';
      } else if (input.telemetry.coolantTempC > 102 && maxSeverity === 'BAIXA') {
        maxSeverity = 'ALTA';
      }
    }

    const isSafe = maxSeverity === 'BAIXA' || maxSeverity === 'MÉDIA';
    const causes: ProbableCause[] = [];
    const actions: DiagnosticAction[] = [];
    const affectedSystems: Set<string> = new Set(['ECU / Injeção']);

    if (knownDefinitions.length > 0) {
      knownDefinitions.forEach((def, index) => {
        affectedSystems.add(def.category);
        def.commonCauses.forEach((cause, cIndex) => {
          if (causes.length < 5) {
            causes.push({
              cause,
              probability: Math.max(90 - (index * 15 + cIndex * 10), 30),
              description: `Associado ao código de anomalia ${def.code} detectado no módulo do trem de força.`,
            });
          }
        });

        actions.push({
          stepNumber: actions.length + 1,
          title: `Diagnóstico do DTC ${def.code} - ${def.title}`,
          action: `Inspecionar fiação, conectores e parâmetros de funcionamento referentes ao componente associado (${def.title}).`,
          requiredTools: ['Scanner OBD-II', 'Multímetro Automotivo'],
        });
      });
    } else {
      causes.push({
        cause: 'Desgaste operacional por quilometragem ou anomalia intermitente',
        probability: 50,
        description: 'Sem códigos DTC ativos mapeados diretamente no banco padrão.',
      });
      actions.push({
        stepNumber: 1,
        title: 'Verificação Preventiva',
        action: 'Efetuar varredura completa da rede CAN e checar parâmetros de sensores em marcha lenta.',
        requiredTools: ['Scanner Automotivo'],
      });
    }

    const minCost = maxSeverity === 'CRÍTICA' ? 450 : maxSeverity === 'ALTA' ? 250 : 120;
    const maxCost = maxSeverity === 'CRÍTICA' ? 1800 : maxSeverity === 'ALTA' ? 950 : 400;

    return {
      summary: `Análise diagnóstica para ${input.vehicle.make} ${input.vehicle.model} (${input.vehicle.year}) com ${input.dtcCodes.length} código(s) de falha e ${input.vehicle.mileageKm} km rodados.`,
      severity: maxSeverity,
      safetyAssessment: {
        isSafeToDrive: isSafe,
        safetyNote: isSafe
          ? 'O veículo pode ser conduzido até um centro automotivo, mas evite acelerações bruscas e altas rotações.'
          : 'ALERTA: Risco de danos severos ao motor ou perda de dirigibilidade. Recomenda-se guincho ou parada imediata.',
      },
      probableCauses: causes,
      recommendedActions: actions,
      costEstimate: {
        currency: 'BRL',
        minCost,
        maxCost,
        partsDescription: 'Substituição preventiva/corretiva de sensores, ignição ou revisão de chicote elétrico.',
      },
      affectedSystems: Array.from(affectedSystems),
      aiSource: 'rule-engine-fallback',
      analyzedAt: new Date().toISOString(),
    };
  }

  public async generatePredictiveReport(input: PredictiveInput): Promise<PredictiveReport> {
    const client = getGeminiClient();

    if (client) {
      try {
        const report = await this.callGeminiPredictApi(client, input);
        if (report) {
          return report;
        }
      } catch (err) {
        console.warn('⚠️ Erro ao chamar API do Gemini para análise preditiva, acionando motor heurístico:', err);
      }
    }

    return this.generateHeuristicPredictiveReport(input);
  }

  private async callGeminiPredictApi(
    client: NonNullable<ReturnType<typeof getGeminiClient>>,
    input: PredictiveInput
  ): Promise<PredictiveReport | null> {
    const samplesSnippet = input.telemetryHistory
      .slice(-15)
      .map(
        (s, idx) =>
          `Amostra ${idx + 1} (${new Date(s.timestamp).toLocaleTimeString()}): RPM=${s.rpm}, Temp=${s.coolantTempC}°C, Speed=${s.vehicleSpeedKmh}km/h, Bateria=${s.batteryVoltage}V, PressãoComb=${s.fuelPressureBar}bar, IAT=${s.intakeTempC}°C`
      )
      .join('\n');

    const prompt = `Você é um Engenheiro Mecânico Automotivo especialista em Telemetria e Manutenção Preditiva.
Analise esta série temporal de telemetria automotiva do veículo ${input.vehicle.make} ${input.vehicle.model} (${input.vehicle.year}, ${input.vehicle.mileageKm} km rodados).
Sintomas informados pelo condutor: ${input.symptoms || 'Nenhum'}.

Histórico recente de telemetria dos sensores:
${samplesSnippet}

Identifique tendências de desgaste, oscilações térmicas, instabilidades elétricas ou anomalias mecânicas antes que o carro acenda a luz da injeção.
Retorne ESTRITAMENTE um JSON com o seguinte schema:
{
  "summary": "Resumo preditivo claro da saúde do motor e sistemas",
  "wearRiskLevel": "BAIXO" | "MODERADO" | "ELEVADO" | "CRÍTICO",
  "confidenceScore": 85,
  "trends": [
    {
      "parameter": "Temperatura de Arrefecimento",
      "trend": "ESTÁVEL" | "ELEVAÇÃO" | "QUEDA" | "FLUTUAÇÃO_ANORMAL",
      "significance": "Explicação técnica da tendência"
    }
  ],
  "predictedFailure": {
    "component": "Componente em risco precoce",
    "description": "Como e por que a falha pode se manifestar",
    "estimatedTimeToFailure": "Estimativa de tempo ou km (ex: 800 a 2000 km)"
  },
  "preventiveRecommendations": [
    "Recomendação de revisão preventiva antes do defeito grave"
  ]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as Partial<PredictiveReport>;

    return {
      summary: parsed.summary || 'Análise preditiva preliminar baseada em série temporal.',
      wearRiskLevel: parsed.wearRiskLevel || 'MODERADO',
      confidenceScore: parsed.confidenceScore || 80,
      trends: parsed.trends || [],
      predictedFailure: parsed.predictedFailure || {
        component: 'Sistema de Arrefecimento / Injeção',
        description: 'Variações nos parâmetros operacionais indicam desgaste preliminar.',
        estimatedTimeToFailure: '1000 - 3000 km',
      },
      preventiveRecommendations: parsed.preventiveRecommendations || [
        'Checagem periódica do nível de fluido de arrefecimento e tensão da bateria.',
      ],
      analyzedSamplesCount: input.telemetryHistory.length,
      analyzedAt: new Date().toISOString(),
      aiSource: 'google-gemini',
    };
  }

  private generateHeuristicPredictiveReport(input: PredictiveInput): PredictiveReport {
    const history = input.telemetryHistory;
    const count = history.length;

    const temps = history.map((h) => h.coolantTempC);
    const volts = history.map((h) => h.batteryVoltage);
    const pressures = history.map((h) => h.fuelPressureBar);

    const maxTemp = Math.max(...temps);
    const minVolt = Math.min(...volts);
    const maxVolt = Math.max(...volts);
    const minPressure = Math.min(...pressures);

    const firstTemp = temps[0];
    const lastTemp = temps[temps.length - 1];
    const tempSlope = lastTemp - firstTemp;

    let wearRiskLevel: 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRÍTICO' = 'BAIXO';
    const trends: PredictiveTrend[] = [];

    // Análise de temperatura
    if (maxTemp > 105 || tempSlope > 6) {
      wearRiskLevel = 'ELEVADO';
      trends.push({
        parameter: 'Temperatura de Arrefecimento',
        trend: 'ELEVAÇÃO',
        significance: 'Gradiente térmico crescente acelerado. Risco de superaquecimento em congestionamento.',
      });
    } else {
      trends.push({
        parameter: 'Temperatura de Arrefecimento',
        trend: 'ESTÁVEL',
        significance: 'Temperatura operacional contida dentro da faixa ideal de projeto (85-98°C).',
      });
    }

    // Análise de bateria / alternador
    if (minVolt < 12.0) {
      wearRiskLevel = wearRiskLevel === 'ELEVADO' ? 'CRÍTICO' : 'MODERADO';
      trends.push({
        parameter: 'Tensão Elétrica (Alternador)',
        trend: 'QUEDA',
        significance: 'Subtensão transitória (<12.0V) detectada. Possível desgaste nas escovas do alternador.',
      });
    } else if (maxVolt > 14.8) {
      trends.push({
        parameter: 'Tensão Elétrica (Alternador)',
        trend: 'FLUTUAÇÃO_ANORMAL',
        significance: 'Picos de tensão acima de 14.8V sugerem falha do regulador de voltagem.',
      });
    } else {
      trends.push({
        parameter: 'Tensão Elétrica (Alternador)',
        trend: 'ESTÁVEL',
        significance: 'Tensão de recarga estável e regulada sem ondulações excessivas.',
      });
    }

    // Análise de pressão de combustível
    if (minPressure < 3.0) {
      trends.push({
        parameter: 'Pressão da Linha de Combustível',
        trend: 'QUEDA',
        significance: 'Queda de pressão na linha sob demanda. Recomenda-se checar filtro de combustível.',
      });
    } else {
      trends.push({
        parameter: 'Pressão da Linha de Combustível',
        trend: 'ESTÁVEL',
        significance: 'Pressão de alimentação firme na linha de injeção.',
      });
    }

    const predictedComponent =
      wearRiskLevel === 'ELEVADO' || wearRiskLevel === 'CRÍTICO'
        ? maxTemp > 102
          ? 'Termostato / Eletroventilador'
          : 'Regulador de Tensão do Alternador'
        : 'Desgaste Operacional Natural';

    return {
      summary: `Análise preditiva por série temporal para ${input.vehicle.make} ${input.vehicle.model} baseada em ${count} amostras contínuas de sensores.`,
      wearRiskLevel,
      confidenceScore: 82,
      trends,
      predictedFailure: {
        component: predictedComponent,
        description:
          wearRiskLevel === 'BAIXO'
            ? 'Todos os gradientes operacionais estão saudáveis sem risco iminente de panes mecânicas.'
            : 'Distorções precoces nos parâmetros sugerem necessidade de intervenção preventiva antes do disparo da luz MIL.',
        estimatedTimeToFailure:
          wearRiskLevel === 'BAIXO' ? 'Sem falhas previstas para os próximos 10.000 km' : '600 - 1500 km',
      },
      preventiveRecommendations: [
        'Acompanhar a evolução térmica sob tráfego intenso com o ar condicionado ligado.',
        'Efetuar teste de condutância e estado de saúde (SoH) da bateria.',
        'Inspecionar estanqueidade de mangueiras e nível do fluido de arrefecimento.',
      ],
      analyzedSamplesCount: count,
      analyzedAt: new Date().toISOString(),
      aiSource: 'rule-engine-fallback',
    };
  }
}

export interface TelemetrySample {
  timestamp: number;
  rpm: number;
  coolantTempC: number;
  vehicleSpeedKmh: number;
  batteryVoltage: number;
  fuelPressureBar: number;
  intakeTempC: number;
}

export interface PredictiveInput {
  vehicle: VehicleInfo;
  telemetryHistory: TelemetrySample[];
  symptoms?: string;
}

export interface PredictiveTrend {
  parameter: string;
  trend: 'ESTÁVEL' | 'ELEVAÇÃO' | 'QUEDA' | 'FLUTUAÇÃO_ANORMAL';
  significance: string;
}

export interface PredictiveReport {
  summary: string;
  wearRiskLevel: 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRÍTICO';
  confidenceScore: number;
  trends: PredictiveTrend[];
  predictedFailure: {
    component: string;
    description: string;
    estimatedTimeToFailure: string;
  };
  preventiveRecommendations: string[];
  analyzedSamplesCount: number;
  analyzedAt: string;
  aiSource: 'google-gemini' | 'rule-engine-fallback';
}

export const geminiService = new GeminiService();

