"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "./logo";
import { Mail, Zap, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { signIn, devSignIn } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError(null);
      setSent(false);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          className="pointer-events-auto fixed inset-0 z-[3000] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in modal"
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
            <div className="mb-6 flex flex-col items-center text-center">
              <Logo size={48} />
              <h3 className="mt-3 text-xl font-bold text-[#ededed]">Welcome back</h3>
              <p className="mt-1 text-sm text-[#a0a0a0]">
                Sign in to save favorites, track trips, and unlock Boost.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center rounded-2xl border border-[#4CAF50]/30 bg-[#4CAF50]/10 p-6 text-center"
                >
                  <div className="mb-3 inline-flex rounded-full bg-[#4CAF50]/20 p-3 text-[#4CAF50]">
                    <CheckCircle size={28} />
                  </div>
                  <p className="text-lg font-semibold text-[#4CAF50]">Check your inbox!</p>
                  <p className="mt-2 text-sm text-[#a0a0a0]">
                    We sent a magic link to <span className="text-[#ededed]">{email}</span>. Click it to sign in.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-8 py-2.5 text-sm font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.25)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.4)]"
                  >
                    Got it
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="signin-email"
                      className="mb-1.5 block text-sm font-medium text-[#a0a0a0]"
                    >
                      Email
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-3 py-2.5 transition focus-within:border-[#4CAF50] focus-within:shadow-[0_0_15px_rgba(76,175,80,0.15)]">
                      <Mail size={18} className="text-[#737373]" />
                      <input
                        ref={inputRef}
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="flex-1 bg-transparent text-sm text-[#ededed] placeholder-[#737373] outline-none"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 overflow-hidden rounded-lg bg-[#F44336]/10 px-3 py-2 text-xs text-[#F44336]"
                      >
                        <AlertCircle size={14} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-4 py-2 text-sm font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Zap size={16} />
                      )}
                      {loading ? "Sending..." : "Send Magic Link"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#121212]/60 px-4 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { devSignIn(); onClose(); }}
                      className="text-xs text-[#737373] underline transition hover:text-[#ededed]"
                    >
                      Dev Login (test mode)
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
