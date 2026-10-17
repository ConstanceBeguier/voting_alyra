import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // hides the Next.js dev tools badge in the corner
  devIndicators: false,
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
