"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#121212]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#4CAF50]">
          EcoRoute
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/map"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#1e1e1e]"
          >
            Map
          </Link>
          {user ? (
            <button
              onClick={signOut}
              className="rounded-lg bg-[#1e1e1e] px-3 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/map"
              className="rounded-lg bg-[#4CAF50] px-3 py-2 text-sm font-medium text-[#121212] transition hover:bg-[#43a047]"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
