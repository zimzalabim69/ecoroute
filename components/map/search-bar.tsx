"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface SearchBarProps {
  onSelect: (lat: number, lng: number, name: string) => void;
  className?: string;
}

const RECENT_KEY = "ecoroute_recent_searches";

function getRecent(): { name: string; lat: number; lng: number }[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecent(name: string, lat: number, lng: number) {
  try {
    const recent = getRecent().filter((r) => r.name !== name);
    recent.unshift({ name, lat, lng });
    if (recent.length > 5) recent.pop();
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // ignore storage errors
  }
}

export function SearchBar({ onSelect, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [recent, setRecent] = useState<{ name: string; lat: number; lng: number }[]>(() => getRecent());
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
      );
      const data: NominatimResult[] = await res.json();
      setResults(data.slice(0, 5));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(val), 300);
  };

  const handleSelect = (name: string, lat: number, lng: number) => {
    setQuery(name);
    setShowDropdown(false);
    addRecent(name, lat, lng);
    setRecent(getRecent());
    onSelect(lat, lng, name);
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#1E1E1E] px-3 py-2 shadow-lg transition focus-within:border-[#4CAF50] focus-within:shadow-[0_0_20px_rgba(76,175,80,0.15)]">
        <svg
          className="shrink-0 text-[#737373]"
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx={11} cy={11} r={8} />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search location..."
          className="flex-1 bg-transparent text-sm text-[#ededed] placeholder-[#737373] outline-none"
          aria-label="Search location"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="shrink-0 rounded-full p-1 text-[#737373] transition hover:bg-[#2a2a2a] hover:text-[#ededed]"
            aria-label="Clear search"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (results.length > 0 || (!query && recent.length > 0)) && (
        <div className="absolute left-0 right-0 top-full z-[1500] mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#2a2a2a] bg-[#1E1E1E] shadow-xl">
          {!query && recent.length > 0 && (
            <div className="px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-[#737373]">Recent</p>
              <ul className="mt-1">
                {recent.map((r) => (
                  <li key={r.name}>
                    <button
                      type="button"
                      onClick={() => handleSelect(r.name, r.lat, r.lng)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#ededed] transition hover:bg-[#2a2a2a]"
                    >
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-[#737373]">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      <span className="truncate">{r.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.length > 0 && (
            <ul className="py-1">
              {results.map((r) => (
                <li key={r.display_name}>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelect(r.display_name, Number(r.lat), Number(r.lon))
                    }
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-[#ededed] transition hover:bg-[#2a2a2a]"
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 shrink-0 text-[#4CAF50]">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="line-clamp-2">{r.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {loading && (
            <div className="px-3 py-3 text-xs text-[#737373]">Searching...</div>
          )}
        </div>
      )}
    </div>
  );
}
