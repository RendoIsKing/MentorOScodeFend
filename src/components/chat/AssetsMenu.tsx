"use client";
import React, { useContext, useMemo, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";

type WindowItem = {
  id: string;
  title: string;
  x: number;
  y: number;
  content?: React.ReactNode;
  onExpand?: () => void;
  loader?: () => Promise<React.ReactNode>;
};

type Ctx = {
  dropdownOpen: boolean;
  setDropdownOpen: (b: boolean) => void;
  windows: WindowItem[];
  setWindows: React.Dispatch<React.SetStateAction<WindowItem[]>>;
};

const AssetsCtx = React.createContext<Ctx | null>(null);

export default function Root({ children }: { children: React.ReactNode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const value = useMemo(
    () => ({ dropdownOpen, setDropdownOpen, windows, setWindows }),
    [dropdownOpen, windows]
  );
  return <AssetsCtx.Provider value={value}>{children}</AssetsCtx.Provider>;
}

function useAssets() {
  const ctx = useContext(AssetsCtx);
  if (!ctx) throw new Error("AssetsMenu components must be wrapped in <AssetsMenu.Root>");
  return ctx;
}

export function Trigger() {
  const { dropdownOpen, setDropdownOpen, setWindows } = useAssets();
  const onOpen = async (title: string) => {
    setDropdownOpen(false);
    const apiBase = (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_SERVER) || '/api/backend';
    const loader = async (): Promise<React.ReactNode> => {
      try {
        if (title === 'Training plans' || title === 'Meal plans') {
          let data: any = null;
          try {
            const r = await fetch(`${apiBase}/v1/student/me/snapshot?period=30d`, { credentials:'include' });
            if (r.ok) data = await r.json();
          } catch {}
          if (!data) {
            try {
              const me = await fetch(`${apiBase}/v1/auth/me`, { credentials: 'include' });
              const meData = await me.json();
              const uid = meData?.data?._id || meData?.data?.id;
              if (uid) {
                const r2 = await fetch(`${apiBase}/v1/student/${uid}/snapshot?period=30d`, { credentials: 'include' });
                data = await r2.json();
              }
            } catch {}
          }
          if (title === 'Training plans') {
            const s = data?.currentTrainingPlan?.[0];
            return s ? (
              <ul className="space-y-2 text-sm">
                {(s.sets||[]).map((x:any,i:number)=>(<li key={i}>{x.exercise} — {x.sets}x{x.reps}{x.weight?` @ ${x.weight}kg`:''}</li>))}
              </ul>
            ) : <div className="text-sm text-muted-foreground">Ingen plan ennå</div>;
          } else {
            const t = data?.currentNutritionPlan?.[0]?.dailyTargets;
            return t ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Kcal: {t.kcal}</div>
                <div>Protein: {t.protein} g</div>
                <div>Carbs: {t.carbs} g</div>
                <div>Fat: {t.fat} g</div>
              </div>
            ) : <div className="text-sm text-muted-foreground">Ingen plan ennå</div>;
          }
        } else if (title === 'Goals') {
          const res = await fetch(`${apiBase}/v1/interaction/chat/engh/goals/current`, { credentials: 'include' });
          if (res.status === 404) return <div className="text-sm text-muted-foreground">Ingen mål satt</div>;
          const { data } = await res.json();
          return (
            <div className="text-sm">
              <div>Vektmål: {data?.targetWeightKg ?? '-'} kg</div>
              <div>Styrke: {data?.strengthTargets ?? '-'}</div>
              <div>Horisont: {data?.horizonWeeks ?? '-'} uker</div>
            </div>
          );
        }
      } catch {}
      return <div className="text-sm text-muted-foreground p-2">No data</div>;
    };

    const content = await loader();

    const openFull = () => {
      if (title === 'Training plans') window.location.href = '/plans/training';
      else if (title === 'Meal plans') window.location.href = '/plans/nutrition';
      else if (title === 'Goals') window.location.href = '/plans/goals';
    };

    setWindows((prev) => [
      ...prev,
      {
        id: `${title}-${Date.now()}`,
        title,
        x: typeof window !== 'undefined' ? window.innerWidth - 380 : 100,
        y: 80,
        content,
        onExpand: openFull,
        loader,
      },
    ]);
  };
  return (
    <div className="relative z-[70]">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="cursor-pointer bg-muted-foreground/20 hover:bg-muted-foreground/30 px-3 py-1 rounded"
      >
        Assets
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg z-[80]">
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 hover:bg-muted" aria-label="Training plans" onClick={() => onOpen('Training plans')}>Training plans</button>
            <button className="w-full text-left px-4 py-2 hover:bg-muted" aria-label="Meal plans" onClick={() => onOpen('Meal plans')}>Meal plans</button>
            <button className="w-full text-left px-4 py-2 hover:bg-muted" aria-label="Goals" onClick={() => onOpen('Goals')}>Goals</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DraggableWindow({ item, onClose }: { item: WindowItem; onClose: () => void }) {
  const [pos, setPos] = useState({ x: item.x, y: item.y });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    start.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const onMouseUp = () => {
    dragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className="fixed z-[90] w-96 rounded-md border bg-background shadow-lg"
      style={{ left: pos.x, top: pos.y }}
      role="dialog"
      aria-label={item.title}
    >
      <div className="cursor-move flex justify-between items-center px-3 py-2 border-b bg-muted" onMouseDown={onMouseDown}>
        <span className="font-medium text-sm">{item.title}</span>
        <div className="flex items-center gap-2">
          {item.onExpand && (
            <button
              aria-label="Open full screen"
              onClick={(e)=>{ e.stopPropagation(); item.onExpand && item.onExpand(); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Maximize2 size={16} />
            </button>
          )}
          <button aria-label="Close" onClick={(e)=>{ e.stopPropagation(); onClose(); }} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
      </div>
      <div className="p-3">
        {item.content}
      </div>
    </div>
  );
}

export function Portal() {
  const { windows, setWindows } = useAssets();
  React.useEffect(()=>{
    const onUpdate = async ()=>{
      const updated = await Promise.all(
        windows.map(async (w) => {
          if (w.loader) {
            const fresh = await w.loader();
            return { ...w, content: fresh } as WindowItem;
          }
          return w;
        })
      );
      setWindows(updated);
    };
    window.addEventListener('plansUpdated', onUpdate);
    return ()=> window.removeEventListener('plansUpdated', onUpdate);
  }, [setWindows, windows]);
  return (
    <>
      {windows.map((w) => (
        <DraggableWindow
          key={w.id}
          item={w}
          onClose={() => setWindows((prev) => prev.filter((i) => i.id !== w.id))}
        />)
      )}
    </>
  );
}





