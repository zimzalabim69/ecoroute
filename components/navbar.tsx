"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import { useSignIn } from "@/components/sign-in-context";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Map, LayoutDashboard, History, Zap } from "lucide-react";
import { Logo } from "./logo";

const navItems = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const { openSignIn } = useSignIn();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2a2a]/60 bg-[#121212]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <Logo size={32} />
          <span className="text-lg font-bold tracking-tight text-[#ededed]">
            Eco<span className="text-[#4CAF50]">Route</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "text-[#4CAF50]"
                    : "text-[#a0a0a0] hover:text-[#ededed]"
                }`}
              >
                <Icon size={16} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-[#4CAF50]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[#737373] sm:inline">{user.email?.split("@")[0]}</span>
              <button
                onClick={signOut}
                className="rounded-lg border border-[#2a2a2a] bg-[#1e1e1e]/60 px-3 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={openSignIn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-4 py-2 text-sm font-bold text-[#121212] shadow-[0_0_15px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_25px_rgba(76,175,80,0.35)]"
            >
              <Zap size={14} />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex items-center justify-around border-t border-[#2a2a2a]/40 px-2 py-1 sm:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition ${
                isActive ? "text-[#4CAF50]" : "text-[#737373]"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
