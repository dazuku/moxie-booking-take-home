import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The exercise has a single practice; send the root URL to its booking page.
  // Temporary (307) so a future practice directory can take over "/".
  redirects: async () => [
    { source: "/", destination: "/booking/gold-spa", permanent: false },
  ],
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
