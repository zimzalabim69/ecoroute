export interface CrimeScore {
  score: number; // 0-100
  label: "Safe" | "Caution" | "Avoid";
}

const CACHE = new Map<string, { data: CrimeScore; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function fetchCrimeScore(lat: number, lng: number): Promise<CrimeScore> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const res = await fetch(`/api/crime?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error(`Crime API ${res.status}`);
    const data = (await res.json()) as CrimeScore;
    CACHE.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
    return data;
  } catch {
    return { score: 50, label: "Caution" };
  }
}

export function getRiskColor(label: CrimeScore["label"]) {
  switch (label) {
    case "Safe":
      return "#4CAF50";
    case "Caution":
      return "#FFD600";
    case "Avoid":
      return "#F44336";
  }
}
