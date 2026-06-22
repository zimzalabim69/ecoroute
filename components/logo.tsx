"use client";

export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Earth circle */}
      <circle cx="50" cy="55" r="32" fill="#1a5f5f" />
      {/* Continents */}
      <path
        d="M28 45c4-6 12-8 18-4s10 2 14-2 8-2 12 2"
        stroke="#2a9d8f"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 60c6 4 14 2 20-2s12 0 16 4"
        stroke="#2a9d8f"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Road */}
      <path
        d="M22 75c8-20 20-35 28-40"
        stroke="#4a4a4a"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 75c8-20 20-35 28-40"
        stroke="#666"
        strokeWidth="2"
        strokeDasharray="4 6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Road arrow */}
      <path
        d="M46 37l4-6 4 6"
        stroke="#666"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Leaf */}
      <path
        d="M50 18c-12 0-22 8-26 20 0 0 6-4 12-2s10 6 14 14c4-8 8-12 14-14s12 2 12 2c-4-12-14-20-26-20z"
        fill="url(#leafGradient)"
      />
      <path
        d="M50 22v24"
        stroke="#2e7d32"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="leafGradient" x1="24" y1="18" x2="76" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#66bb6a" />
          <stop offset="1" stopColor="#2e7d32" />
        </linearGradient>
      </defs>
    </svg>
  );
}
