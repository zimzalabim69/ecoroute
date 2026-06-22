"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Leaf,
  Zap,
  MapPin,
  Award,
  TrendingUp,
  Flame,
  Trophy,
  Target,
  Star,
  Shield,
  Wind,
  Navigation,
} from "lucide-react";

const carbonData = [
  { month: "Jan", saved: 45 },
  { month: "Feb", saved: 62 },
  { month: "Mar", saved: 58 },
  { month: "Apr", saved: 81 },
  { month: "May", saved: 95 },
  { month: "Jun", saved: 112 },
];

const routeData = [
  { type: "Commute", count: 42 },
  { type: "Road Trip", count: 12 },
  { type: "Errand", count: 28 },
  { type: "Explore", count: 8 },
];

const pieData = [
  { name: "Home Charger", value: 45, color: "#4CAF50" },
  { name: "Public L2", value: 30, color: "#81C784" },
  { name: "DC Fast", value: 20, color: "#A5D6A7" },
  { name: "Other", value: 5, color: "#C8E6C9" },
];

const badges = [
  { name: "First Charge", desc: "Charged your EV for the first time", icon: Zap, unlocked: true, color: "#4CAF50" },
  { name: "Route Master", desc: "Planned 50 routes", icon: Navigation, unlocked: true, color: "#66BB6A" },
  { name: "Carbon Crusher", desc: "Saved 500kg CO₂", icon: Leaf, unlocked: true, color: "#81C784" },
  { name: "Safety Scout", desc: "Used safe-route 20 times", icon: Shield, unlocked: true, color: "#A5D6A7" },
  { name: "Streak Keeper", desc: "30-day EV streak", icon: Flame, unlocked: false, color: "#FFD600" },
  { name: "Road Warrior", desc: "1000 miles driven EV", icon: Trophy, unlocked: false, color: "#FF9800" },
  { name: "Night Owl", desc: "Charged after 10pm 10 times", icon: Star, unlocked: false, color: "#9C27B0" },
  { name: "Weather Watcher", desc: "Checked weather before 20 trips", icon: Wind, unlocked: false, color: "#2196F3" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[#ededed]">Your Dashboard</h1>
        <p className="mt-1 text-[#a0a0a0]">Track your impact, achievements, and driving patterns.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "CO₂ Saved", value: "1,247 kg", change: "+12%", icon: Leaf, color: "#4CAF50" },
          { label: "Routes Planned", value: "89", change: "+5 this week", icon: MapPin, color: "#81C784" },
          { label: "Day Streak", value: "12 days", change: "Best: 24", icon: Flame, color: "#FFD600" },
          { label: "Badges", value: "8 / 16", change: "50% complete", icon: Award, color: "#FF9800" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl p-2" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={20} />
              </div>
              <span className="text-xs font-medium text-[#4CAF50]">{s.change}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#ededed]">{s.value}</p>
            <p className="text-xs text-[#737373]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#4CAF50]" />
            <h3 className="font-semibold text-[#ededed]">Carbon Saved Over Time</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#ededed" }}
                  itemStyle={{ color: "#4CAF50" }}
                />
                <Line type="monotone" dataKey="saved" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4, fill: "#4CAF50" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Zap size={18} className="text-[#81C784]" />
            <h3 className="font-semibold text-[#ededed]">Charger Types</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#ededed" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-[#a0a0a0]">{p.name}</span>
                </div>
                <span className="text-[#ededed]">{p.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Route Types + Goals */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Navigation size={18} className="text-[#A5D6A7]" />
            <h3 className="font-semibold text-[#ededed]">Route Breakdown</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="type" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#ededed" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {routeData.map((_, i) => (
                    <Cell key={i} fill={["#4CAF50", "#81C784", "#A5D6A7", "#C8E6C9"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Target size={18} className="text-[#FFD600]" />
            <h3 className="font-semibold text-[#ededed]">This Month's Goals</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Save 150kg CO₂", current: 112, target: 150, color: "#4CAF50" },
              { label: "Plan 20 routes", current: 14, target: 20, color: "#81C784" },
              { label: "Visit 5 new chargers", current: 3, target: 5, color: "#A5D6A7" },
              { label: "Maintain 14-day streak", current: 12, target: 14, color: "#FFD600" },
            ].map((g) => (
              <div key={g.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[#a0a0a0]">{g.label}</span>
                  <span className="text-[#ededed]">
                    {g.current} / {g.target}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2a2a]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.current / g.target) * 100}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Award size={18} className="text-[#FFD600]" />
          <h3 className="text-xl font-bold text-[#ededed]">Achievements</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.name}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className={`rounded-2xl border p-4 transition ${
                  b.unlocked
                    ? "border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818]"
                    : "border-[#2a2a2a]/50 bg-[#181818]/50 opacity-60"
                }`}
              >
                <div
                  className="mb-3 inline-flex rounded-xl p-2.5"
                  style={{ background: b.unlocked ? `${b.color}15` : "#2a2a2a", color: b.unlocked ? b.color : "#737373" }}
                >
                  <Icon size={22} />
                </div>
                <h4 className="text-sm font-semibold text-[#ededed]">{b.name}</h4>
                <p className="mt-1 text-xs text-[#737373]">{b.desc}</p>
                {b.unlocked && (
                  <span className="mt-2 inline-block rounded-full bg-[#4CAF50]/15 px-2 py-0.5 text-[10px] font-bold text-[#4CAF50]">
                    UNLOCKED
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
