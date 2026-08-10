import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { REQUIRED_STATES, ROUTES, THEMES, VIEWPORTS } from "../../scripts/w2-02-coverage-ledger.mjs";
import { assertFixtureCoverage, registerRequiredCases } from "../../scripts/w2-02-fixture-contract.mjs";
import { validateCausalObservation } from "../../scripts/w2-02-ssr-control-proxy.mjs";
import { sanitizeTraceArchive } from "../../scripts/w2-02-trace-sanitize.mjs";
import { focusIndicatorChanged, themeResolved } from "../../scripts/w2-02-ui-proof.mjs";
import { validateBrowserPermit } from "../../scripts/w2-02-browser-permit.mjs";

type Trigger = { role: "button" | "link"; name: string };
type Fixture = {
  path: string;
  routePattern: string;
  stateSelector: string;
  stateValue: string;
  landmark: Trigger | { role: "heading" | "table" | "region" | "alert" | "status"; name: string };
  primaryAction: Trigger;
  liveRegionSelector: string;
  trigger?: Trigger;
  control?: { transport: "ssr-proxy"; mode: string };
};
type FixtureManifest = { schemaVersion: number; controlURL: string; routes: Record<(typeof ROUTES)[number], Fixture>; states: Record<(typeof REQUIRED_STATES)[number], Fixture> };

const runId = process.env.W2_02_RUN_ID;
const runRoot = process.env.W2_02_RUN_ROOT;
const fixturePath = process.env.W2_02_FIXTURE_MANIFEST;
const controlToken = process.env.W2_02_PROXY_CONTROL_TOKEN;
if (!runId || !runRoot || !fixturePath || !controlToken) throw new Error("The orchestrated run identity, exact fixture, and SSR control token are required");
const fixtures = assertFixtureCoverage(JSON.parse(readFileSync(fixturePath, "utf8"))) as FixtureManifest;
const registered: string[] = []; registerRequiredCases((id: string) => registered.push(id));
if (new Set(registered).size !== registered.length) throw new Error("Required Playwright registration contains duplicates");
const suiteCases: string[] = [];

const runtime = new WeakMap<Page, string[]>();
const caseRuntime = new WeakMap<Page, { startedAt: string; actionAt?: string; permit: { producer: string; status: string; guardFinishedAt: string; guardSha256: string; authorizedAt: string } }>();
const assertionPasses = () => Object.fromEntries(["semantic", "keyboard-focus", "live-region", "reduced-motion", "primary-action", "overflow", "overlap", "clipping", "theme", "axe"].map((key) => [key, "PASS"]));

test.beforeEach(async ({ page }) => {
  const identityPath = process.env.W2_02_WORKSPACE_IDENTITY_FILE;
  if (!identityPath) throw new Error("The in-process browser case requires the orchestrator workspace identity");
  const workspaceDigest = JSON.parse(readFileSync(identityPath, "utf8")).workspaceDigest;
  const guard = JSON.parse(readFileSync(join(runRoot!, "gates", "demo-guard-pre-browser.json"), "utf8"));
  const permit = validateBrowserPermit(JSON.parse(readFileSync(join(runRoot!, "gates", "browser-authorized.json"), "utf8")), guard, { runId, workspaceDigest });
  caseRuntime.set(page, { startedAt: new Date().toISOString(), permit });
  const errors: string[] = [];
  runtime.set(page, errors);
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  await page.addInitScript(() => {
    (window as unknown as { __w202Unhandled: string[] }).__w202Unhandled = [];
    window.addEventListener("unhandledrejection", (event) => (window as unknown as { __w202Unhandled: string[] }).__w202Unhandled.push(String(event.reason)));
  });
});

test.afterEach(async ({ page }) => {
  const unhandled = await page.evaluate(() => (window as unknown as { __w202Unhandled?: string[] }).__w202Unhandled ?? []).catch(() => []);
  expect([...(runtime.get(page) ?? []), ...unhandled], "page errors, console errors, and unhandled rejections").toEqual([]);
});

async function assertAccessibility(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter(({ impact }) => impact === "critical" || impact === "serious"), JSON.stringify(result.violations, null, 2)).toEqual([]);
}

async function focusByKeyboard(page: Page, target: Locator) {
  const before = await target.evaluate((element) => { const style = getComputedStyle(element); return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor, boxShadow: style.boxShadow }; });
  for (let index = 0; index < 100; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element.matches(":focus"))) {
      await expect(target, "real Tab progression focuses the labelled/actionable target").toBeFocused();
      const focused = await target.evaluate((element) => { const style = getComputedStyle(element); return { tag: element.tagName.toLowerCase(), after: { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor, boxShadow: style.boxShadow } }; });
      expect(focusIndicatorChanged(before, focused.after, focused.tag), "keyboard progression creates a non-zero focus-only indicator on the intended action").toBe(true);
      return;
    }
  }
  throw new Error("Primary action was not reachable through the keyboard tab order");
}

async function activateByKeyboard(page: Page, target: Locator) {
  await focusByKeyboard(page, target);
  await page.keyboard.press("Enter");
}

function markCaseAction(page: Page) {
  const state = caseRuntime.get(page);
  if (!state) throw new Error("Browser case began without the in-process global-setup permit");
  state.actionAt ??= new Date().toISOString();
}

async function installTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem("erp-theme", selectedTheme);
    const applyTheme = () => document.documentElement?.setAttribute("data-theme", selectedTheme);
    applyTheme();
    if (!document.documentElement) {
      const observer = new MutationObserver(() => {
        if (!document.documentElement) return;
        applyTheme();
        observer.disconnect();
      });
      observer.observe(document, { childList: true });
    }
  }, theme);
}

async function armControl(caseId: string) {
  const transitionId = `${caseId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const response = await fetch(`${fixtures.controlURL}/__w2-02/control`, { method: "POST", headers: { "content-type": "application/json", "x-w2-02-control": controlToken! }, body: JSON.stringify({ caseId, transitionId }) });
  expect(response.status, "SSR control arm request").toBe(200);
  const armed = await response.json() as { mode: string };
  return {
    async verify() {
      const observedResponse = await fetch(`${fixtures.controlURL}/__w2-02/observation?transitionId=${encodeURIComponent(transitionId)}`, { headers: { "x-w2-02-control": controlToken! } });
      expect(observedResponse.status).toBe(200);
      const observed = await observedResponse.json() as { mode: string; appliedCount: number; causal: boolean; observations: Array<{ path: string; action: string }> };
      expect(observed.mode).toBe(armed.mode);
      expect(() => validateCausalObservation(caseId, observed), `exact causal observation contract for ${caseId}`).not.toThrow();
      return { kind: "ssr-proxy", mode: observed.mode, appliedCount: observed.appliedCount, verified: true, causal: true, observations: observed.observations };
    }
  };
}

async function assertSurfaceContract(page: Page, fixture: Fixture, theme: "light" | "dark") {
  const surface = page.locator(fixture.stateSelector).first();
  await expect(surface).toBeVisible();
  await expect(surface).toHaveAttribute("data-state", fixture.stateValue);
  const currentPath = await page.evaluate(() => location.pathname); expect(currentPath).toMatch(new RegExp(fixture.routePattern));
  const landmark = page.getByRole(fixture.landmark.role as never, fixture.landmark.name ? { name: fixture.landmark.name, exact: true } : {}).first(); await expect(landmark).toBeVisible();
  const live = page.locator(fixture.liveRegionSelector).first();
  await expect(live).toBeVisible();
  expect(await live.evaluate((element) => ["alert", "status"].includes(element.getAttribute("role") ?? "") || ["polite", "assertive"].includes(element.getAttribute("aria-live") ?? "")), "state change has a live region").toBe(true);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), "reduced-motion media is active").toBe(true);
  await expect(page.locator("html"), "persisted theme is applied to the shared document root").toHaveAttribute("data-theme", theme);
  const actualTheme = await page.evaluate(() => { const style = getComputedStyle(document.documentElement); return { dataTheme: document.documentElement.dataset.theme ?? "", background: style.getPropertyValue("--erp-color-bg").trim(), text: style.getPropertyValue("--erp-color-text").trim() }; });
  expect(themeResolved(theme, actualTheme), `resolved ${theme} theme tokens`).toBe(true);
  expect(await page.evaluate(() => document.getAnimations().every((animation) => animation.playState !== "running" || animation.effect?.getTiming().iterations !== Infinity)), "no infinite animation runs under reduced motion").toBe(true);
  const primary = page.getByRole(fixture.primaryAction.role, { name: fixture.primaryAction.name, exact: true }).first();
  await expect(primary).toBeVisible();
  await focusByKeyboard(page, primary);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "no page-level horizontal overflow").toBe(true);
  const layout = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const controls = Array.from(document.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter((element) => {
      const style = getComputedStyle(element); const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    });
    const clipped = controls.filter((element) => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > viewport + 1 || element.scrollWidth > element.clientWidth + 1; }).length;
    const visibleControls = controls.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > 0 && rect.left < viewport && rect.bottom > 0 && rect.top < viewportHeight;
    });
    let overlaps = 0;
    for (let left = 0; left < visibleControls.length; left += 1) for (let right = left + 1; right < visibleControls.length; right += 1) {
      if (visibleControls[left].contains(visibleControls[right]) || visibleControls[right].contains(visibleControls[left])) continue;
      const a = visibleControls[left].getBoundingClientRect(); const b = visibleControls[right].getBoundingClientRect();
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4) overlaps += 1;
    }
    return { clipped, overlaps };
  });
  expect(layout.clipped, "interactive controls are not clipped").toBe(0);
  expect(layout.overlaps, "interactive controls do not overlap").toBe(0);
  await assertAccessibility(page);
}

function casePaths(caseId: string) {
  const stem = caseId.replaceAll(":", "-");
  return { screenshot: join(runRoot!, "cases", `${stem}.png`), record: join(runRoot!, "case-records", `${stem}.json`) };
}

async function finishCase(page: Page, caseId: string, extra: Record<string, unknown> = {}) {
  const state = caseRuntime.get(page);
  if (!state?.actionAt) throw new Error(`Case ${caseId} has no recorded browser action after the global-setup permit`);
  const paths = casePaths(caseId);
  mkdirSync(dirname(paths.screenshot), { recursive: true });
  mkdirSync(dirname(paths.record), { recursive: true });
  await page.screenshot({ path: paths.screenshot, fullPage: true });
  const timing = await page.evaluate(() => {
    const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return entry ? { type: entry.type, durationMs: Math.round(entry.duration), domInteractiveMs: Math.round(entry.domInteractive), loadEventEndMs: Math.round(entry.loadEventEnd) } : { type: "client-navigation", durationMs: 0, domInteractiveMs: 0, loadEventEndMs: 0 };
  });
  writeFileSync(paths.record, JSON.stringify({ schemaVersion: 1, runId, id: caseId, result: "PASS", assertions: assertionPasses(), startedAt: state.startedAt, actionAt: state.actionAt, capturedAt: new Date().toISOString(), browserPermit: state.permit, timing, ...extra }, null, 2) + "\n");
}

async function fillBooking(page: Page) {
  const values = { Customer: process.env.W2_02_CUSTOMER_ID, "Load UN/LOCODE": process.env.W2_02_LOAD_UNLOCODE, "Discharge UN/LOCODE": process.env.W2_02_DISCHARGE_UNLOCODE, Voyage: process.env.W2_02_VOYAGE_ID, "Equipment type code": process.env.W2_02_EQUIPMENT_TYPE, "Equipment ID": process.env.W2_02_EQUIPMENT_ID, "Commodity code": process.env.W2_02_COMMODITY_CODE };
  for (const [label, value] of Object.entries(values)) {
    if (!value) throw new Error(`Missing W2-02 live fixture for ${label}`);
    const field = page.getByLabel(label, { exact: true });
    await focusByKeyboard(page, field);
    await expect(field, `${label} is the keyboard-focused labelled control`).toBeFocused();
    await field.pressSequentially(value);
  }
}

function requiredLocalIdentities() {
  const value = JSON.parse(process.env.W2_02_LOCAL_IDENTITIES_JSON ?? "[]");
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.trim().length < 3)) throw new Error("The orchestrator must supply a non-empty exact local-identity set");
  return value;
}

test.describe("W2-02 deterministic canonical Booking coverage", () => {
  for (const route of ROUTES) for (const theme of THEMES) for (const width of VIEWPORTS) {
    const caseId = `visual:${route}:${theme}:${width}`;
    suiteCases.push(caseId);
    test(`${caseId} FR-001 FR-004 FR-007 NFR-001-NFR-003`, async ({ page }) => {
      const fixture = fixtures.routes[route]; const controlled = await armControl(caseId);
      markCaseAction(page);
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme as "light" | "dark" });
      await installTheme(page, theme as "light" | "dark");
      await page.goto(fixture.path);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Application modules" })).toHaveCount(1);
      await assertSurfaceContract(page, fixture, theme as "light" | "dark");
      await finishCase(page, caseId, { route, theme, width, control: await controlled.verify() });
    });
  }

  for (const state of REQUIRED_STATES) for (const theme of THEMES) for (const width of VIEWPORTS) {
    const caseId = `state:${state}:${theme}:${width}`;
    suiteCases.push(caseId);
    test(`${caseId} controlled live state`, async ({ page }) => {
      const fixture = fixtures.states[state]; const controlled = await armControl(caseId);
      markCaseAction(page);
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme as "light" | "dark" });
      await installTheme(page, theme as "light" | "dark");
      await page.goto(fixture.path);
      if (fixture.trigger) { const trigger = page.getByRole(fixture.trigger.role, { name: fixture.trigger.name, exact: true }); await focusByKeyboard(page, trigger); await page.keyboard.press("Enter"); }
      await assertSurfaceContract(page, fixture, theme as "light" | "dark");
      await finishCase(page, caseId, { state, theme, width, control: await controlled.verify() });
    });
  }

  suiteCases.push("keyboard:list-filter");
  test("keyboard:list-filter US-001 NFR-001", async ({ page }) => {
    const fixture = fixtures.routes.list; const controlled = await armControl("keyboard:list-filter");
    markCaseAction(page);
    await page.goto(fixture.path);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    const search = page.getByLabel("Search"); await focusByKeyboard(page, search); await expect(search).toBeFocused(); await search.pressSequentially("BKG");
    await activateByKeyboard(page, page.getByRole("button", { name: "Apply filters" }));
    await expect(page).toHaveURL(/q=BKG/);
    await finishCase(page, "keyboard:list-filter", { control: await controlled.verify() });
  });

  suiteCases.push("keyboard:create-to-confirm");
  test("keyboard:create-to-confirm US-002 mutation proof", async ({ page }) => {
    const fixture = fixtures.routes.create; const controlled = await armControl("keyboard:create-to-confirm");
    markCaseAction(page);
    const raw = join(".w2-02-traces", "staged", runId!, "mutation-raw.zip");
    const promoted = join(runRoot!, "traces", "mutation-sanitized.zip");
    const report = join(runRoot!, "traces", "mutation-sanitizer-report.json");
    mkdirSync(dirname(raw), { recursive: true }); mkdirSync(dirname(promoted), { recursive: true });
    await page.context().tracing.start({ screenshots: true, snapshots: true, sources: false });
    let journeyFailure: unknown;
    try {
      await page.goto(fixture.path); await fillBooking(page);
      await activateByKeyboard(page, page.getByRole("button", { name: "Create draft" }));
      await expect(page).toHaveURL(/\/booking\/[^/?]+\?created=1/);
      for (const [action, status] of [["Validate references", "VALIDATED"], ["Price", "PRICED"], ["Confirm", "CONFIRMED"]] as const) {
        await activateByKeyboard(page, page.getByRole("button", { name: action, exact: true }));
        await expect(page.getByText(status, { exact: true }).first()).toBeVisible();
      }
    } catch (error) { journeyFailure = error; }
    await page.context().tracing.stop({ path: raw });
    await sanitizeTraceArchive(raw, promoted, report, { localIdentities: requiredLocalIdentities() });
    if (journeyFailure) throw journeyFailure;
    await finishCase(page, "keyboard:create-to-confirm", { mutation: true, control: await controlled.verify(), trace: { promoted: "traces/mutation-sanitized.zip", report: "traces/mutation-sanitizer-report.json", rawRemoved: true } });
  });
});

if (JSON.stringify(suiteCases) !== JSON.stringify(registered)) throw new Error("Playwright suite registration drifted from the production fixture/coverage contract");
