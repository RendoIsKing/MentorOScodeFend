"use client";
import { useTheme } from 'next-themes';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import type { WeightEntry } from '@/lib/types/student';
import React, { useEffect, useMemo, useState } from 'react';
import { logEvent } from '@/lib/analytics';
import { addWeightEntry, updateWeightEntry, deleteWeightEntry } from '@/lib/api/student';
import { useUserOnboardingContext } from '@/context/UserOnboarding';

Chart.register(...registerables);

export default function WeightChart({ entries, period, onEntriesChange }: { entries: WeightEntry[]; period?: '7d'|'30d'|'90d'|'ytd'; onEntriesChange?: (e: WeightEntry[]) => void }) {
  const { resolvedTheme } = useTheme();
  const { user } = useUserOnboardingContext();
  const [kg, setKg] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);
  const [localEntries, setLocalEntries] = useState<WeightEntry[]>(entries || []);

  useEffect(() => {
    setLocalEntries(entries || []);
  }, [entries]);
  const labels = useMemo(() => (localEntries?.map(e => e.date) ?? []), [localEntries]);
  const dataPoints = useMemo(() => (localEntries?.map(e => e.kg) ?? []), [localEntries]);

  const gridColor = resolvedTheme === 'dark' ? '#464e5a' : '#f0f1f4';
  const axisColor = resolvedTheme === 'dark' ? '#cbd5e1' : '#1f2937';

  const data = {
    labels,
    datasets: [
      {
        label: 'Kg',
        data: dataPoints,
        backgroundColor: '#7375FD',
        borderColor: '#7375FD',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      // Best to date guide line (only if data exists)
      ...(dataPoints.length >= 2
        ? [{
            label: 'Best',
            data: dataPoints.map(() => Math.max(...dataPoints)),
            borderColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
          } as any]
        : []),
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: {
          color: axisColor,
          maxRotation: 0,
          callback: (val: any, idx: number) => {
            const raw = labels?.[idx] || '';
            if (!raw) return '';
            // Period-aware formatting
            if (period === '7d') return raw.slice(5); // MM-DD
            if (period === '30d') return raw.slice(5);
            if (period === '90d') return raw.slice(5);
            return raw.slice(0, 7); // YYYY-MM for ytd
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: { color: gridColor },
        ticks: { color: axisColor },
      },
    },
  };

  useEffect(() => {
    logEvent('student_center.weight_graph.viewed', { period });
  }, [period]);

  function isValidDateISO(s: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
  }

  async function onAdd() {
    if (!kg || !date) return;
    if (!isValidDateISO(date)) {
      alert('Dato må være på format YYYY-MM-DD');
      return;
    }
    const todayIso = new Date().toISOString().slice(0,10);
    if (date > todayIso) {
      alert('Dato kan ikke være i fremtiden');
      return;
    }
    const kgNum = Number(kg);
    if (Number.isNaN(kgNum) || kgNum < 30 || kgNum > 400) {
      alert('Ugyldig vekt. Oppgi mellom 30 og 400 kg.');
      return;
    }
    try {
      setSaving(true);
      // If entry for date exists, use update; else add
      const exists = localEntries.some(e => e.date === date);
      if (exists) {
        await updateWeightEntry(user?._id || 'me', { date, kg: kgNum });
      } else {
        await addWeightEntry(user?._id || 'me', { date, kg: kgNum });
      }
      logEvent('student_center.checkin.success', { kg: kgNum });
      // Optimistic update
      setLocalEntries(prev => {
        const next = [...(prev || [])].filter(e => e.date !== date).concat({ date, kg: kgNum });
        const sorted = next.sort((a,b) => a.date.localeCompare(b.date));
        onEntriesChange?.(sorted);
        return sorted;
      });
      setKg('');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(d: string) {
    try {
      setSaving(true);
      await deleteWeightEntry(user?._id || 'me', d);
      setLocalEntries(prev => {
        const next = (prev || []).filter(e => e.date !== d);
        onEntriesChange?.(next);
        return next;
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="h-56 md:h-64">
        <Line data={data} options={options} />
      </div>
      <form className="flex items-center gap-2 mt-3 text-sm" onSubmit={(e)=>{ e.preventDefault(); onAdd(); }}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-2 py-1 border rounded" />
        <input value={kg} onChange={e=>setKg(e.target.value)} placeholder="Kg" className="w-24 px-2 py-1 border rounded" />
        <button type="submit" disabled={saving || !kg} className="px-3 py-1 rounded border hover:bg-muted disabled:opacity-50">Lagre</button>
      </form>
      {localEntries?.length ? (
        <div className="mt-2 text-xs text-muted-foreground">
          Klikk et punkt for å slette siste registrering for en dato.
        </div>
      ) : null}
      <div className="mt-1 flex flex-wrap gap-1">
        {localEntries.slice(-7).map(e => (
          <button key={e.date} onClick={()=>onDelete(e.date)} className="px-2 py-1 text-xs border rounded hover:bg-muted" title={`Slett ${e.date}`}>{e.date}: {e.kg}kg ✕</button>
        ))}
      </div>

      {localEntries?.length ? (
        <div className="mt-3">
          <div className="text-sm font-medium mb-1">Historikk</div>
          <div className="border rounded">
            <div className="grid grid-cols-5 text-xs font-medium px-3 py-2 border-b bg-muted/50">
              <div className="col-span-2">Dato</div>
              <div className="col-span-2">Vekt (kg)</div>
              <div className="text-right">Handling</div>
            </div>
            {([...localEntries].slice().reverse()).slice(0, 10).map(e => (
              <div key={e.date} className="grid grid-cols-5 items-center px-3 py-2 border-b last:border-b-0 text-sm">
                <div className="col-span-2">{e.date}</div>
                <div className="col-span-2">{e.kg.toFixed(1)}</div>
                <div className="text-right space-x-2">
                  <button className="px-2 py-0.5 border rounded hover:bg-muted" onClick={()=>{ setDate(e.date); setKg(String(e.kg)); }}>Rediger</button>
                  <button className="px-2 py-0.5 border rounded hover:bg-muted" onClick={()=>onDelete(e.date)}>Slett</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


