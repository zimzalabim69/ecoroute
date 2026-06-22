"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X } from "lucide-react";

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
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[4000] border-t border-[#2a2a2a]/60 bg-gradient-to-t from-[#181818] to-[#1e1e1e]/95 px-4 py-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex rounded-xl bg-[#4CAF50]/10 p-2 text-[#4CAF50]">
                <Shield size={18} />
              </div>
              <p className="text-sm leading-relaxed text-[#a0a0a0]">
                We use <strong className="text-[#ededed]">localStorage</strong> for essential features — recent searches, visit count, and dismiss states. No tracking cookies. No data leaves your device.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={handleAccept}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-5 py-2 text-xs font-bold text-[#121212] shadow-[0_0_15px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_25px_rgba(76,175,80,0.35)]"
              >
                <Check size={14} />
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-5 py-2 text-xs font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
              >
                <X size={14} />
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
