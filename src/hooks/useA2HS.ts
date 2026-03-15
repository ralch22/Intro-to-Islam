"use client";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useA2HS() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showA2HS, setShowA2HS] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    // Track session count
    const sessions = parseInt(localStorage.getItem("iti_session_count") ?? "0") + 1;
    localStorage.setItem("iti_session_count", String(sessions));

    const dismissed = localStorage.getItem("iti_a2hs_dismissed");
    if (dismissed) return;

    // Show on 2nd+ session
    if (sessions >= 2) {
      if (ios) {
        // Check not already installed
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        if (!isStandalone) setShowA2HS(true);
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (sessions >= 2) setShowA2HS(true);
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
