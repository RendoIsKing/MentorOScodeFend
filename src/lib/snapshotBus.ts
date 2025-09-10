export const SNAPSHOT_REFRESH_EVENT = "student-snapshot-refresh";

// Emit a single custom event that consumers can subscribe to
export function emitSnapshotRefresh(): void {
  if (typeof window !== 'undefined') {
    try { window.dispatchEvent(new CustomEvent(SNAPSHOT_REFRESH_EVENT)); } catch {}
  }
}

// Subscribe to snapshot refresh events; returns an unsubscribe function
export function onSnapshotRefresh(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const wrapped = () => { try { handler(); } catch {} };
  try { window.addEventListener(SNAPSHOT_REFRESH_EVENT, wrapped); } catch {}
  return () => { try { window.removeEventListener(SNAPSHOT_REFRESH_EVENT, wrapped); } catch {} };
}

// Bridge legacy events to the unified event
if (typeof window !== 'undefined') {
  const bridge = () => emitSnapshotRefresh();
  try { window.addEventListener('plansUpdated', bridge); } catch {}
}



