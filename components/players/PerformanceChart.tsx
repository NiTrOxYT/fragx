import React from "react";

interface PerformancePoint {
  matchIndex: number;
  kills: number;
  placement: number;
  date: string;
}

interface PerformanceChartProps {
  data: PerformancePoint[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 w-full flex items-center justify-center text-on-surface-variant font-label-caps text-label-caps">
        NO PERFORMANCE DATA YET
      </div>
    );
  }

  // Calculate SVG path from kills data
  const width = 100;
  const height = 40;
  const maxKills = Math.max(...data.map((d) => d.kills), 10);
  const minKills = 0;

  const points = data.map((d, index) => {
    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * width;
    // Invert Y axis for SVG (0 is top)
    const y = height - ((d.kills - minKills) / (maxKills - minKills)) * (height - 10) - 5;
    return { x, y, kills: d.kills };
  });

  // Build SVG path string
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x},${points[i].y}`;
  }

  const lastPoint = points[points.length - 1];

  return (
    <div className="h-32 w-full relative">
      <svg className="w-full h-full preserve-aspect-ratio-none" viewBox="0 0 100 40">
        {/* Grid lines */}
        <line x1="0" y1="30" x2="100" y2="30" stroke="#262626" strokeWidth="0.5" />
        <line x1="0" y1="15" x2="100" y2="15" stroke="#262626" strokeWidth="0.5" />

        {/* Dynamic Sparkline Path */}
        <path
          d={pathD}
          fill="none"
          stroke="#FFB59E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Peak / Highlight Point */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2"
          fill="#FFB59E"
          className="glow-effect"
        />
      </svg>
    </div>
  );
}
