import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimize barrel file imports for faster dev boot, builds, and cold starts
    // @hugeicons has thousands of re-exports that cause 200-800ms import cost
    // This transforms barrel imports to direct imports at build time
    optimizePackageImports: ["@hugeicons/core-free-icons", "@hugeicons/react"],
    // This app has many small App Router routes; inline prefetches cut request fan-out.
    prefetchInlining: true,
  },
};

export default nextConfig;
