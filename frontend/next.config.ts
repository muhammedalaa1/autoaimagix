import type { NextConfig } from "next";

// Server-only: where the Express API lives. The browser never talks to it
// directly; it calls /api/* on this origin and Next proxies the request, so
// the auth cookie is first-party and no cross-site CORS/cookie setup is needed.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.weatherapi.com" }],
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
