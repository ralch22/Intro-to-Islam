"use client";
import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type Preferences = {
  classes: boolean;
  content: boolean;
  consultations: boolean;
};

const PREF_KEY = "iti_notification_prefs";

const defaultPrefs: Preferences = {
  classes: true,
  content: true,
  consultations: true,
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-[#E81C74]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const { permission, subscribed, requestAndSubscribe } = usePushNotifications();
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored) as Preferences);
      }
    } catch {
      // ignore
    }
  }, []);

  function updatePref(key: keyof Preferences, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // In production: POST to /api/push/subscribe to persist server-side
  }

  const preferenceItems = [
    {
      key: "classes" as const,
      title: "Live Class Reminders",
      description: "Get notified 1 hour before a live session starts.",
    },
    {
      key: "content" as const,
      title: "New Content Alerts",
      description: "Be the first to know when new lessons or courses are added.",
    },
    {
      key: "consultations" as const,
      title: "Consultation Updates",
      description: "Receive confirmations and reminders for your booked sessions.",
    },
  ];

  return (
    <main>
      {/* Header */}
      <header className="gradient-brand text-white py-10 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-3">
            <a href="/profile" className="text-blue-200 hover:text-white text-sm font-medium inline-flex items-center gap-1 transition-colors">
              ← Profile
            </a>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Notification Settings</h1>
          <p className="text-blue-100">Control how and when we notify you.</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Browser permission status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Browser Notifications</h2>

          {permission === "granted" || subscribed ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <span className="text-green-500 text-xl">✓</span>
              <div>
                <p className="font-semibold text-green-800">Notifications enabled</p>
                <p className="text-sm text-green-600">You will receive push notifications in your browser.</p>
              </div>
            </div>
          ) : permission === "denied" ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <span className="text-red-500 text-xl">✕</span>
              <div>
                <p className="font-semibold text-red-800">Notifications blocked</p>
                <p className="text-sm text-red-600">
                  Please allow notifications in your browser settings to receive alerts.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Enable browser notifications to receive reminders about live classes and consultations.
              </p>
              <button
                onClick={requestAndSubscribe}
                className="bg-[#E81C74] hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-md"
              >
                Enable Notifications
              </button>
            </div>
          )}
        </div>

        {/* Preference toggles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Notification Types</h2>
            {saved && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Saved!
              </span>
            )}
          </div>

          <div className="space-y-6">
            {preferenceItems.map(({ key, title, description }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
                <Toggle
                  checked={prefs[key]}
                  onChange={(v) => updatePref(key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <p className="text-xs text-gray-400 text-center">
          Notification preferences are saved locally. We will never send unsolicited messages.
        </p>
      </div>
    </main>
  );
}
