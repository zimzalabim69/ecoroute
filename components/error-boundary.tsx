"use client";

import React, { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState((s) => ({ errorCount: s.errorCount + 1 }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center bg-[#121212] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-sm"
          >
            <div className="mx-auto mb-6 inline-flex rounded-2xl bg-[#F44336]/10 p-5 text-[#F44336]">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[#ededed]">Houston, we have a problem</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#a0a0a0]">
              The map hit a bump in the road. Try reloading, or head back home and plan a different route.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-6 py-3 text-sm font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.35)]"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
              <Link
                href="/"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e]/60 px-6 py-3 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
              >
                <Home size={16} />
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
