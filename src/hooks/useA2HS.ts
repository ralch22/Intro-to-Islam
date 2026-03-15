"use client";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useA2HS() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [isIOS] = useState(() =>
    typeof navigator !== "undefined"
      ? /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
      : false
  );

  const [showA2HS, setShowA2HS] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      if (localStorage.getItem("iti_a2hs_dismissed")) return false;
      const sessions = parseInt(localStorage.getItem("iti_session_count") ?? "0");
      if (sessions < 2) return false;
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
      return ios && !window.matchMedia("(display-mode: standalone)").matches;
    } catch { return false; }
  });

  useEffect(() => {
    // Increment session count on mount
    try {
      const sessions = parseInt(localStorage.getItem("iti_session_count") ?? "0") + 1;
      localStorage.setItem("iti_session_count", String(sessions));
    } catch { /* ignore */ }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      try {
        const sessions = parseInt(localStorage.getItem("iti_session_count") ?? "0");
        const dismissed = localStorage.getItem("iti_a2hs_dismissed");
        if (!dismissed && sessions >= 2) setShowA2HS(true);
      } catch { /* ignore */ }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
    }
  };

  const dismiss = () => {
    localStorage.setItem("iti_a2hs_dismissed", "true");
    setShowA2HS(false);
  };

  return { showA2HS, isIOS, install, dismiss };
}
