"use client";
import { useState } from "react";
import { applyAction } from "@/lib/api/actions";
import { emitSnapshotRefresh } from "@/lib/snapshotBus";
import { toast } from "@/components/ui/use-toast";

export default function WeightInlineLogger({ userId }: { userId: string }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [kg, setKg] = useState<number>(75);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await applyAction({ type: "WEIGHT_LOG", payload: { date, kg }, userId });
      toast({ title: "Lagret", description: `Vekt ${kg} kg (${date})` });
      emitSnapshotRefresh();
    } catch (e: any) {
      toast({ title: "Feil", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2" data-testid="weight-logger">
      <input type="date" className="border rounded px-2 py-1" value={date} onChange={e => setDate(e.target.value)} />
      <input type="number" className="border rounded px-2 py-1 w-24" value={kg} onChange={e => setKg(Number(e.target.value))} />
      <button className="border rounded px-3 py-1" disabled={loading} onClick={save}>Lagre</button>
    </div>
  );
}


