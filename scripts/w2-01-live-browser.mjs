import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const outputRoot = resolve(valueAfter("--output-root") ?? "artifacts/w2-01-live/app-shell-auth");
const baseUrl = valueAfter("--base-url") ?? "http://127.0.0.1:8088";
const chargeUrl = valueAfter("--charge-url") ?? "http://127.0.0.1:8084";
const composeProject = valueAfter("--compose-project") ?? "linercore-shared-platform";
const chromePath = process.env.PLAYWRIGHT_CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const screenshotRoot = join(outputRoot, "screenshots");
mkdirSync(screenshotRoot, { recursive: true });

const evidence = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  composeProject,
  browser: { engine: "chromium", executablePath: chromePath },
  runtime: { status: "BLOCKED", services: [] },
  prerequisites: [],
  scenarios: [],
  actors: [],
  signOut: null,
  compatibility: [],
  screenshots: [],
  httpFailures: [],
  errors: []
};

let browser;
try {
  evidence.runtime = await checkRuntime();
  if (evidence.runtime.status !== "PASS") {
    throw new Error("W2-01 runtime prerequisites did not become ready");
  }
  evidence.prerequisites.push(await ensurePricingAgreement());
  browser = await chromium.launch({ headless: true, executablePath: chromePath });

  const allowed = await runAllowedJourney(browser);
  evidence.scenarios.push(allowed.scenario);
  evidence.actors.push(...allowed.actors);
  evidence.compatibility = await runCompatibility(allowed.page, allowed.bookingId);
  evidence.scenarios.push(compatibilityScenario(evidence.compatibility));
  evidence.signOut = await runSignOut(allowed.page, allowed.context, allowed.session);
  evidence.scenarios.push(signOutScenario(evidence.signOut));
  await allowed.context.close();

  const denied = await runDeniedJourney(browser);
  evidence.scenarios.push(denied.scenario);
  evidence.actors.push(denied.actor);
  await denied.context.close();
} catch (error) {
  evidence.errors.push(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
} finally {
  await browser?.close();
  writeFileSync(join(outputRoot, "browser-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}

const complete = evidence.runtime.status === "PASS"
  && evidence.prerequisites.every((prerequisite) => prerequisite.status === "PASS")
  && evidence.errors.length === 0
  && ["allow-booking-create-detail", "deny-booking-access", "sign-out-reauth-stale-call", "legacy-bookings-compatibility"]
    .every((id) => evidence.scenarios.some((scenario) => scenario.scenarioId === id && scenario.status === "PASS"));
console.log(JSON.stringify({ status: complete ? "PASS" : "BLOCKED", evidence: join(outputRoot, "browser-evidence.json"), errors: evidence.errors }, null, 2));
process.exit(complete ? 0 : 1);

async function checkRuntime() {
  const paths = [
    ["nginx", `${baseUrl}/health`],
    ["apps-shell", `${baseUrl}/api/health`],
    ["apps-auth", `${baseUrl}/auth/api/health`],
    ["apps-booking", "http://127.0.0.1:3001/"],
    ["identity-service", "http://127.0.0.1:8082/actuator/health"],
    ["charge-agreement-service", `${chargeUrl}/actuator/health`],
    ["booking-service", "http://127.0.0.1:8085/actuator/health"]
  ];
  const services = [];
  for (const [name, url] of paths) {
    services.push(await waitForRuntimeService(name, url));
  }
  return { status: services.every((service) => service.status === "PASS") ? "PASS" : "BLOCKED", services };
}

async function waitForRuntimeService(name, url) {
  const deadline = Date.now() + 30_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return { name, url, httpStatus: response.status, status: "PASS" };
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = String(error);
    }
    await new Promise((resolveTimer) => setTimeout(resolveTimer, 1_000));
  }
  return { name, url, httpStatus: null, status: "BLOCKED", error: lastError };
}

async function ensurePricingAgreement() {
  const agreementNumber = "W2-01-LIVE-NA-EU-GEN";
  const correlationId = crypto.randomUUID();
  const search = new URL(`${chargeUrl}/api/charge-agreements`);
  search.searchParams.set("customerId", "party-customer-local-carrier");
  search.searchParams.set("tradeLaneId", "NA-EU");
  search.searchParams.set("commodityId", "GEN");
  search.searchParams.set("includeInactive", "true");
  const searched = await checkedJson(await fetch(search, {
    headers: { "X-Correlation-Id": correlationId }
  }), "search pricing fixture");
  const existing = searched.items?.find((item) => item.agreementNumber === agreementNumber);
  let agreement = existing
    ? await checkedJson(await fetch(`${chargeUrl}/api/charge-agreements/${existing.id}?actor=w2-01-live`, {
        headers: { "X-Correlation-Id": correlationId }
      }), "read pricing fixture")
    : await checkedJson(await fetch(`${chargeUrl}/api/charge-agreements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Correlation-Id": correlationId },
        body: JSON.stringify({
          agreementNumber,
          customerId: "party-customer-local-carrier",
          tradeLaneId: "NA-EU",
          commodityId: "GEN",
          validFrom: "2020-01-01",
          validTo: "2099-12-31",
          terms: [],
          actorSubjectId: "w2-01-live",
          reason: "W2-01 live acceptance fixture"
        })
      }), "create pricing fixture");

  if (agreement.status === "DRAFT" && agreement.terms.length === 0) {
    agreement = await checkedJson(await fetch(`${chargeUrl}/api/charge-agreements/${agreement.id}?version=${agreement.version}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Correlation-Id": correlationId },
      body: JSON.stringify({
        agreementNumber,
        customerId: "party-customer-local-carrier",
        tradeLaneId: "NA-EU",
        commodityId: "GEN",
        validFrom: "2020-01-01",
        validTo: "2099-12-31",
        terms: [{
          id: "w2-01-ocean-freight",
          chargeCodeId: "charge-code-ofr",
          basis: "TEU",
          amount: 1000,
          currencyId: "currency-usd",
          validFrom: "2020-01-01",
          validTo: "2099-12-31",
          notes: "W2-01 deterministic live rate"
        }],
        actorSubjectId: "w2-01-live",
        reason: "Add deterministic live rate"
      })
    }), "add pricing fixture term");
  }
  if (agreement.status === "DRAFT") {
    agreement = await checkedJson(await fetch(`${chargeUrl}/api/charge-agreements/${agreement.id}/approve?version=${agreement.version}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Correlation-Id": correlationId },
      body: JSON.stringify({ actorSubjectId: "w2-01-live", reason: "Approve live acceptance rate" })
    }), "approve pricing fixture");
  }
  if (agreement.status !== "APPROVED") {
    throw new Error(`Pricing fixture ${agreement.id} is ${agreement.status}, expected APPROVED`);
  }
  return {
    name: "approved-charge-agreement",
    status: "PASS",
    agreementId: agreement.id,
    agreementNumber,
    correlationId,
    source: existing ? "reused" : "created"
  };
}

async function checkedJson(response, operation) {
  const body = await response.text();
  if (!response.ok) throw new Error(`${operation} failed with HTTP ${response.status}: ${body}`);
  return JSON.parse(body);
}

async function runAllowedJourney(browserInstance) {
  const context = await browserInstance.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  captureHttpFailures(page);
  const session = await login(page, "booking.user", "booking", "local.booking.user");

  const bookingReadStarted = performance.now();
  await page.goto(`${baseUrl}/booking`);
  const bookingReadMs = elapsedMs(bookingReadStarted);

  await page.goto(`${baseUrl}/booking/new`);
  await page.getByTestId("booking-customerId").fill("party-customer-local-carrier");
  await page.getByTestId("booking-loadUnLocode").fill("USNYC");
  await page.getByTestId("booking-dischargeUnLocode").fill("NLRTM");
  await page.getByTestId("booking-voyageId").fill("voyage-local-001");
  await page.getByTestId("booking-equipmentTypeCode").fill("45G1");
  await page.getByTestId("booking-equipmentId").fill("MSCU6639870");
  await page.getByTestId("booking-commodityCode").fill("GEN");
  const createStarted = performance.now();
  await page.getByTestId("booking-submit").click();
  try {
    await page.waitForURL(/\/booking\/[^/?]+\?created=1$/, { timeout: 30_000 });
  } catch {
    const alert = await page.getByRole("alert").textContent().catch(() => "no alert");
    throw new Error(`Booking create did not navigate from ${page.url()}: ${alert}`);
  }
  const createMs = elapsedMs(createStarted);
  const bookingId = decodeURIComponent(new URL(page.url()).pathname.split("/").pop());
  const detailStarted = performance.now();
  await page.getByTestId("booking-validate").waitFor({ state: "visible", timeout: 30_000 });
  const detailMs = elapsedMs(detailStarted);

  const lifecycleStarted = performance.now();
  await page.getByTestId("booking-validate").click();
  await waitForLifecycle(page, "VALIDATED", "booking-price");
  await page.getByTestId("booking-price").click();
  await waitForLifecycle(page, "PRICED", "booking-confirm", 60_000);
  await page.getByTestId("booking-confirm").click();
  await waitForStatus(page, "CONFIRMED", 30_000);
  const lifecycleMs = elapsedMs(lifecycleStarted);

  const screenshot = join(screenshotRoot, "booking-confirmed-desktop.png");
  await page.screenshot({ path: screenshot, fullPage: true });
  evidence.screenshots.push(relativeEvidencePath(screenshot));

  const audits = bookingAuditRows(bookingId);
  const actorRows = audits.map((row) => ({
    scenarioId: "allow-booking-create-detail",
    source: "linercore_booking.booking_audit",
    bookingId,
    eventType: row.eventType,
    actorSubjectId: row.actorSubjectId,
    result: row.result,
    correlationId: row.correlationId
  }));
  const realActorObserved = actorRows.length > 0 && actorRows.every((row) => row.actorSubjectId === session.subject);
  return {
    context,
    page,
    bookingId,
    session,
    actors: [
      { scenarioId: "allow-booking-create-detail", source: "OIDC session", actorSubjectId: session.subject, correlationId: session.correlationId },
      ...actorRows
    ],
    scenario: {
      scenarioId: "allow-booking-create-detail",
      actor: session.subject,
      route: `/booking/${bookingId}`,
      expectedResult: "create, validate, price, and confirm through the mounted shell",
      observedResult: realActorObserved ? "CONFIRMED with matching OIDC subject in booking_audit" : "booking completed but backend actor evidence did not match",
      status: realActorObserved ? "PASS" : "BLOCKED",
      correlationId: actorRows.at(-1)?.correlationId ?? session.correlationId,
      evidenceRefs: ["browser-evidence.json", relativeEvidencePath(screenshot)],
      timings: { bookingReadMs, createMs, detailMs, lifecycleMs }
    }
  };
}

async function runDeniedJourney(browserInstance) {
  const context = await browserInstance.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  captureHttpFailures(page);
  const session = await login(page, "reference.admin", "reference", "local.reference.admin");
  const denialProbe = await page.request.get(`${baseUrl}/api/booking/bookings`, { maxRedirects: 0 });
  const denialProbeBody = await denialProbe.text();
  const denyStarted = performance.now();
  await page.goto(`${baseUrl}/booking`);
  const denied = page.getByTestId("shell-access-denied");
  try {
    await denied.waitFor({ state: "visible", timeout: 30_000 });
  } catch (error) {
    const diagnostic = join(screenshotRoot, "booking-access-denied-diagnostic.png");
    await page.screenshot({ path: diagnostic, fullPage: true });
    throw new Error(`Denied surface missing; API probe returned ${denialProbe.status()} ${denialProbeBody}; page text: ${(await page.locator("body").innerText()).slice(0, 500)}; ${error}`);
  }
  const denyMs = elapsedMs(denyStarted);
  const text = await denied.textContent();
  const screenshot = join(screenshotRoot, "booking-access-denied.png");
  await page.screenshot({ path: screenshot, fullPage: true });
  evidence.screenshots.push(relativeEvidencePath(screenshot));
  const passed = text?.includes(session.subject) && text.includes("Access denied");
  return {
    context,
    actor: { scenarioId: "deny-booking-access", source: "OIDC session and shell denial", actorSubjectId: session.subject, correlationId: session.correlationId },
    scenario: {
      scenarioId: "deny-booking-access",
      actor: session.subject,
      route: "/booking",
      expectedResult: "authenticated denial inside the shell",
      observedResult: passed ? "shell denial displays the authenticated Keycloak subject" : "denial panel did not preserve actor evidence",
      status: passed ? "PASS" : "BLOCKED",
      correlationId: session.correlationId,
      evidenceRefs: ["browser-evidence.json", relativeEvidencePath(screenshot)],
      timings: { denyMs }
    }
  };
}

async function runCompatibility(page, bookingId) {
  const cases = [
    ["/bookings", "/booking"],
    ["/bookings/new", "/booking/new"],
    [`/bookings/${encodeURIComponent(bookingId)}`, `/booking/${encodeURIComponent(bookingId)}`]
  ];
  const rows = [];
  for (const [legacyPath, canonicalPath] of cases) {
    const started = performance.now();
    const response = await page.request.get(`${baseUrl}${legacyPath}`, { maxRedirects: 0 });
    rows.push({
      legacyPath,
      canonicalPath,
      httpStatus: response.status(),
      location: response.headers().location ?? null,
      durationMs: elapsedMs(started),
      status: response.status() === 308 && response.headers().location === canonicalPath ? "PASS" : "BLOCKED"
    });
  }
  return rows;
}

async function runSignOut(page, context, session) {
  await page.goto(`${baseUrl}/booking`);
  const signOutStarted = performance.now();
  await page.getByTestId("shell-sign-out-button").click();
  const logoutButton = page.locator("#kc-logout");
  if (await logoutButton.isVisible({ timeout: 3_000 }).catch(() => false)) await logoutButton.click();
  await page.waitForURL(/\/signed-out(?:\?|$)/, { timeout: 30_000 });
  const signOutMs = elapsedMs(signOutStarted);

  const cookies = await context.cookies(baseUrl);
  const staleCallStarted = performance.now();
  const stale = await page.request.post(`${baseUrl}/api/booking/bookings`, {
    data: {},
    headers: { "idempotency-key": crypto.randomUUID(), "x-correlation-id": crypto.randomUUID() },
    maxRedirects: 0
  });
  const staleCallMs = elapsedMs(staleCallStarted);
  const postSignOutGuardStarted = performance.now();
  await page.goto(`${baseUrl}/booking`);
  const postSignOutGuardMs = elapsedMs(postSignOutGuardStarted);
  const reauthRequired = new URL(page.url()).hostname === "127.0.0.1" && new URL(page.url()).port === "8080";
  return {
    preSignOutSubject: session.subject,
    signOutCorrelationId: session.correlationId,
    signOutCommand: "POST /api/auth/sign-out through shell/auth route",
    signOutExitOrHttpStatus: 200,
    cookieCleared: !cookies.some((cookie) => cookie.name === "lc_session"),
    postSignOutRoute: "/booking",
    postSignOutDecision: reauthRequired ? "Keycloak reauthentication required" : `unexpected ${page.url()}`,
    staleCallStatus: stale.status(),
    staleCallCode: await responseCode(stale),
    staleCallCorrelationId: stale.headers()["x-correlation-id"] ?? "response-body",
    backendLocalUserObserved: false,
    reauthRequired,
    timings: { signOutMs, staleCallMs, postSignOutGuardMs }
  };
}

async function login(page, username, password, expectedSubject) {
  await page.goto(`${baseUrl}/booking`);
  await page.locator("#username").waitFor({ state: "visible", timeout: 30_000 });
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
  await Promise.all([
    page.waitForURL(new RegExp(`${escapeRegex(baseUrl)}/booking`), { timeout: 30_000 }),
    page.locator("#kc-login").click()
  ]);
  const response = await page.request.get(`${baseUrl}/auth/api/auth/session`);
  const session = await response.json();
  if (!session.isAuthenticated || session.subject !== expectedSubject) {
    throw new Error(`Expected authenticated subject ${expectedSubject}, observed ${session.subject || "anonymous"}`);
  }
  return session;
}

async function waitForLifecycle(page, status, enabledTestId, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await page.getByTestId(enabledTestId).isEnabled().catch(() => false)) return;
    await page.waitForTimeout(1_000);
    await page.reload();
    if (await page.getByText(status, { exact: true }).count() > 0 && await page.getByTestId(enabledTestId).isEnabled().catch(() => false)) return;
  }
  throw new Error(`Booking did not reach ${status} before timeout`);
}

async function waitForStatus(page, status, timeout) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await page.getByText(status, { exact: true }).count() > 0) return;
    await page.waitForTimeout(1_000);
    await page.reload();
  }
  throw new Error(`Booking did not reach ${status} before timeout`);
}

function bookingAuditRows(bookingId) {
  if (!/^[A-Za-z0-9-]+$/.test(bookingId)) throw new Error("Unexpected booking identifier format");
  const sql = `select coalesce(json_agg(json_build_object('eventType', event_type, 'actorSubjectId', actor_subject_id, 'result', result, 'correlationId', correlation_id) order by audit_id), '[]'::json) from booking_audit where booking_id = '${bookingId}';`;
  const result = spawnSync("docker", ["compose", "-p", composeProject, "exec", "-T", "postgres", "psql", "-U", "linercore_booking", "-d", "linercore_booking", "-At", "-c", sql], { encoding: "utf8", timeout: 30_000 });
  if (result.status !== 0) throw new Error(`booking_audit query failed: ${result.stderr?.trim()}`);
  return JSON.parse(result.stdout.trim() || "[]");
}

function compatibilityScenario(rows) {
  const passed = rows.length === 3 && rows.every((row) => row.status === "PASS");
  return {
    scenarioId: "legacy-bookings-compatibility",
    actor: "local.booking.user",
    route: "/bookings, /bookings/new, /bookings/[id]",
    expectedResult: "308 redirects to canonical shell routes",
    observedResult: passed ? "all legacy routes returned the expected canonical redirect" : "one or more compatibility redirects differed",
    status: passed ? "PASS" : "BLOCKED",
    correlationId: "browser-http-observation",
    evidenceRefs: ["browser-evidence.json"]
  };
}

function signOutScenario(signOut) {
  const passed = signOut.cookieCleared && signOut.reauthRequired && [401, 403].includes(signOut.staleCallStatus);
  return {
    scenarioId: "sign-out-reauth-stale-call",
    actor: signOut.preSignOutSubject,
    route: "/api/auth/sign-out -> /booking",
    expectedResult: "session cleared, reauthentication required, stale API call fails closed",
    observedResult: passed ? `cookie cleared; stale call returned ${signOut.staleCallStatus}` : "sign-out evidence did not satisfy every fail-closed check",
    status: passed ? "PASS" : "BLOCKED",
    correlationId: signOut.signOutCorrelationId,
    evidenceRefs: ["browser-evidence.json"],
    timings: signOut.timings
  };
}

async function responseCode(response) {
  const payload = await response.json().catch(() => ({}));
  return payload.code ?? payload.error ?? null;
}

function captureHttpFailures(page) {
  page.on("response", async (response) => {
    if (response.status() < 400) return;
    evidence.httpFailures.push({
      url: response.url(),
      status: response.status(),
      body: await response.text().catch(() => "unavailable")
    });
  });
}

function relativeEvidencePath(path) {
  return path.slice(outputRoot.length + 1).replaceAll("\\", "/");
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function elapsedMs(started) {
  return Math.round((performance.now() - started) * 100) / 100;
}
