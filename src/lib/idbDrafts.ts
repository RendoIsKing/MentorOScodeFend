// Minimal IndexedDB helper for upload drafts
export type DraftAsset = {
  id: number;
  name: string;
  type: string;
  size: number;
  createdAt: number;
  blob: Blob;
};

const DB_NAME = "mentoros-drafts";
const STORE = "files";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

async function tx(mode: IDBTransactionMode) {
  const db = await openDB();
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function addFiles(files: File[]): Promise<DraftAsset[]> {
  const store = await tx("readwrite");
  const added: DraftAsset[] = [];
  await Promise.all(
    files.map(
      (f) =>
        new Promise<void>((resolve, reject) => {
          const item: Omit<DraftAsset, "id"> = {
            name: f.name,
            type: f.type,
            size: f.size,
            createdAt: Date.now(),
            blob: f,
          };
          const req = (store as any).add(item);
          req.onsuccess = () => {
            added.push({ ...(item as any), id: req.result as number });
            resolve();
          };
          req.onerror = () => reject(req.error);
        })
    )
  );
  return added.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getAllDrafts(): Promise<DraftAsset[]> {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = (store as any).getAll();
    req.onsuccess = () => resolve(req.result as DraftAsset[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getDraft(id: number): Promise<DraftAsset | undefined> {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = (store as any).get(id);
    req.onsuccess = () => resolve(req.result as DraftAsset | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function removeDraft(id: number) {
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const req = (store as any).delete(id);
    req.onsuccess = () => resolve(null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearDrafts() {
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const req = (store as any).clear();
    req.onsuccess = () => resolve(null);
    req.onerror = () => reject(req.error);
  });
}


