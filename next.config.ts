import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos and the logo carry a `?v=<mtime>` cache-busting query param so
    // replacing a file in place (same filename) shows up immediately instead
    // of serving a stale cached copy. Without this, next/image's default
    // local-pattern check rejects any local image URL that has a query string.
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/logo/**" }],
  },
};

export default nextConfig;
