// worker/index.ts
// Custom Service Worker logic bundled by next-pwa into the generated sw.js.
// This file supersedes public/sw-custom.js (kept for reference only).
//
// next-pwa v5 bundles files from the worker/ directory at project root.
// All handlers here run inside the service worker global scope.

declare const self: ServiceWorkerGlobalScope;

// ---------------------------------------------------------------------------
// Push notification handler
// ---------------------------------------------------------------------------
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;
  try {
    data = event.data.json();
  } catch {
    data = { title: "IntroToIslam", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title as string, {
      body: data.body as string,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      data: { url: (data.url as string) ?? "/" },
    })
  );
});

// ---------------------------------------------------------------------------
// Notification click handler
// ---------------------------------------------------------------------------
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url: string = (event.notification.data as any)?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return (client as WindowClient).focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});

// ---------------------------------------------------------------------------
// Background Sync — lesson completion queue
// ---------------------------------------------------------------------------
self.addEventListener("sync", (event: Event) => {
  // The SyncEvent type is not in the standard lib; cast accordingly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const syncEvent = event as any;
  if (syncEvent.tag === "lesson-completion-sync") {
    syncEvent.waitUntil(flushLessonCompletions());
  }
});

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

interface PendingCompletion {
  id: number;
  lessonId: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("iti-offline", 1);

    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pending-completions")) {
        db.createObjectStore("pending-completions", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    req.onsuccess = (e: Event) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

function readFromStore(store: IDBObjectStore): Promise<PendingCompletion[]> {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as PendingCompletion[]);
    req.onerror = () => reject(req.error);
  });
}

function deleteFromStore(store: IDBObjectStore, id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Flush pending lesson completions to the server
// ---------------------------------------------------------------------------
async function flushLessonCompletions(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("pending-completions", "readwrite");
    const store = tx.objectStore("pending-completions");
    const items = await readFromStore(store);

    for (const item of items) {
      try {
        const res = await fetch(`/api/lessons/${item.lessonId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          await deleteFromStore(store, item.id);
        }
      } catch {
        // Network failure — leave item in queue for next sync attempt.
      }
    }
  } catch {
    // DB open failure — will retry on next sync event.
  }
}
