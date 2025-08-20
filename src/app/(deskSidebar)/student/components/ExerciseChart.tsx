"use client";
import { useTheme } from 'next-themes';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import React, { useMemo } from 'react';

Chart.register(...registerables);

export default function ExerciseChart({ series, period }: { series: { date: string; value: number }[]; period?: '7d'|'30d'|'90d'|'ytd' }) {
  const { resolvedTheme } = useTheme();
  const labels = useMemo(()=> series?.map(e => e.date) ?? [], [series]);
  const points = useMemo(()=> series?.map(e => e.value) ?? [], [series]);
  const gridColor = resolvedTheme === 'dark' ? '#464e5a' : '#f0f1f4';
  const axisColor = resolvedTheme === 'dark' ? '#cbd5e1' : '#1f2937';

  const data = {
    labels,
    datasets: [
      {
        label: 'Progress',
        data: points,
        backgroundColor: '#E47DE1',
        borderColor: '#E47DE1',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      ...(points.length ? [{
        label: 'PR',
        data: points.map(() => Math.max(...points)),
        borderColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        borderDash: [6,6],
        pointRadius: 0,
        fill: false,
      } as any] : []),
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: axisColor, maxRotation: 0, callback: (val: any, idx: number) => {
        const raw = labels?.[idx] || '';
        if (!raw) return '';
        if (period === '7d') return raw.slice(5);
        if (period === '30d') return raw.slice(5);
        if (period === '90d') return raw.slice(5);
        return raw.slice(0,7);
      } } },
      y: { grid: { color: gridColor }, ticks: { color: axisColor } },
    },
  };

  return (
    <div className="h-56 md:h-64">
      <Line data={data} options={options} />
    </div>
  );
}


