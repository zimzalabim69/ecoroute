"use client";

import { useEffect, useState } from "react";

const VISIT_KEY = "ecoroute_visits";
const DISMISS_KEY = "ecoroute_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "true") return;

    const visits = Number(localStorage.getItem(VISIT_KEY) || "0") + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (visits >= 2) {
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[4000] mx-auto max-w-sm rounded-2xl border border-[#2a2a2a] bg-[#1E1E1E] p-4 shadow-xl transition"
      role="banner"
      aria-label="Install app prompt"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#121212]">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth={2}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#ededed]">Install EcoRoute</p>
          <p className="mt-0.5 text-xs text-[#a0a0a0]">
            Add to your home screen for offline maps and faster access.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#4CAF50] px-4 py-1.5 text-xs font-bold text-[#121212] transition hover:bg-[#43a047]"
              aria-label="Install app"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[#2a2a2a] px-4 py-1.5 text-xs font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
              aria-label="Dismiss install prompt"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
