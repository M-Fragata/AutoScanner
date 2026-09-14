import React, { useState } from 'react';
import type { TelemetryHistoryPoint } from '../../store/useAppStore';
import { Activity, Gauge, Thermometer, BatteryCharging, Fuel, Wind } from 'lucide-react';

interface TelemetryChartProps {
  history: TelemetryHistoryPoint[];
}

type MetricKey = 'rpm' | 'vehicleSpeedKmh' | 'coolantTempC' | 'batteryVoltage' | 'fuelPressureBar' | 'intakeTempC';

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  color: string;
  strokeColor: string;
  fillColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const METRICS: Record<MetricKey, MetricConfig> = {
  rpm: {
    key: 'rpm',
    label: 'Rotação (RPM)',
    unit: 'RPM',
    min: 0,
    max: 7000,
    color: 'text-cyan-400',
    strokeColor: '#22d3ee',
    fillColor: 'rgba(34, 211, 238, 0.15)',
    icon: Gauge,
  },
  vehicleSpeedKmh: {
    key: 'vehicleSpeedKmh',
    label: 'Velocidade',
    unit: 'km/h',
    min: 0,
    max: 220,
    color: 'text-purple-400',
    strokeColor: '#c084fc',
    fillColor: 'rgba(192, 132, 252, 0.15)',
    icon: Activity,
  },
  coolantTempC: {
    key: 'coolantTempC',
    label: 'Temp. Arrefecimento',
    unit: '°C',
    min: 40,
    max: 125,
    color: 'text-emerald-400',
    strokeColor: '#34d399',
    fillColor: 'rgba(52, 211, 153, 0.15)',
    icon: Thermometer,
  },
  batteryVoltage: {
    key: 'batteryVoltage',
    label: 'Tensão da Bateria',
    unit: 'V',
    min: 10,
    max: 16,
    color: 'text-amber-400',
    strokeColor: '#fbbf24',
    fillColor: 'rgba(251, 191, 36, 0.15)',
    icon: BatteryCharging,
  },
  fuelPressureBar: {
    key: 'fuelPressureBar',
    label: 'Pressão de Combustível',
    unit: 'bar',
    min: 0,
    max: 6,
    color: 'text-rose-400',
    strokeColor: '#fb7185',
    fillColor: 'rgba(251, 113, 133, 0.15)',
    icon: Fuel,
  },
  intakeTempC: {
    key: 'intakeTempC',
    label: 'Temp. Admissão IAT',
    unit: '°C',
    min: 10,
    max: 80,
    color: 'text-indigo-400',
    strokeColor: '#818cf8',
    fillColor: 'rgba(129, 140, 248, 0.15)',
    icon: Wind,
  },
};

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ history }) => {
  const [selectedKey, setSelectedKey] = useState<MetricKey>('rpm');
  const metric = METRICS[selectedKey];

  const points = history.length > 0 ? history : [];
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Extrai valores da métrica atual
  const values = points.map((p) => (p[selectedKey] as number) || 0);
  const currentVal = values.length > 0 ? values[values.length - 1] : 0;
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const avgVal = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  // Normalização para o plano cartesiano do SVG
  const getY = (val: number) => {
    const fraction = (val - metric.min) / (metric.max - metric.min || 1);
    const clamped = Math.max(0, Math.min(1, fraction));
    return paddingY + plotHeight - clamped * plotHeight;
  };

  const getX = (idx: number) => {
    if (points.length <= 1) return paddingX + plotWidth / 2;
    return paddingX + (idx / (points.length - 1)) * plotWidth;
  };

  // Monta linha do caminho SVG
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    const coords = points.map((p, idx) => ({
      x: getX(idx),
      y: getY((p[selectedKey] as number) || 0),
    }));

    pathD = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map((c) => `L ${c.x} ${c.y}`).join(' ');
    areaD = `${pathD} L ${coords[coords.length - 1].x} ${paddingY + plotHeight} L ${coords[0].x} ${
      paddingY + plotHeight
    } Z`;
  }

  // Linhas horizontais de grade
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const val = metric.min + frac * (metric.max - metric.min);
    const y = paddingY + plotHeight - frac * plotHeight;
    return { val, y };
  });

  return (
    <div className="space-y-4">
      {/* Seletor de Canais do Osciloscópio / Telemetria */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(METRICS) as MetricKey[]).map((key) => {
          const cfg = METRICS[key];
          const Icon = cfg.icon;
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-slate-800 text-white border-cyan-500 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Painel do Gráfico de Ondas */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl relative overflow-hidden">
        {/* Cabeçalho do Canal Ativo com Métricas Instantâneas */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: metric.strokeColor }} />
            <div>
              <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">{metric.label}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Buffer: {points.length} amostras (últimos ~40s)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Atual</div>
              <div className={`text-xl font-bold font-digital tracking-wider ${metric.color}`}>
                {currentVal} <span className="text-xs font-mono text-slate-400">{metric.unit}</span>
              </div>
            </div>
            <div className="text-right border-l border-slate-800 pl-4">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Mín / Máx</div>
              <div className="text-xs font-mono font-medium text-slate-300">
                {minVal} / {maxVal} {metric.unit}
              </div>
            </div>
            <div className="text-right border-l border-slate-800 pl-4">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Média</div>
              <div className="text-xs font-mono font-medium text-slate-300">
                {avgVal} {metric.unit}
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico SVG Responsivo */}
        <div className="w-full relative overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
            <defs>
              <linearGradient id={`chart-gradient-${selectedKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={metric.strokeColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={metric.strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Linhas de Grade e Rótulos do Eixo Y */}
            {gridLines.map((line, idx) => (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={line.y}
                  x2={width - paddingX}
                  y2={line.y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={line.y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(line.val)}
                </text>
              </g>
            ))}

            {/* Área sombreada sob a curva */}
            {areaD && <path d={areaD} fill={`url(#chart-gradient-${selectedKey})`} />}

            {/* Linha da Onda de Telemetria */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={metric.strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 6px ${metric.strokeColor})` }}
              />
            )}

            {/* Ponto indicador do dado mais recente na ponta da onda */}
            {points.length > 0 && (
              <circle
                cx={getX(points.length - 1)}
                cy={getY(currentVal)}
                r="4.5"
                fill="#0f172a"
                stroke={metric.strokeColor}
                strokeWidth="2.5"
                className="animate-pulse"
              />
            )}
          </svg>
        </div>

        {/* Rodapé do Gráfico com Carimbos de Tempo */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-8">
          <span>{points[0]?.timeLabel || '--:--:--'}</span>
          <span className="text-slate-400 font-semibold">Osciloscópio Digital Automotivo</span>
          <span>{points[points.length - 1]?.timeLabel || '--:--:--'}</span>
        </div>
      </div>
    </div>
  );
};
