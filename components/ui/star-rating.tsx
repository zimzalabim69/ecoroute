"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  ariaLabel?: string;
}

export function StarRating({
  value,
  onChange,
  size = 24,
  ariaLabel = "Rate this station",
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;

  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className="flex items-center gap-1"
      role={interactive ? "radiogroup" : undefined}
      aria-label={ariaLabel}
    >
      {stars.map((star) => {
        const filled = (hover || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            onFocus={() => interactive && setHover(star)}
            onBlur={() => interactive && setHover(0)}
            className={`shrink-0 transition-transform duration-150 ${
              interactive
                ? "cursor-pointer hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50]"
                : "cursor-default"
            }`}
            style={{ width: size, height: size }}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            aria-checked={value === star}
            role={interactive ? "radio" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill={filled ? "#FFD600" : "none"}
              stroke={filled ? "#FFD600" : "#737373"}
              strokeWidth="1.5"
              width={size}
              height={size}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
