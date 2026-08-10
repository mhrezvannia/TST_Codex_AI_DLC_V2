import assert from "node:assert/strict";
import { test } from "node:test";
import registry from "./acceptance-registry.json" with { type: "json" };
import { resolveBrowserRoute, runBrowserEvidence } from "../../tools/u06/browser-adapter.mjs";

const digest = "a".repeat(64);
const goodAssertions = { networkOrigins: ["http://127.0.0.1:18088"], axeCritical: 0, axeSerious: 0, semantic: true,
  keyboard: true, focus: true, liveRegion: true, reducedMotion: true, pageOverflow: false, focusClipped: false, hiddenPrimaryAction: false };

function driver({ signed = true, failKey } = {}) {
  const calls = [];
  return { calls, routeFixtures: { agreementId: "agreement-1", rateId: "rate-1", bookingId: "booking-1" },
    authenticateSignedSession: async () => signed ? ({ signed: true, subject: "analyst", sessionId: "signed-session" }) : null,
    executeCell: async (cell) => { calls.push([cell.key, cell.resolvedRoute, cell.scenario]); return { stateObserved: true,
      correlationObserved: true, correlationId: `corr-${cell.key}`,
      assertions: cell.key === failKey ? { ...goodAssertions, axeSerious: 1 } : goodAssertions,
      screenshot: Buffer.from("png"), axeReport: Buffer.from("{}"), assertionJson: Buffer.from("{}"),
      traceEntries: [{ name: `${cell.key}.json`, text: "trace", compressedContent: Buffer.alloc(5) }] }; } };
}

const publisher = async ({ cell }) => registry.members.find((member) => member.key === cell.key).artifactKinds
  .map((kind) => ({ kind, sha256: digest, bytes: 5, relativePath: `results/browser/${cell.key.toLowerCase().replaceAll(":", "-")}-${kind}.json` }));
const publishing = async (input) => ({ refs: await publisher(input), records: [] });

test("browser adapter requires a signed session and executes the exact closed 76 cells", async () => {
  await assert.rejects(() => runBrowserEvidence({ registry, driver: driver({ signed: false }), publishArtifacts: publisher }), (error) => error.status === "BLOCKED");
  const observed = driver(); const result = await runBrowserEvidence({ registry, driver: observed, publishArtifacts: publishing });
  assert.equal(result.status, "PASS"); assert.equal(result.results.length, 76); assert.equal(new Set(observed.calls).size, 76);
  assert.deepEqual(observed.calls.map(([key]) => key), registry.members.filter((member) => member.category.startsWith("BROWSER") || member.category === "DESIGN_DEPENDENCY").map((member) => member.key));
  assert.ok(observed.calls.every(([, route]) => route.startsWith("/") && !route.includes("[")));
  assert.equal(new Set(observed.calls.filter(([, , scenario]) => scenario).map(([, , scenario]) => scenario)).size > 20, true);
});

test("browser adapter fails closed on accessibility and incomplete trace publication", async () => {
  const key = registry.members.find((member) => member.category === "BROWSER_STRUCTURAL").key;
  const failed = await runBrowserEvidence({ registry, driver: driver({ failKey: key }), publishArtifacts: publishing });
  assert.equal(failed.status, "FAIL"); assert.equal(failed.results.find((result) => result.key === key).status, "FAIL");
  const incomplete = await runBrowserEvidence({ registry, driver: driver(), publishArtifacts: async () => ({ refs: [], records: [] }) });
  assert.equal(incomplete.status, "FAIL"); assert.ok(incomplete.results.every((result) => result.status === "FAIL"));
});

test("parameterized routes require bounded fixtures and never reach the driver unresolved", () => {
  assert.equal(resolveBrowserRoute("/charge-agreements/[agreementId]", { agreementId: "a-1" }, "cell"), "/charge-agreements/a-1");
  assert.equal(resolveBrowserRoute("/booking/[id]", {
    bookingId: "fallback",
    bookingIdByKey: { cell: "booking-for-cell" }
  }, "cell"), "/booking/booking-for-cell");
  assert.throws(() => resolveBrowserRoute("/booking/[id]", {}, "cell"), (error) => error.status === "BLOCKED");
  assert.throws(() => resolveBrowserRoute("/booking/[id]", { bookingId: "../manager" }, "cell"), /fixture/);
});
