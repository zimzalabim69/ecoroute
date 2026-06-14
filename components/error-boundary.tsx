"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center bg-[#121212] px-4 text-center">
          <h2 className="text-lg font-semibold text-[#ededed]">
            Something went wrong.
          </h2>
          <p className="mt-2 text-sm text-[#a0a0a0]">
            Refresh to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#4CAF50] px-6 py-3 text-sm font-semibold text-[#121212] transition hover:bg-[#43a047]"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
