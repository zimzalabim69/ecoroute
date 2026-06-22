"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { SignInButton } from "@/components/sign-in-button";
import { MapPin, Navigation, Leaf, Shield, Calendar, TrendingUp } from "lucide-react";

interface Trip {
  id: string;
  originName: string;
  destinationName: string;
  distanceKm: number;
  carbonSavedKg: number;
  safetyScore: number;
  createdAt: string;
}

// Mock data for demo — replace with real Supabase query later
const mockTrips: Trip[] = [
  {
    id: "1",
    originName: "Downtown Omaha",
    destinationName: "Lincoln, NE",
    distanceKm: 84.2,
    carbonSavedKg: 10.11,
    safetyScore: 87,
    createdAt: "2026-06-20T14:30:00Z",
  },
  {
    id: "2",
    originName: "Home",
    destinationName: "Costco Charger",
    distanceKm: 12.4,
    carbonSavedKg: 1.49,
    safetyScore: 92,
    createdAt: "2026-06-19T09:15:00Z",
  },
  {
    id: "3",
    originName: "Work",
    destinationName: "Whole Foods",
    distanceKm: 6.8,
    carbonSavedKg: 0.82,
    safetyScore: 78,
    createdAt: "2026-06-18T18:45:00Z",
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function HistoryPage() {
  const { user } = useAuth();
  const trips = user ? mockTrips : [];

  const totalDistance = trips.reduce((s, t) => s + t.distanceKm, 0);
  const totalCarbon = trips.reduce((s, t) => s + t.carbonSavedKg, 0);
  const avgSafety = trips.length ? Math.round(trips.reduce((s, t) => s + t.safetyScore, 0) / trips.length) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[#ededed]">Trip History</h1>
        <p className="mt-1 text-[#a0a0a0]">Your past routes and environmental impact.</p>
      </motion.div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 flex flex-col items-center rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-[#4CAF50]/10 p-4 text-[#4CAF50]">
            <Navigation size={32} />
          </div>
          <p className="text-lg text-[#a0a0a0]">Sign in to view your trip history and track your impact.</p>
          <SignInButton className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-8 py-3 text-sm font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.35)]">
            Sign In
          </SignInButton>
        </motion.div>
      )}

      {user && trips.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 flex flex-col items-center rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-[#4CAF50]/10 p-4 text-[#4CAF50]">
            <MapPin size={32} />
          </div>
          <p className="text-lg text-[#a0a0a0]">No trips yet. Plan your first route!</p>
          <Link
            href="/map"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-8 py-3 text-sm font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.35)]"
          >
            <Navigation size={16} />
            Plan a Route
          </Link>
        </motion.div>
      )}

      {user && trips.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total Distance", value: `${totalDistance.toFixed(1)} km`, icon: Navigation, color: "#4CAF50" },
              { label: "CO₂ Saved", value: `${totalCarbon.toFixed(2)} kg`, icon: Leaf, color: "#81C784" },
              { label: "Avg Safety", value: `${avgSafety}/100`, icon: Shield, color: "#A5D6A7" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-5"
              >
                <div className="mb-3 inline-flex rounded-xl p-2" style={{ background: `${s.color}15`, color: s.color }}>
                  <s.icon size={20} />
                </div>
                <p className="text-2xl font-bold text-[#ededed]">{s.value}</p>
                <p className="text-xs text-[#737373]">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Trip cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                custom={i + 3}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-5 transition-colors hover:border-[#4CAF50]/20"
              >
                <div className="flex items-center gap-2 text-sm text-[#ededed]">
                  <MapPin size={14} className="text-[#4CAF50] shrink-0" />
                  <span className="truncate font-medium">{trip.originName}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-[#ededed]">
                  <Navigation size={14} className="text-[#FFD600] shrink-0" />
                  <span className="truncate font-medium">{trip.destinationName}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-[#2a2a2a] bg-[#121212]/60 p-3">
                    <p className="text-xs text-[#737373]">Distance</p>
                    <p className="font-semibold text-[#ededed]">{trip.distanceKm.toFixed(1)} km</p>
                  </div>
                  <div className="rounded-xl border border-[#2a2a2a] bg-[#121212]/60 p-3">
                    <p className="text-xs text-[#737373]">Carbon Saved</p>
                    <p className="font-semibold text-[#4CAF50]">{trip.carbonSavedKg.toFixed(2)} kg</p>
                  </div>
                  <div className="rounded-xl border border-[#2a2a2a] bg-[#121212]/60 p-3">
                    <p className="text-xs text-[#737373]">Safety</p>
                    <p className="font-semibold text-[#ededed]">{Math.round(trip.safetyScore)}/100</p>
                  </div>
                  <div className="rounded-xl border border-[#2a2a2a] bg-[#121212]/60 p-3">
                    <p className="text-xs text-[#737373]">Date</p>
                    <p className="font-semibold text-[#ededed]">{formatDate(trip.createdAt)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
