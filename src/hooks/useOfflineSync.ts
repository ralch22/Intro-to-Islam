// Manages offline lesson completion queuing via IndexedDB + Background Sync API.
// Falls back to direct fetch on browsers that don't support Background Sync (Safari, Firefox).

const DB_NAME = 'iti-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-completions';
const SYNC_TAG = 'lesson-completion-sync';

// Opens (or creates) the IndexedDB, matching the schema expected by the service worker.
// The store uses keyPath "id" with autoIncrement so the SW can delete records by id after flushing.
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    req.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

// Writes a pending lesson completion record to IndexedDB so the service worker
// can pick it up and POST it when the network is restored.
async function queueCompletion(lessonId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // Store the lessonId; the autoIncrement "id" key is added automatically
    const req = store.add({ lessonId, queuedAt: new Date().toISOString() });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Hook: returns a function to mark a lesson complete with offline support.
//
// Online path: POST /api/lessons/[id]/complete directly.
// Offline path: write to IndexedDB then register the Background Sync tag so the
//   service worker will replay the request once connectivity is restored.
//   On browsers without Background Sync (Safari, Firefox) the record stays in
//   IndexedDB — the SW will still flush it on next activation.
export function useOfflineSync() {
  const markComplete = async (
    lessonId: string
  ): Promise<{ success: boolean; queued: boolean }> => {
    // 1. Try direct fetch first (online path)
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) return { success: true, queued: false };
    } catch {
      // Network error — fall through to offline queue
    }

    // 2. Offline path: queue in IndexedDB + register Background Sync
    try {
      await queueCompletion(lessonId);

      const registration = await navigator.serviceWorker?.ready;
      // Background Sync API is Chromium-only; cast to access it safely
      if (registration && 'sync' in registration) {
        await (
          registration as ServiceWorkerRegistration & {
            sync: { register(tag: string): Promise<void> };
          }
        ).sync.register(SYNC_TAG);
      }

      return { success: false, queued: true };
    } catch {
      return { success: false, queued: false };
    }
  };

  return { markComplete };
}
