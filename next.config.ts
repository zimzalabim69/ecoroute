import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.openchargemap.io" },
      { protocol: "https", hostname: "photos.openchargemap.io" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "api.openrouteservice.org" },
      { protocol: "https", hostname: "api.weather.gov" },
    ],
  },
  // CORS is intentionally NOT set globally. Same-origin API calls do not require CORS.
  // If a specific API route needs cross-origin access, handle it in that route's handler
  // with an explicit allowlist (e.g., `Access-Control-Allow-Origin: https://your-domain.com`).
  async headers() {
    return [];
  },
};

export default nextConfig;
