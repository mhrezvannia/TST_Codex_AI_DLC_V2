import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { REQUIRED_CASE_IDS } from "./w2-02-coverage-ledger.mjs";
import { assertFixtureCoverage, createFixtureManifest, registerRequiredCases, validateFixtureManifest, writeProductionFixture } from "./w2-02-fixture-contract.mjs";
import { createControlProxy, validateCausalObservation } from "./w2-02-ssr-control-proxy.mjs";

test("production-written top-level fixture is the exact Playwright registration contract", async () => {
  const path = join(tmpdir(), `w2-02-fixture-${process.pid}-${Date.now()}.json`);
  try {
    await writeProductionFixture(path); const fixture = assertFixtureCoverage(JSON.parse(await readFile(path, "utf8")));
    assert.ok(fixture.routes && fixture.states && !("fixtures" in fixture));
    const registered = []; registerRequiredCases((id) => registered.push(id)); assert.deepEqual(registered, REQUIRED_CASE_IDS);
  } finally { await rm(path, { force: true }); }
});

test("route/state aliasing cannot satisfy the fixed contract", () => {
  for (const mutate of [
    (value) => { value.routes.detail = structuredClone(value.routes.list); },
    (value) => { value.states.denied.stateSelector = value.states.populated.stateSelector; },
    (value) => { value.states.loading.control.mode = "populated-list"; }
  ]) { const value = createFixtureManifest(); mutate(value); assert.throws(() => validateFixtureManifest(value), /exactly match/); }
});

test("external SSR control causally changes the server dependency response", async () => {
  const token = "t".repeat(64); const server = createControlProxy({ token, upstream: "http://127.0.0.1:1" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)); const { port } = server.address(); const base = `http://127.0.0.1:${port}`;
  try {
    const transitionId = "causal-1";
    const armed = await fetch(`${base}/__w2-02/control`, { method: "POST", headers: { "content-type": "application/json", "x-w2-02-control": token }, body: JSON.stringify({ caseId: "state:empty:light:375", transitionId }) }); assert.equal(armed.status, 200);
    const result = await fetch(`${base}/api/bookings?page=0`); assert.equal(result.status, 200); assert.deepEqual((await result.json()).items, []);
    const observed = await fetch(`${base}/__w2-02/observation?transitionId=${transitionId}`, { headers: { "x-w2-02-control": token } }).then((response) => response.json());
    assert.equal(observed.causal, true); assert.equal(observed.appliedCount, 1); assert.equal(observed.observations[0].action, "synthetic-empty");
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test("create reference loads and the mixed mutation journey satisfy their exact passthrough contracts", async () => {
  const upstream = createServer(async (request, response) => {
    for await (const _chunk of request) { /* consume the request body */ }
    const status = request.method === "POST" && request.url === "/api/bookings" ? 201 : 200;
    response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify({ ok: true }));
  });
  await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  const upstreamBase = `http://127.0.0.1:${upstream.address().port}`; const token = "p".repeat(64);
  const proxy = createControlProxy({ token, upstream: upstreamBase }); await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${proxy.address().port}`;
  const arm = async (caseId, transitionId) => {
    const result = await fetch(`${base}/__w2-02/control`, { method: "POST", headers: { "content-type": "application/json", "x-w2-02-control": token }, body: JSON.stringify({ caseId, transitionId }) });
    assert.equal(result.status, 200);
  };
  const observed = async (caseId, transitionId) => validateCausalObservation(caseId, await fetch(`${base}/__w2-02/observation?transitionId=${transitionId}`, { headers: { "x-w2-02-control": token } }).then((response) => response.json()));
  try {
    await arm("visual:create:light:375", "create-reference");
    for (const set of ["CUSTOMERS", "LOCATIONS", "VOYAGES", "EQUIPMENT_TYPES"]) assert.equal((await fetch(`${base}/api/reference-options?set=${set}`)).status, 200);
    const createObservation = await observed("visual:create:light:375", "create-reference"); assert.equal(createObservation.observations.every(({ path }) => path === "/api/reference-options"), true);

    await arm("state:loading:light:375", "loading-reference");
    for (const set of ["CUSTOMERS", "LOCATIONS", "VOYAGES", "EQUIPMENT_TYPES"]) assert.equal((await fetch(`${base}/api/reference-options?set=${set}`)).status, 200);
    const loadingReferenceObservation = await fetch(`${base}/__w2-02/observation?transitionId=loading-reference`, { headers: { "x-w2-02-control": token } }).then((response) => response.json());
    assert.equal(loadingReferenceObservation.appliedCount, 0);
    assert.deepEqual(loadingReferenceObservation.observations, []);

    await arm("keyboard:create-to-confirm", "mutation-mixed");
    await fetch(`${base}/api/reference-options?set=CUSTOMERS`);
    await fetch(`${base}/api/bookings`, { method: "POST", body: "{}" });
    for (const action of ["validate", "price", "confirm"]) await fetch(`${base}/api/bookings/BKG-1/${action}`, { method: "POST", body: "{}" });
    const mutationObservation = await observed("keyboard:create-to-confirm", "mutation-mixed");
    assert.deepEqual(mutationObservation.observations.map(({ path }) => path), ["/api/reference-options", "/api/bookings", "/api/bookings/BKG-1/validate", "/api/bookings/BKG-1/price", "/api/bookings/BKG-1/confirm"]);
  } finally {
    await new Promise((resolve) => proxy.close(resolve)); await new Promise((resolve) => upstream.close(resolve));
  }
});

test("Booking loading preserves the one shared shell and keyboard journeys use real key input", async () => {
  const [layout, loading, list, create, detail, spec] = await Promise.all([
    readFile("apps/shell/app/booking/layout.tsx", "utf8"),
    readFile("apps/shell/app/booking/loading.tsx", "utf8"),
    readFile("apps/shell/app/booking/page.tsx", "utf8"),
    readFile("apps/shell/app/booking/new/page.tsx", "utf8"),
    readFile("apps/shell/app/booking/[bookingId]/page.tsx", "utf8"),
    readFile("tests/w2-02/booking.spec.ts", "utf8")
  ]);
  assert.match(layout, /<ShellFrame[\s\S]*activePath="booking"/); assert.match(layout, /requireShellSession/);
  assert.match(loading, /aria-label="Loading bookings"[\s\S]*data-state="loading"/); assert.doesNotMatch(loading, /ShellFrame/);
  for (const page of [list, create, detail]) assert.doesNotMatch(page, /<ShellFrame/);
  assert.equal(createFixtureManifest().states.loading.primaryAction.name, "Booking");
  assert.doesNotMatch(spec, /\.fill\s*\(|\.value\s*=/); assert.doesNotMatch(spec, /activeElement\s*\.\s*blur|\.focus\s*\(|evaluate\([^)]*(?:blur|focus\s*\()/s);
  assert.match(spec, /keyboard\.press\("Tab"\)/); assert.match(spec, /pressSequentially/); assert.match(spec, /toBeFocused/); assert.match(spec, /keyboard\.press\("Enter"\)/);
});
