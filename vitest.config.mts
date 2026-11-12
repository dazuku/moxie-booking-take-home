import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Resolves the "@/..." alias from tsconfig.json (built into Vite 8).
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Unit and component tests live next to the code; e2e/ belongs to Playwright.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
