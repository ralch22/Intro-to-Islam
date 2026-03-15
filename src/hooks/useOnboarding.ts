"use client";
import { useState, useEffect } from "react";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("iti_onboarding_done");
    if (!done) setShowOnboarding(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("iti_onboarding_done", "true");
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
