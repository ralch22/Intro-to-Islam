// Custom Service Worker additions (loaded alongside next-pwa generated SW)

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "IntroToIslam", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: { url: data.url ?? "/" },
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Background Sync — lesson completion queue
self.addEventListener("sync", (event) => {
  if (event.tag === "lesson-completion-sync") {
    event.waitUntil(flushLessonCompletions());
  }
});

async function flushLessonCompletions() {
  try {
    const db = await openDB();
    const tx = db.transaction("pending-completions", "readwrite");
    const store = tx.objectStore("pending-completions");
    const items = await getAllFromStore(store);
    for (const item of items) {
      try {
        const res = await fetch(`/api/lessons/${item.lessonId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) await deleteFromStore(store, item.id);
      } catch {}
    }
  } catch {}
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("iti-offline", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("pending-completions")) {
        db.createObjectStore("pending-completions", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = reject;
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
}

function deleteFromStore(store, id) {
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = resolve;
    req.onerror = reject;
  });
}
