import React from 'react';

interface CircularGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  dangerThreshold?: number;
  warningThreshold?: number;
  colorScheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  decimals?: number;
  size?: number;
  subtitle?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  min,
  max,
  label,
  unit,
  dangerThreshold,
  warningThreshold,
  colorScheme = 'cyan',
  decimals = 0,
  size = 180,
  subtitle,
}) => {
  // Clamping do valor
  const clampedValue = Math.max(min, Math.min(max, value));
  const fraction = (clampedValue - min) / (max - min || 1);

  // Parâmetros geométricos do arco automotivo (240 graus de varredura)
  const cx = 100;
  const cy = 105;
  const radius = 70;
  const startAngle = 150; // Ângulo inicial (graus)
  const endAngle = 390; // Ângulo final (graus)
  const totalSweep = endAngle - startAngle; // 240 graus

  // Função para converter coordenadas polares em cartesianas
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  // Gerador de caminho SVG para arco circular
  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPt = polarToCartesian(x, y, r, end);
    const endPt = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${endPt.x} ${endPt.y}`;
  };

  // Arco de fundo completo (240 graus)
  const bgPath = describeArc(cx, cy, radius, startAngle, endAngle);

  // Arco dinâmico de valor atual
  const currentAngle = startAngle + fraction * totalSweep;
  const valPath = fraction > 0 ? describeArc(cx, cy, radius, startAngle, Math.max(startAngle + 0.1, currentAngle)) : '';

  // Determina status de severidade / cor ativa
  let isDanger = false;
  let isWarning = false;

  if (dangerThreshold !== undefined) {
    if (dangerThreshold > min) {
      isDanger = value >= dangerThreshold;
    } else {
      isDanger = value <= dangerThreshold;
    }
  }

  if (warningThreshold !== undefined && !isDanger) {
    if (warningThreshold > min) {
      isWarning = value >= warningThreshold;
    } else {
      isWarning = value <= warningThreshold;
    }
  }

  // Paleta de cores contextual
  const colorMap = {
    cyan: {
      stroke: 'stroke-cyan-400',
      glow: 'rgba(6, 182, 212, 0.4)',
      text: 'text-cyan-400',
      needle: '#22d3ee',
    },
    emerald: {
      stroke: 'stroke-emerald-400',
      glow: 'rgba(16, 185, 129, 0.4)',
      text: 'text-emerald-400',
      needle: '#34d399',
    },
    amber: {
      stroke: 'stroke-amber-400',
      glow: 'rgba(245, 158, 11, 0.4)',
      text: 'text-amber-400',
      needle: '#fbbf24',
    },
    rose: {
      stroke: 'stroke-rose-400',
      glow: 'rgba(244, 63, 94, 0.4)',
      text: 'text-rose-400',
      needle: '#fb7185',
    },
    indigo: {
      stroke: 'stroke-indigo-400',
      glow: 'rgba(99, 102, 241, 0.4)',
      text: 'text-indigo-400',
      needle: '#818cf8',
    },
    purple: {
      stroke: 'stroke-purple-400',
      glow: 'rgba(168, 85, 247, 0.4)',
      text: 'text-purple-400',
      needle: '#c084fc',
    },
  };

  const activeColor = isDanger
    ? colorMap.rose
    : isWarning
    ? colorMap.amber
    : colorMap[colorScheme] || colorMap.cyan;

  // Marcas da escala (Ticks)
  const numTicks = 9;
  const ticks = Array.from({ length: numTicks }, (_, i) => {
    const tickFraction = i / (numTicks - 1);
    const tickAngle = startAngle + tickFraction * totalSweep;
    const isMajor = i % 2 === 0;
    const tickVal = Math.round(min + tickFraction * (max - min));
    const p1 = polarToCartesian(cx, cy, radius - (isMajor ? 8 : 4), tickAngle);
    const p2 = polarToCartesian(cx, cy, radius + 2, tickAngle);
    const pText = polarToCartesian(cx, cy, radius - 16, tickAngle);

    return {
      p1,
      p2,
      pText,
      tickVal,
      isMajor,
    };
  });

  // Cálculo da ponta do ponteiro físico
  const needleAngle = currentAngle;
  const needleTip = polarToCartesian(cx, cy, radius - 12, needleAngle);
  const needleBase1 = polarToCartesian(cx, cy, 6, needleAngle + 90);
  const needleBase2 = polarToCartesian(cx, cy, 6, needleAngle - 90);

  return (
    <div
      className={`glass-panel relative rounded-2xl p-4 flex flex-col items-center justify-between border transition-all duration-300 ${
        isDanger
          ? 'border-rose-700/80 bg-rose-950/20 shadow-lg shadow-rose-950/40 animate-pulse'
          : isWarning
          ? 'border-amber-700/60 bg-amber-950/20 shadow-md shadow-amber-950/30'
          : 'border-slate-800/80 bg-slate-900/90 shadow-lg shadow-black/40 hover:border-slate-700'
      }`}
      style={{ width: '100%', maxWidth: `${size + 40}px` }}
    >
      {/* Título do Manômetro */}
      <div className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
        <span className="truncate">{label}</span>
        <span className="text-[10px] text-slate-500 font-mono">{unit}</span>
      </div>

      {/* Mostrador Vetorial SVG */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.9 }}>
        <svg
          viewBox="0 0 200 190"
          className="w-full h-full overflow-visible"
          style={{ filter: `drop-shadow(0 0 10px ${activeColor.glow})` }}
        >
          {/* Gradiente do arco de valor */}
          <defs>
            <linearGradient id={`gauge-grad-${label.replace(/\s+/g, '')}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Arco de fundo (trilha vazia) */}
          <path
            d={bgPath}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Marcas de escala (Ticks) */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={t.p1.x}
                y1={t.p1.y}
                x2={t.p2.x}
                y2={t.p2.y}
                stroke={t.isMajor ? '#64748b' : '#334155'}
                strokeWidth={t.isMajor ? 2 : 1}
              />
              {t.isMajor && (
                <text
                  x={t.pText.x}
                  y={t.pText.y}
                  fill="#64748b"
                  fontSize="8"
                  fontWeight="600"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {t.tickVal}
                </text>
              )}
            </g>
          ))}

          {/* Arco colorido de valor ativo */}
          {fraction > 0 && (
            <path
              d={valPath}
              fill="none"
              stroke={isDanger ? '#f43f5e' : isWarning ? '#f59e0b' : activeColor.needle}
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* Ponteiro físico automotivo */}
          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
            fill={isDanger ? '#f43f5e' : isWarning ? '#f59e0b' : activeColor.needle}
            className="transition-all duration-300 ease-out"
          />

          {/* Centro do mostrador (hub metálico do ponteiro) */}
          <circle cx={cx} cy={cy} r="9" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="4" fill={isDanger ? '#f43f5e' : activeColor.needle} />
        </svg>

        {/* Display Digital Central */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span
            className={`text-2xl font-bold font-digital tracking-wider ${
              isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : activeColor.text
            }`}
          >
            {value.toFixed(decimals)}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            {unit}
          </span>
        </div>
      </div>

      {/* Subtítulo ou status de faixa */}
      {subtitle && (
        <div className="mt-2 text-[10px] text-slate-400 font-medium text-center truncate w-full">
          {subtitle}
        </div>
      )}
    </div>
  );
};
