import Link from "next/link";
import { Logo } from "@/components/logo";
import { MapPin, ArrowLeft, Compass } from "lucide-react";

export const metadata = {
  title: "Page Not Found — EcoRoute",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-[#121212] px-4 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 inline-flex rounded-2xl bg-[#4CAF50]/10 p-5 text-[#4CAF50]">
          <Compass size={48} />
        </div>

        <h1 className="text-5xl font-extrabold text-[#ededed]">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-[#ededed]">Lost on the road?</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#a0a0a0]">
          This route doesn&apos;t exist. No charging stations here. Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#388E3C] px-6 py-3 text-sm font-bold text-[#121212] shadow-[0_0_20px_rgba(76,175,80,0.2)] transition hover:shadow-[0_0_30px_rgba(76,175,80,0.35)]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link
            href="/map"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e]/60 px-6 py-3 text-sm font-medium text-[#ededed] transition hover:bg-[#2a2a2a]"
          >
            <MapPin size={16} />
            Open Map
          </Link>
        </div>

        {/* Decorative road lines */}
        <div className="mt-12 flex items-center justify-center gap-1 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-0.5 w-4 rounded-full"
              style={{ background: i % 2 === 0 ? "#4CAF50" : "#2a2a2a" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
