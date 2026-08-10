import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /browser-evidence\.spec\.mjs$/,
  workers: 1,
  timeout: 120_000,
  use: { baseURL: "http://127.0.0.1:18088", trace: "retain-on-failure", screenshot: "only-on-failure", reducedMotion: "reduce" },
  projects: [{ name: "u06-closed-matrix", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 900 }, colorScheme: "light",
    ...(process.env.U06_SIGNED_STORAGE_STATE ? { storageState: process.env.U06_SIGNED_STORAGE_STATE } : {}) } }],
});
