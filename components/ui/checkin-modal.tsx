"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StarRating } from "./star-rating";

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
  const lastRef = useRef<HTMLButtonElement>(null);

  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setStatus("available");
      setRating(0);
      setNote("");
      setPhotoUrl("");
      setTimeout(() => firstRef.current?.focus(), 50);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap
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

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="pointer-events-auto fixed inset-0 z-[3000] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Check-in modal"
    >
      <div
        className="absolute inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-[#2a2a2a] bg-[#1E1E1E] p-5 shadow-lg sm:rounded-2xl sm:p-6">
        <h3 className="text-lg font-semibold text-[#ededed]">
          Check In{stationName ? ` — ${stationName}` : ""}
        </h3>

        <div className="mt-5 space-y-5">
          {/* Status */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[#a0a0a0]">Status</legend>
            <div className="flex gap-3">
              {(["available", "busy", "broken"] as CheckinStatus[]).map((s) => (
                <label
                  key={s}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    status === s
                      ? "border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]"
                      : "border-[#2a2a2a] bg-[#121212] text-[#ededed] hover:border-[#4CAF50]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="sr-only"
                  />
                  <span className="capitalize">{s}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#a0a0a0]">
              Rating
            </label>
            <StarRating value={rating} onChange={setRating} ariaLabel="Station rating" />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="checkin-note" className="mb-2 block text-sm font-medium text-[#a0a0a0]">
              Note
            </label>
            <textarea
              id="checkin-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any details about this station..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-sm text-[#ededed] placeholder-[#737373] outline-none transition focus:border-[#4CAF50]"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label htmlFor="checkin-photo" className="mb-2 block text-sm font-medium text-[#a0a0a0]">
              Photo URL <span className="text-[#737373]">(optional)</span>
            </label>
            <input
              id="checkin-photo"
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-sm text-[#ededed] placeholder-[#737373] outline-none transition focus:border-[#4CAF50]"
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
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-[#121212] transition hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Submit check-in"
          >
            Submit
          </button>
          <button
            ref={lastRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#121212] px-4 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
            aria-label="Cancel check-in"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
