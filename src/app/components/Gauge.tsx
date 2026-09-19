import React from 'react';

interface GaugeProps {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string | number;
  max?: string | number;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  color = '#ef4d23',
  showLabels = false,
  min,
  max,
}) => {
  const totalTicks = 40;
  const activeCount = Math.min(Math.max(Math.round((value / 100) * totalTicks), 0), totalTicks);
  const cx = 100;
  const cy = 100;
  const rOuter = 80;
  const rInner = 70;

  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    // start at angle π (180°), sweep to 2π (360°)
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy + rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy + rOuter * Math.sin(angle);
    const isActive = i < activeCount;

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? color : '#d4d4d8'}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div className="w-full max-w-[260px] mx-auto flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible">
        {ticks}
        <text
          x={100}
          y={105}
          textAnchor="middle"
          style={{ fontSize: 22, fontWeight: 600 }}
          className="fill-neutral-900 font-sans select-none"
        >
          {value}%
        </text>
      </svg>
      {showLabels && (
        <div className="w-full flex justify-between items-center text-[11px] text-neutral-500 font-medium px-4 mt-0.5 select-none">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default Gauge;
