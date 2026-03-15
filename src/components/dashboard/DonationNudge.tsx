"use client";
import { useState } from "react";

const NUDGE_KEY = "iti_donation_nudge_dismissed";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function DonationNudge() {
  const [visible, setVisible] = useState(() => {
    try {
      const dismissed = localStorage.getItem(NUDGE_KEY);
      return !dismissed || Date.now() - Number(dismissed) > WEEK_MS;
    } catch { return false; }
  });

  function dismiss() {
    try {
      localStorage.setItem(NUDGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-[#1E40AF] to-[#6B21A8] rounded-2xl p-6 text-white relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-white/60 hover:text-white text-lg"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">
          🤲
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Keep Education Free</h3>
          <p className="text-sm text-white/85 mb-4">
            10 donors at $7/month fully sustains this platform for everyone.
          </p>
          <a
            href="https://introtoislam.org/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#1E40AF] font-bold py-2 px-6 rounded-full text-sm hover:bg-gray-50 transition-colors"
          >
            Support the Mission
          </a>
        </div>
      </div>
    </div>
  );
}
