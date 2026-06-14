"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "card" | "text" | "circle";
  lines?: number;
  className?: string;
}

export function Skeleton({ variant = "text", lines = 1, className }: SkeletonProps) {
  const base =
    "relative overflow-hidden rounded-lg bg-[#1E1E1E] skeleton-shimmer";

  if (variant === "circle") {
    return (
      <div
        className={cn(base, "h-12 w-12 rounded-full", className)}
        aria-hidden="true"
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          base,
          "w-full rounded-2xl border border-[#2a2a2a] p-4",
          className
        )}
        aria-hidden="true"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[#2a2a2a]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-[#2a2a2a]" />
            <div className="h-3 w-1/2 rounded bg-[#2a2a2a]" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-[#2a2a2a]" />
          <div className="h-3 w-5/6 rounded bg-[#2a2a2a]" />
        </div>
      </div>
    );
  }

  // text variant
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            base,
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}
