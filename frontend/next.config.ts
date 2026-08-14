import type { NextConfig } from "next";

// Phase 15 §5 — the production media host is provisioned per-deployment
// (S3, R2, or another S3-compatible provider — MediaStorageOptions on the
// backend is already provider-agnostic, see docs/PRODUCTION_ENV.md), so
// it's read from an env var rather than hardcoded to one vendor. Deliberately
// NOT a wildcard hostname (e.g. "**") — that would let next/image proxy
// and optimize images from *any* remote host, which is both a real SSRF-
// adjacent risk and pointless here since exactly one media host is ever
// legitimate for this app at a time.
const productionMediaPattern = (() => {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: `${url.pathname.replace(/\/$/, "")}/**`,
    };
  } catch {
    // Fails the build loudly elsewhere isn't appropriate here (next.config.ts
    // has no logger/request context) — an invalid URL just means no
    // production pattern gets added, and every image from that host will
    // 400 at request time, which is loud enough to notice and fix.
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Phase 15 §11 — produces a minimal self-contained server bundle
  // (.next/standalone) that frontend/Dockerfile copies into the runtime
  // image, instead of shipping the full node_modules tree in production.
  output: "standalone",
  images: {
    remotePatterns: [
      // MinIO in local Docker dev (infra/docker-compose.yml) — public
      // media bucket, served at localhost:9000 to the browser. Left in
      // place unconditionally so local development keeps working
      // regardless of whether NEXT_PUBLIC_MEDIA_BASE_URL is set.
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/musakuce-media/**",
      },
      ...(productionMediaPattern ? [productionMediaPattern] : []),
    ],
  },
};

export default nextConfig;
