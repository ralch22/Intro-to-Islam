"use client";

import { useA2HS } from "@/hooks/useA2HS";

export default function A2HSBanner() {
  const { showA2HS, isIOS, install, dismiss } = useA2HS();

  if (!showA2HS) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-xl mx-auto relative">
        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-sm font-bold"
          aria-label="Dismiss"
        >
          ×
        </button>

        <div className="flex items-center gap-4 pr-8">
          {/* App icon */}
          <div className="w-14 h-14 bg-[#E81C74] rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
            ITI
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Introduction to Islam</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {isIOS
                ? "Add to your home screen for the best experience"
                : "Install the app for quick access and offline use"}
            </p>
          </div>
        </div>

        {/* Action area */}
        <div className="mt-4">
          {isIOS ? (
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-gray-700 flex items-start gap-2">
              <span className="text-lg leading-none mt-0.5" aria-hidden="true">
                ↑
              </span>
              <p>
                Tap the{" "}
                <strong className="text-[#1E40AF]">Share button (↑)</strong> in Safari,
                then select <strong className="text-[#1E40AF]">&ldquo;Add to Home Screen&rdquo;</strong>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={install}
                className="flex-1 bg-[#E81C74] hover:bg-pink-600 text-white font-semibold py-2.5 px-4 rounded-full transition-colors text-sm shadow-md"
              >
                Install App
              </button>
              <button
                onClick={dismiss}
                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors px-2"
              >
                Not now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
