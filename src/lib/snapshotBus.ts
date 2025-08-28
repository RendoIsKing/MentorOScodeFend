export const SNAPSHOT_REFRESH_EVENT = "student-snapshot-refresh";

export function emitSnapshotRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SNAPSHOT_REFRESH_EVENT));
  }
}

export function onSnapshotRefresh(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener(SNAPSHOT_REFRESH_EVENT, h);
  return () => window.removeEventListener(SNAPSHOT_REFRESH_EVENT, h);
}


