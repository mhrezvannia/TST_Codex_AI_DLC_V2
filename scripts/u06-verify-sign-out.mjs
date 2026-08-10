import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const storageState = valueAfter(process.argv, "--storage-state");
if (!storageState) throw new Error("--storage-state is required");
const baseURL = "http://127.0.0.1:18088";
const executablePath = process.env.U06_BROWSER_EXECUTABLE;
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
let evidence;

try {
  const context = await browser.newContext({ baseURL, storageState: path.resolve(storageState) });
  const page = await context.newPage();
  await page.goto("/booking");
  await page.getByTestId("shell-user-menu").locator("summary").click();
  await Promise.all([
    page.waitForURL(/\/signed-out(?:\?|$)/, { timeout: 30_000 }),
    page.getByTestId("shell-sign-out-button").click()
  ]);
  const cookies = await context.cookies(baseURL);
  const stale = await page.request.post(`${baseURL}/api/booking/bookings`, {
    data: {},
    headers: { "idempotency-key": crypto.randomUUID(), "x-correlation-id": crypto.randomUUID() },
    maxRedirects: 0
  });
  await page.goto("/booking");
  const guardedURL = page.url();
  evidence = {
    schemaVersion: 1,
    observedAt: new Date().toISOString(),
    signedOutURL: guardedURL.includes("/signed-out") ? guardedURL : `${baseURL}/signed-out`,
    cookieCleared: !cookies.some((cookie) => cookie.name === "lc_session"),
    staleCallStatus: stale.status(),
    staleCallFailedClosed: [401, 403].includes(stale.status()),
    guardedURL,
    reauthenticationRequired: guardedURL.includes("/auth/") || new URL(guardedURL).port === "18080"
  };
  evidence.status = evidence.cookieCleared && evidence.staleCallFailedClosed && evidence.reauthenticationRequired ? "PASS" : "FAIL";
  await context.close();
} finally {
  await browser.close();
}

const output = path.resolve("artifacts/u06/observations/sign-out.json");
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
process.exitCode = evidence.status === "PASS" ? 0 : 1;

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}
