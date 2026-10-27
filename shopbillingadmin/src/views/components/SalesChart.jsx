import { useState } from 'react';
import { COLORS } from '../../constants/colors';

export default function SalesChart({ points = [], height = 90 }) {
  const [chartWidth, setChartWidth] = useState(0);

  if (!points.length) {
    return <div style={{ height }} />;
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((value, index) => {
    const x = points.length === 1 ? 50 : (100 / (points.length - 1)) * index;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const pathD = coords
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const peakIndex = points.indexOf(max);
  const peak = coords[peakIndex];

  const tooltipText = `₹${max.toFixed(2)}`;

  return (
    <div
      className="sales-chart-wrap"
      style={{ height }}
      ref={(el) => el && setChartWidth(el.offsetWidth)}
    >
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {points.length === 1 ? (
          <circle cx={peak.x} cy={peak.y} r="1.6" fill={COLORS.chartLine} />
        ) : (
          <>
            <path
              d={pathD}
              fill="none"
              stroke={COLORS.chartLine}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={peak.x} cy={peak.y} r="1.6" fill={COLORS.chartLine} />
            <circle
              cx={peak.x}
              cy={peak.y}
              r="2.8"
              fill="none"
              stroke={COLORS.chartLine}
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
          </>
        )}
      </svg>

      {points.length > 1 && (
        <div
          className="chart-tooltip"
          style={{
            left: `${peak.x}%`,
            top: `${Math.max(peak.y - 26, 0)}px`,
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}