"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CONSENT_KEY = "ecoroute_cookie_consent";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function CookieConsent() {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [visible, setVisible] = useState(false);

  const hasReadRef = useRef(false);
  useEffect(() => {
    if (!hasReadRef.current) {
      hasReadRef.current = true;
      setVisible(!localStorage.getItem(CONSENT_KEY));
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!isClient || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[4000] border-t border-[#2a2a2a] bg-[#1e1e1e] px-4 py-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-[#a0a0a0]">
          We use localStorage for essential app functionality (recent searches, visit count, and dismiss states). No tracking cookies.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleAccept}
            className="inline-flex min-h-[36px] items-center justify-center rounded-lg bg-[#4CAF50] px-4 py-1.5 text-xs font-bold text-[#121212] transition hover:bg-[#43a047]"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#121212] px-4 py-1.5 text-xs font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
