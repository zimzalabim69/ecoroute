"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Zap,
  MapPin,
  Leaf,
  Shield,
  Wind,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Animated counter hook
function useCountUp(end: number, duration = 2) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

// Particle canvas background
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }
    let anim = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(76, 175, 80, ${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(76, 175, 80, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      anim = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const chargersCount = useCountUp(12483);
  const co2Saved = useCountUp(847);
  const routesPlanned = useCountUp(5621);

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-24 text-center"
      >
        <ParticleCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-transparent to-[#121212]" style={{ zIndex: 1 }} />
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4CAF50]/30 bg-[#4CAF50]/10 px-4 py-1.5 text-sm font-medium text-[#4CAF50] backdrop-blur-sm"
          >
            <Sparkles size={14} /> Now with AI route optimization & gamification
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl font-extrabold tracking-tight text-[#ededed] sm:text-7xl"
          >
            Charge smarter.
            <br />
            <span className="bg-gradient-to-r from-[#4CAF50] to-[#81C784] bg-clip-text text-transparent">
              Drive cleaner.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#a0a0a0] sm:text-xl"
          >
            EcoRoute finds the best EV chargers near you, plans your route with AI, and tracks every kilogram of CO₂ you save. Join 12,000+ drivers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/map"
              className="group inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-10 py-3.5 text-lg font-bold text-[#121212] shadow-[0_0_40px_rgba(76,175,80,0.3)] transition-all hover:shadow-[0_0_60px_rgba(76,175,80,0.5)] hover:scale-105 active:scale-95"
            >
              Try the Map
              <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-[56px] items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e]/80 px-10 py-3.5 text-lg font-semibold text-[#ededed] backdrop-blur-sm transition hover:border-[#4CAF50]/40 hover:bg-[#1e1e1e]"
            >
              View Dashboard
            </Link>
          </motion.div>

          {/* Live stats ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-14 grid grid-cols-3 gap-4 rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e]/60 p-6 backdrop-blur-md sm:gap-8"
          >
            <div>
              <div className="text-2xl font-bold text-[#4CAF50] sm:text-3xl">{chargersCount.toLocaleString()}</div>
              <div className="mt-1 text-xs text-[#737373] sm:text-sm">Chargers mapped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#81C784] sm:text-3xl">{co2Saved}t</div>
              <div className="mt-1 text-xs text-[#737373] sm:text-sm">CO₂ saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#A5D6A7] sm:text-3xl">{routesPlanned.toLocaleString()}</div>
              <div className="mt-1 text-xs text-[#737373] sm:text-sm">Routes planned</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FEATURES */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: Zap, title: "Find Chargers", desc: "Hyperlocal EV stations with real-time filters for speed, connector, and price.", color: "#4CAF50" },
            { icon: MapPin, title: "Plan Routes", desc: "AI-powered route planner with nearest chargers along the way and carbon estimates.", color: "#81C784" },
            { icon: Leaf, title: "Track Carbon", desc: "See exactly how much CO₂ you save on every trip. Small wins, big planet.", color: "#A5D6A7" },
            { icon: Shield, title: "Safety First", desc: "Crime risk scoring and weather alerts for every route. Drive with confidence.", color: "#66BB6A" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              custom={i}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-6 transition-colors hover:border-[#4CAF50]/30"
            >
              <div className="mb-4 inline-flex rounded-xl bg-[#4CAF50]/10 p-3 text-[#4CAF50]">
                <f.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#ededed]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a0a0a0]">{f.desc}</p>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-0 transition-opacity group-hover:opacity-10" style={{ background: f.color }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* GAMIFICATION TEASER */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-[#2a2a2a] bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] p-8 sm:p-12"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#4CAF50]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FFD600]/10 px-3 py-1 text-xs font-bold text-[#FFD600]">
                <Award size={14} /> NEW
              </div>
              <h2 className="text-3xl font-bold text-[#ededed] sm:text-4xl">Make every drive count</h2>
              <p className="mt-3 text-[#a0a0a0]">
                Earn badges for eco-friendly routes, maintain streaks for daily EV driving, and climb the leaderboard. Gamification that actually helps the planet.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center rounded-2xl border border-[#2a2a2a] bg-[#181818] px-5 py-4">
                <TrendingUp size={28} className="text-[#4CAF50]" />
                <span className="mt-2 text-lg font-bold text-[#ededed]">12</span>
                <span className="text-xs text-[#737373]">Day streak</span>
              </div>
              <div className="flex flex-col items-center rounded-2xl border border-[#2a2a2a] bg-[#181818] px-5 py-4">
                <Award size={28} className="text-[#FFD600]" />
                <span className="mt-2 text-lg font-bold text-[#ededed]">8</span>
                <span className="text-xs text-[#737373]">Badges</span>
              </div>
              <div className="flex flex-col items-center rounded-2xl border border-[#2a2a2a] bg-[#181818] px-5 py-4">
                <Wind size={28} className="text-[#81C784]" />
                <span className="mt-2 text-lg font-bold text-[#ededed]">1.2t</span>
                <span className="text-xs text-[#737373]">CO₂ saved</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-[#ededed]"
        >
          What drivers are saying
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-10 grid gap-6 sm:grid-cols-3"
        >
          {[
            { quote: "Finally an EV app that doesn't feel like a spreadsheet. Beautiful, fast, and the gamification actually motivates me.", author: "Alex M.", role: "Tesla Model 3 Owner" },
            { quote: "The carbon tracker + badges made me switch to EV for 90% of my trips. The streak feature is surprisingly addictive.", author: "Jordan K.", role: "Leaf Driver" },
            { quote: "Found a free charger 2 blocks away I never knew existed. The safety scoring gives my partner peace of mind too.", author: "Sam T.", role: "Bolt EUV Owner" },
          ].map((t, i) => (
            <motion.div
              key={t.author}
              variants={fadeInUp}
              custom={i}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-6"
            >
              <p className="text-sm italic leading-relaxed text-[#d4d4d4]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#388E3C] text-xs font-bold text-[#121212]">
                  {t.author[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#ededed]">{t.author}</p>
                  <p className="text-xs text-[#737373]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PRICING */}
      <section className="mx-auto w-full max-w-4xl px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-[#ededed]"
        >
          Simple pricing
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 grid gap-6 sm:grid-cols-2"
        >
          <motion.div variants={fadeInUp} custom={0} whileHover={{ y: -4 }} className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-8">
            <h3 className="text-xl font-semibold text-[#ededed]">Free</h3>
            <p className="mt-2 text-sm text-[#a0a0a0]">Browse the map, view chargers, and see basic details.</p>
            <ul className="mt-6 space-y-3 text-sm text-[#d4d4d4]">
              {["Map + charger lookup", "Basic filters", "Community check-ins"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF50]/20 text-[#4CAF50]">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/map" className="mt-8 inline-flex w-full min-h-[48px] items-center justify-center rounded-xl border border-[#2a2a2a] px-4 py-2 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]">
              Get Started
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} custom={1} whileHover={{ y: -4 }} className="relative rounded-2xl border border-[#4CAF50]/40 bg-gradient-to-b from-[#1e1e1e] to-[#181818] p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-3 py-1 text-xs font-bold text-[#121212]">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-semibold text-[#ededed]">Boost</h3>
            <p className="mt-2 text-3xl font-bold text-[#4CAF50]">
              $2.99<span className="text-sm font-normal text-[#a0a0a0]"> one-time</span>
            </p>
            <p className="mt-2 text-sm text-[#a0a0a0]">Unlock route planning, carbon reports, saved favorites, and badges.</p>
            <ul className="mt-6 space-y-3 text-sm text-[#d4d4d4]">
              {["Unlimited route planning", "Carbon savings dashboard", "Save favorite stations", "Achievements & badges", "Ad-free experience"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF50]/20 text-[#4CAF50]">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/map?boost=checkout" className="mt-8 inline-flex w-full min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-4 py-2 text-sm font-bold text-[#121212] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.3)]">
              Unlock Boost
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[#2a2a2a] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-[#4CAF50]" />
              <p className="text-sm font-medium text-[#ededed]">EcoRoute</p>
            </div>
            <p className="text-sm text-[#737373]">&copy; {new Date().getFullYear()}</p>
            <div className="flex gap-6 text-sm text-[#737373]">
              <Link href="/privacy" className="transition hover:text-[#ededed]">Privacy</Link>
              <Link href="/terms" className="transition hover:text-[#ededed]">Terms</Link>
              <Link href="/dashboard" className="transition hover:text-[#ededed]">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
