"use client";
import { useState } from "react";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    () => typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscribed, setSubscribed] = useState(false);

  async function subscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const reg = await navigator.serviceWorker.ready;
    const res = await fetch("/api/push/subscribe");
    const { publicKey } = await res.json();
    if (!publicKey) return;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub, preferences: { classes: true, content: true, consultations: true } }),
    });
    setPermission("granted");
    setSubscribed(true);
  }

  async function requestAndSubscribe() {
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm === "granted") await subscribe();
  }

  return { permission, subscribed, requestAndSubscribe };
}
