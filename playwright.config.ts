import { defineConfig } from "@playwright/test";
import { validateWaveAEnvironment } from "./scripts/w2-02-acceptance-guard.mjs";
import { existsSync } from "node:fs";
import { join } from "node:path";

const acceptance = validateWaveAEnvironment(process.env);
const runRoot = process.env.W2_02_RUN_ROOT;
if (!runRoot) throw new Error("W2_02_RUN_ROOT is required");
const browserExecutable = process.env.W2_02_BROWSER_EXECUTABLE?.trim();
if (browserExecutable && !existsSync(browserExecutable)) {
  throw new Error(`W2_02_BROWSER_EXECUTABLE does not exist: ${browserExecutable}`);
}

export default defineConfig({
  testDir: "./tests/w2-02",
  globalSetup: "./scripts/w2-02-playwright-global-setup.mjs",
  outputDir: join(".w2-02-traces", "staged", process.env.W2_02_RUN_ID ?? "invalid-run", "playwright"),
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: join(runRoot, "results", "playwright.json") }]],
  use: {
    baseURL: acceptance.baseURL,
    storageState: process.env.W2_02_STORAGE_STATE,
    trace: "off",
    screenshot: "only-on-failure"
  },
  projects: [{
    name: "chromium",
    use: {
      browserName: "chromium",
      launchOptions: browserExecutable ? { executablePath: browserExecutable } : undefined
    }
  }]
});
