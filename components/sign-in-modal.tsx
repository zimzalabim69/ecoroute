"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { signIn } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setEmail("");
      setError(null);
      setSent(false);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || loading) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await signIn(email.trim());
        if (result.error) {
          setError(result.error);
        } else {
          setSent(true);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    [email, loading, signIn]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="pointer-events-auto fixed inset-0 z-[3000] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in modal"
    >
      <div
        className="absolute inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-[#2a2a2a] bg-[#1E1E1E] p-5 shadow-lg sm:rounded-2xl sm:p-6">
        <h3 className="text-lg font-semibold text-[#ededed]">Sign In</h3>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Enter your email to receive a magic link.
        </p>

        {sent ? (
          <div className="mt-5 rounded-xl border border-[#4CAF50]/30 bg-[#4CAF50]/10 p-4 text-sm text-[#4CAF50]">
            <p className="font-medium">Check your inbox!</p>
            <p className="mt-1 text-[#a0a0a0]">
              We sent a magic link to {email}. Click it to sign in.
            </p>
            <button
              onClick={onClose}
              className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#4CAF50] px-4 py-2 text-sm font-bold text-[#121212] transition hover:bg-[#43a047]"
            >
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="signin-email"
                className="mb-1.5 block text-sm font-medium text-[#a0a0a0]"
              >
                Email
              </label>
              <input
                ref={inputRef}
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[#2a2a2a] bg-[#121212] px-3 py-2.5 text-sm text-[#ededed] placeholder-[#737373] outline-none transition focus:border-[#4CAF50]"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-[#F44336]/10 px-3 py-2 text-xs text-[#F44336]">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-[#4CAF50] px-4 py-2 text-sm font-bold text-[#121212] transition hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#121212] px-4 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
