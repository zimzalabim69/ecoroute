import { computeCrimeRisk, getRiskColor } from "./crime-heuristic";

export async function fetchCrimeScore(
  lat: number,
  lng: number,
  cityCenterLat?: number,
  cityCenterLng?: number
) {
  // computeCrimeRisk is synchronous, but we keep async interface for backward compat
  return Promise.resolve(computeCrimeRisk(lat, lng, cityCenterLat, cityCenterLng));
}

export { getRiskColor };
