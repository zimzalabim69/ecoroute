"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "./star-rating";
import { Logo } from "@/components/logo";
import { CheckCircle, AlertCircle, Camera, MessageSquare, Zap, Loader2 } from "lucide-react";

export type CheckinStatus = "available" | "busy" | "broken";

export interface CheckinFormData {
  status: CheckinStatus;
  rating: number;
  note: string;
  photoUrl: string;
}

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckinFormData) => void;
  stationName?: string;
}

const statusConfig: Record<CheckinStatus, { label: string; color: string; icon: typeof Zap }> = {
  available: { label: "Available", color: "#4CAF50", icon: Zap },
  busy: { label: "Busy", color: "#FFD600", icon: Zap },
  broken: { label: "Broken", color: "#F44336", icon: Zap },
};

export function CheckinModal({
  isOpen,
  onClose,
  onSubmit,
  stationName,
}: CheckinModalProps) {
  const [status, setStatus] = useState<CheckinStatus>("available");
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus("available");
      setRating(0);
      setNote("");
      setPhotoUrl("");
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusables = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(() => {
    if (rating < 1) return;
    onSubmit({ status, rating, note: note.trim(), photoUrl: photoUrl.trim() });
    onClose();
  }, [status, rating, note, photoUrl, onSubmit, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          className="pointer-events-auto fixed inset-0 z-[3000] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Check-in modal"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-[#2a2a2a]/60 bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-6 shadow-2xl backdrop-blur-xl sm:rounded-2xl"
          >
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-[#4CAF50]/10 p-2.5 text-[#4CAF50]">
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#ededed]">Check In</h3>
                {stationName && (
                  <p className="text-xs text-[#737373]">{stationName}</p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {/* Status */}
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-[#a0a0a0]">Station Status</legend>
                <div className="flex gap-2">
                  {(["available", "busy", "broken"] as CheckinStatus[]).map((s) => {
                    const config = statusConfig[s];
                    const isSelected = status === s;
                    return (
                      <label
                        key={s}
                        className={`flex cursor-pointer flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          isSelected
                            ? "border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50] shadow-[0_0_15px_rgba(76,175,80,0.1)]"
                            : "border-[#2a2a2a] bg-[#121212]/60 text-[#ededed] hover:border-[#4CAF50]/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={s}
                          checked={isSelected}
                          onChange={() => setStatus(s)}
                          className="sr-only"
                        />
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: config.color }} />
                        <span className="capitalize">{config.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#a0a0a0]">
                  How was it?
                </label>
                <StarRating value={rating} onChange={setRating} ariaLabel="Station rating" />
                {rating === 0 && (
                  <p className="mt-1.5 text-xs text-[#737373]">Tap a star to rate</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label htmlFor="checkin-note" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[#a0a0a0]">
                  <MessageSquare size={14} />
                  Note
                </label>
                <textarea
                  id="checkin-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any details about this station..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-3 py-2.5 text-sm text-[#ededed] placeholder-[#737373] outline-none transition focus:border-[#4CAF50] focus:shadow-[0_0_15px_rgba(76,175,80,0.1)]"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label htmlFor="checkin-photo" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[#a0a0a0]">
                  <Camera size={14} />
                  Photo URL <span className="text-[#737373]">(optional)</span>
                </label>
                <input
                  id="checkin-photo"
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-3 py-2.5 text-sm text-[#ededed] placeholder-[#737373] outline-none transition focus:border-[#4CAF50] focus:shadow-[0_0_15px_rgba(76,175,80,0.1)]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                ref={firstRef}
                type="button"
                onClick={handleSubmit}
                disabled={rating < 1}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-4 py-2 text-sm font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Submit check-in"
              >
                <CheckCircle size={16} />
                Submit
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-4 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
                aria-label="Cancel check-in"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
