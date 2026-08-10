import { lstatSync, realpathSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validateRegistry } from "./registry.mjs";
import { browserMatrix, sanitizeTraceEntries, validateBrowserAssertion } from "./live-gates.mjs";

const BROWSER_CATEGORIES = new Set(["BROWSER_STRUCTURAL", "BROWSER_STATE", "DESIGN_DEPENDENCY"]);

export async function runBrowserEvidence({ registry, driver, publishArtifacts }) {
  validateRegistry(registry);
  if (!driver?.authenticateSignedSession || !driver?.executeCell || typeof publishArtifacts !== "function") {
    throw blockedError("browser driver/publication capability unavailable");
  }
  const session = await driver.authenticateSignedSession();
  if (!session?.signed || !session.subject || !session.sessionId) throw blockedError("signed-session prerequisite unavailable");
  const matrix = browserMatrix(registry);
  if (matrix.cells.length !== 76 || matrix.cells.some((cell, index) => cell.key !== registry.members.filter((member) => BROWSER_CATEGORIES.has(member.category))[index].key)) {
    throw new Error("closed browser matrix enumeration mismatch");
  }
  const results = []; const artifactRecords = [];
  for (const cell of matrix.cells) {
    const resolvedRoute = resolveBrowserRoute(cell.route, driver.routeFixtures, cell.key);
    let observed;
    try { observed = await driver.executeCell({ ...cell, resolvedRoute, edgeOrigin: matrix.edgeOrigin, session }); }
    catch (error) { results.push(failedCell(cell, error?.status === "BLOCKED" ? "BLOCKED" : "FAIL", error.message)); continue; }
    const assertionStatus = validateBrowserAssertion(observed?.assertions ?? {});
    const trace = sanitizeTraceEntries(observed?.traceEntries ?? []);
    if (assertionStatus !== "PASS" || trace.status !== "PASS" || observed?.stateObserved !== true || !observed?.correlationObserved) {
      const summary = trace.message ?? browserFailureSummary(observed);
      results.push(failedCell(cell, trace.status === "BLOCKED" ? "BLOCKED" : "FAIL", summary));
      continue;
    }
    let publication;
    try { publication = await publishArtifacts({ cell, observed, trace, session }); }
    catch (error) { results.push(failedCell(cell, error?.status === "BLOCKED" ? "BLOCKED" : "FAIL", error.message)); continue; }
    const artifacts = publication?.refs;
    const member = registry.members.find((candidate) => candidate.key === cell.key);
    if (!hasExactArtifacts(member.artifactKinds, artifacts)) {
      results.push(failedCell(cell, "FAIL", "browser artifact publication incomplete")); continue;
    }
    results.push({ recordKind: "registry-result", schemaVersion: 1, recordId: cell.key, key: cell.key, status: "PASS",
      scenario: member.correlationRequired ? member.scenario : undefined,
      correlationId: member.correlationRequired ? observed.correlationId : undefined, artifacts });
    artifactRecords.push(...(publication.records ?? []));
  }
  if (results.length !== 76 || new Set(results.map((result) => result.key)).size !== 76) throw new Error("browser adapter did not emit exactly 76 cells");
  return { status: results.every((result) => result.status === "PASS") ? "PASS" : results.some((result) => result.status === "FAIL") ? "FAIL" : "BLOCKED",
    results, artifacts: artifactRecords };
}

export function createPlaywrightPageDriver({ page, axeScan, signedSession, scenarioController, routeFixtures }) {
  return {
    routeFixtures,
    async authenticateSignedSession() { return signedSession; },
    async executeCell(cell) {
      if (typeof scenarioController?.prepare !== "function" || typeof scenarioController?.assert !== "function") {
        throw blockedError("browser scenario controller unavailable");
      }
      await applyCellPresentation(page, cell);
      await scenarioController.prepare({ page, cell, session: signedSession });
      const origins = []; const onRequest = (request) => origins.push(new URL(request.url()).origin);
      page.on("request", onRequest);
      try {
        const response = await page.goto(cell.resolvedRoute);
        const main = page.getByRole("main"); await main.waitFor({ state: "visible" });
        const scenario = await scenarioController.assert({ page, cell, session: signedSession });
        const axe = await axeScan(page);
        const focus = await observeKeyboardFocus(page);
        const layout = await observeLayout(page);
        const correlationId = scenario.correlationId;
        return { stateObserved: scenario.stateObserved === true,
          correlationObserved: cell.scenario ? Boolean(correlationId && scenario.correlationObserved) : true,
          correlationId,
          assertions: { networkOrigins: origins, axeCritical: axe.critical, axeSerious: axe.serious,
            axeSeriousRules: axe.violations?.filter((item) => item.impact === "serious").map((item) => item.id) ?? [],
            semantic: response?.ok() === true,
            keyboard: focus.keyboard, focus: focus.visible, liveRegion: scenario.liveRegionObserved === true,
            reducedMotion: await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
            pageOverflow: layout.pageOverflow, overflowElements: layout.overflowElements,
            focusClipped: focus.clipped, hiddenPrimaryAction: scenario.hiddenPrimaryAction === true },
          screenshot: await page.screenshot(),
          axeReport: Buffer.from(JSON.stringify(axe)),
          assertionJson: Buffer.from(JSON.stringify({ scenario, focus, layout })),
          traceEntries: scenario.traceEntries };
      } finally { page.off("request", onRequest); }
    },
  };
}

async function applyCellPresentation(page, cell) {
  const structural = /-(375|768|1024|1440)-(LIGHT|DARK)$/.exec(cell.key);
  await page.setViewportSize({ width: structural ? Number(structural[1]) : 1024, height: 900 });
  await page.emulateMedia({
    colorScheme: structural?.[2].toLowerCase() ?? "light",
    reducedMotion: "reduce",
  });
}

export function createDefaultBrowserAdapter({ root, env = process.env }) {
  return async (state) => {
    const modulePath = env.U06_BROWSER_DRIVER_MODULE;
    let driver; let close = async () => {};
    if (modulePath) {
      const implementation = await importVerifiedModule(root, modulePath, state.runId);
      if (typeof implementation.createU06BrowserDriver !== "function") throw blockedError("createU06BrowserDriver capability unavailable");
      driver = await implementation.createU06BrowserDriver({ registry: state.registry, root, env });
      close = implementation.closeU06BrowserDriver ? () => implementation.closeU06BrowserDriver(driver) : close;
    } else {
      const built = await createBuiltInDriver({ root, env, runId: state.runId });
      driver = built.driver; close = built.close;
    }
    try {
      const observed = await runBrowserEvidence({
        registry: state.registry,
        driver,
        publishArtifacts: ({ cell, observed: cellObservation, trace }) => state.publication.publishCell({
          registryKey: cell.key,
          producingGate: "browser",
          payloads: browserPayloads(state.registry, cell, cellObservation, trace),
        }),
      });
      return { status: observed.status, blockerId: observed.status === "BLOCKED" ? "B-browser" : undefined,
        registryResults: observed.results, artifacts: observed.artifacts, summary: "exact 76-cell browser driver completed" };
    } finally { await close(); }
  };
}

export function resolveBrowserRoute(route, fixtures = {}, key = "") {
  const selected = route ?? "/charge-agreements/[agreementId]";
  const values = {
    agreementId: fixtures.agreementIdByKey?.[key] ?? fixtures.agreementId,
    rateId: fixtures.rateIdByKey?.[key] ?? fixtures.rateId,
    id: fixtures.bookingIdByKey?.[key] ?? fixtures.bookingId,
  };
  const resolved = selected.replace(/\[([A-Za-z][A-Za-z0-9]*)\]/g, (_, name) => {
    const value = values[name];
    if (!value || !/^[A-Za-z0-9._~-]+$/.test(value)) throw blockedError(`route fixture ${name} unavailable for ${key}`);
    return encodeURIComponent(value);
  });
  if (resolved.includes("[") || !resolved.startsWith("/") || /^\/\//.test(resolved)) throw new Error(`unresolved browser route ${key}`);
  return resolved;
}

function browserPayloads(registry, cell, observed, trace) {
  const values = { screenshot: observed.screenshot, "assertion-json": observed.assertionJson,
    "axe-report": observed.axeReport, "sanitized-trace": Buffer.from(JSON.stringify(trace.entries)) };
  const member = registry.members.find((candidate) => candidate.key === cell.key);
  return Object.fromEntries(member.artifactKinds.map((kind) => {
    if (!values[kind]) throw new Error(`browser payload ${kind} unavailable`);
    return [kind, values[kind]];
  }));
}

async function observeKeyboardFocus(page) {
  const inspect = () => page.evaluate(() => {
    const element = document.activeElement;
    const rectangle = element?.getBoundingClientRect();
    const visible = Boolean(element && element !== document.body && rectangle && rectangle.width > 0 && rectangle.height > 0);
    return { keyboard: visible, visible, clipped: visible && (rectangle.left < 0 || rectangle.top < 0
      || rectangle.right > innerWidth || rectangle.bottom > innerHeight) };
  });
  const current = await inspect();
  if (current.visible) return current;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await page.keyboard.press("Tab");
    const candidate = await inspect();
    if (candidate.visible && !candidate.clipped) return candidate;
  }
  return inspect();
}

async function observeLayout(page) {
  return page.evaluate(() => ({
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    overflowElements: [...document.querySelectorAll("body *")]
      .filter((element) => {
        const rectangle = element.getBoundingClientRect();
        return rectangle.width > 0 && (rectangle.right > document.documentElement.clientWidth + 1 || rectangle.left < -1);
      })
      .slice(0, 8)
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`)
  }));
}

export async function createBuiltInDriver({ root, env, runId }) {
  if (!env.U06_SIGNED_STORAGE_STATE || !env.U06_SIGNED_SESSION_SUBJECT || !env.U06_BROWSER_SCENARIO_MODULE) {
    throw blockedError("signed storage, subject, or browser scenario capability unavailable");
  }
  let playwright; let AxeBuilder;
  try {
    playwright = await import("playwright");
    AxeBuilder = (await import("@axe-core/playwright")).default;
  } catch { throw blockedError("Playwright/axe browser capability unavailable"); }
  const scenarios = await importVerifiedModule(root, env.U06_BROWSER_SCENARIO_MODULE, runId);
  if (typeof scenarios.prepareScenario !== "function" || typeof scenarios.assertScenario !== "function") {
    throw blockedError("browser scenario transition/assertion capability unavailable");
  }
  const executablePath = verifiedBrowserExecutable(env.U06_BROWSER_EXECUTABLE ?? env.W2_02_BROWSER_EXECUTABLE);
  const browser = await playwright.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:18088", storageState: path.resolve(root, env.U06_SIGNED_STORAGE_STATE),
    reducedMotion: "reduce" });
  const page = await context.newPage();
  const cookies = await context.cookies();
  const signedSession = cookies.length ? { signed: true, subject: env.U06_SIGNED_SESSION_SUBJECT,
    sessionId: await digestJson(cookies.map(({ name, domain }) => ({ name, domain }))) } : null;
  const driver = createPlaywrightPageDriver({ page, signedSession, routeFixtures: scenarios.routeFixtures,
    scenarioController: { prepare: scenarios.prepareScenario, assert: scenarios.assertScenario },
    axeScan: async (target) => {
      const report = await new AxeBuilder({ page: target }).analyze();
      return { ...report, critical: report.violations.filter((item) => item.impact === "critical").length,
        serious: report.violations.filter((item) => item.impact === "serious").length };
    } });
  return { driver, close: async () => browser.close() };
}

async function importVerifiedModule(root, relativePath, runId) {
  const resolved = path.resolve(root, relativePath);
  const stat = lstatSync(resolved);
  if (!stat.isFile() || stat.isSymbolicLink() || !realpathSync.native(resolved).toLocaleLowerCase("en-US").startsWith(`${path.resolve(root).toLocaleLowerCase("en-US")}${path.sep}`)) {
    throw new Error("browser module identity rejected");
  }
  return import(`${pathToFileURL(resolved).href}?u06=${encodeURIComponent(runId)}`);
}

async function digestJson(value) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function failedCell(cell, status, summary) {
  return { recordKind: "registry-result", schemaVersion: 1, recordId: cell.key, key: cell.key, status,
    blockerId: status === "BLOCKED" ? `B-${cell.key}` : undefined, summary, artifacts: [] };
}

function hasExactArtifacts(kinds, artifacts) {
  return Array.isArray(artifacts) && artifacts.length === kinds.length && new Set(artifacts.map((artifact) => artifact.kind)).size === kinds.length
    && kinds.every((kind) => artifacts.some((artifact) => artifact.kind === kind && /^[a-f0-9]{64}$/.test(artifact.sha256) && Number.isSafeInteger(artifact.bytes) && artifact.bytes > 0));
}

function blockedError(message) { const error = new Error(message); error.status = "BLOCKED"; return error; }

function verifiedBrowserExecutable(candidate) {
  if (!candidate?.trim()) return undefined;
  const resolved = path.resolve(candidate.trim());
  const stat = lstatSync(resolved);
  if (!stat.isFile() || stat.isSymbolicLink()) throw blockedError("browser executable identity rejected");
  return resolved;
}

function browserFailureSummary(observed) {
  const assertions = observed?.assertions ?? {};
  const failures = [];
  if (assertions.networkOrigins?.some((origin) => origin !== "http://127.0.0.1:18088")) failures.push("non-edge network origin");
  if ((assertions.axeCritical ?? 0) > 0) failures.push(`axe critical=${assertions.axeCritical}`);
  if ((assertions.axeSerious ?? 0) > 0) failures.push(`axe serious=${assertions.axeSerious} (${assertions.axeSeriousRules?.join(",") || "unknown"})`);
  for (const [key, failed] of [["semantic", !assertions.semantic], ["keyboard", !assertions.keyboard],
    ["focus", !assertions.focus], ["liveRegion", !assertions.liveRegion], ["reducedMotion", !assertions.reducedMotion],
    [assertions.pageOverflow ? `pageOverflow (${assertions.overflowElements?.join(",") || "unknown"})` : "pageOverflow", assertions.pageOverflow], ["focusClipped", assertions.focusClipped],
    ["hiddenPrimaryAction", assertions.hiddenPrimaryAction], ["stateObserved", observed?.stateObserved !== true],
    ["correlationObserved", !observed?.correlationObserved]]) if (failed) failures.push(key);
  return failures.length ? `browser assertion mismatch: ${failures.join(", ")}` : "browser assertion/correlation mismatch";
}
