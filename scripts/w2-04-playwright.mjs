import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const bookingId = value("--booking-id") ?? process.env.W2_04_BOOKING_ID;
if (!bookingId) throw new Error("--booking-id or W2_04_BOOKING_ID is required");
const shellUrl = clean(value("--shell-url") ?? process.env.W2_04_SHELL_URL ?? "http://127.0.0.1:18088");
const bookingUiUrl = clean(value("--booking-ui-url") ?? process.env.W2_04_BOOKING_UI_URL ?? "http://127.0.0.1:24001");
const outputRoot = resolve(value("--output-root") ?? "artifacts/w2-04-live/playwright");
const executablePath = process.env.PLAYWRIGHT_CHROME_PATH;
mkdirSync(outputRoot, { recursive: true });

const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const evidence = { generatedAt: new Date().toISOString(), bookingId, viewports: [], decision: "PASS" };
try {
  await page.goto(shellUrl, { waitUntil: "domcontentloaded" });
  if (page.url().includes("/protocol/openid-connect/auth")) {
    await page.locator('input[name="username"]').fill(process.env.W2_04_UI_USERNAME ?? "booking.user");
    await page.locator('input[name="password"]').fill(process.env.W2_04_UI_PASSWORD ?? "booking");
    await Promise.all([
      page.waitForLoadState("domcontentloaded"),
      page.locator('button[type="submit"], input[type="submit"]').click()
    ]);
  }
  if (!page.url().startsWith(shellUrl)) throw new Error(`Authentication did not return to ${shellUrl}; current=${page.url()}`);

  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await page.goto(`${bookingUiUrl}/bookings/${encodeURIComponent(bookingId)}`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Journey", exact: true }).click();
    await page.waitForLoadState("networkidle");
    await page.getByRole("heading", { name: "Journey status" }).waitFor();
    await page.getByText("RETURNED_EMPTY", { exact: false }).waitFor();
    await page.getByText("GTIN", { exact: false }).waitFor();
    await page.keyboard.press("Tab");
    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      focusedTag: document.activeElement?.tagName ?? null
    }));
    if (metrics.scrollWidth > metrics.innerWidth) throw new Error(`Horizontal overflow at ${width}px`);
    const screenshot = resolve(outputRoot, `booking-returned-empty-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    evidence.viewports.push({ width, screenshot, ...metrics });
  }

  await page.goto(`${bookingUiUrl}/bookings/00000000-0000-0000-0000-000000000000`, { waitUntil: "domcontentloaded" });
  await page.getByText("This booking link is not valid", { exact: false }).waitFor();
} catch (error) {
  evidence.decision = "FAIL";
  evidence.failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  evidence.completedAt = new Date().toISOString();
  writeFileSync(resolve(outputRoot, "playwright-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
  await context.close();
  await browser.close();
}

function value(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function clean(url) {
  return url.replace(/\/+$/, "");
}
