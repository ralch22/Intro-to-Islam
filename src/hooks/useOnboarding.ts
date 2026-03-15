"use client";
import { useState } from "react";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem("iti_onboarding_done"); } catch { return false; }
  });

  const completeOnboarding = () => {
    localStorage.setItem("iti_onboarding_done", "true");
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
