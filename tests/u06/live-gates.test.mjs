import assert from "node:assert/strict";
import { test } from "node:test";
import registry from "./acceptance-registry.json" with { type: "json" };
import { MIGRATIONS, OBSERVABILITY_IDS, PRESERVATION_IDS, SECURITY_IDS, boundedReadiness, browserMatrix, databaseEvidence, deterministicLegacyAgreementId, expectedPrice, orchestrateGates, performanceRequests, restoreTarget, sanitizeTraceEntries, validateAudit, validateBrowserAssertion, validateClosedMatrix, validateCommercialScenario, validateMigrationProof, validateObservability, validatePerformanceSamples, validateResourceCycles, validateRestoreGuard } from "../../tools/u06/live-gates.mjs";

test("bounded startup records readiness and distinguishes unavailable from timeout", async () => {
  let time = 0; const now = () => time; const wait = async (ms) => { time += ms; };
  const pass = await boundedReadiness({ services: ["charge", "booking"], probe: async () => ({ ready: true, authenticated: true }), now, wait });
  assert.equal(pass.status, "PASS");
  const blocked = await boundedReadiness({ services: ["charge"], probe: async () => ({ unavailable: true }), now, wait });
  assert.equal(blocked.status, "BLOCKED");
  const fail = await boundedReadiness({ services: ["charge"], probe: async () => ({ ready: false }), now, wait, serviceMs: 1000 });
  assert.equal(fail.status, "FAIL");
});

test("owner-local DB adapters reject cross-service fields and hash selected rows", () => {
  const evidence = databaseEvidence({ owner: "CHARGE", queryId: "charge-receipt", parameters: ["p1"], rows: [{ pricing_request_id: "p1" }], correlationId: "c1" });
  assert.equal(evidence.rowCount, 1);
  assert.throws(() => databaseEvidence({ owner: "CHARGE", queryId: "charge-receipt", parameters: [], rows: [{ booking_snapshot: "x" }] }), /cross-database/);
  assert.throws(() => databaseEvidence({ owner: "BOOKING", queryId: "raw-sql", parameters: [], rows: [] }), /unknown/);
});

test("migration fixtures prove exact catalogs, legacy identity, drift fail-closed, and restart stability", () => {
  const migrations = MIGRATIONS.CHARGE.map(([version, sha256]) => ({ version, sha256 }));
  const catalog = migrations.map(({ version }, index) => ({ version, checksum: index + 1, success: true }));
  const immutableMutation = { attempted: true, rejected: true, beforeHash: "same", afterHash: "same" };
  assert.equal(validateMigrationProof({ owner: "CHARGE", startingShape: "LEGACY", databaseOid: 101, migrations,
    catalogBefore: catalog, catalogAfter: catalog, catalogHashBefore: "catalog", catalogHashAfter: "catalog",
    legacyRowsPreserved: true, inventedRateLinks: 0, restartHashStable: true, immutableMutation }), "PASS");
  assert.equal(validateMigrationProof({ owner: "CHARGE", startingShape: "DRIFTED", migrations: [], startupRejected: true }), "PASS");
  assert.equal(validateMigrationProof({ owner: "CHARGE", startingShape: "PARTIAL", migrations: [], startupRejected: false }), "FAIL");
  assert.equal(validateMigrationProof({ owner: "BOOKING", startingShape: "UNKNOWN", migrations: MIGRATIONS.BOOKING.map(([version]) => ({ version, sha256: "0".repeat(64) })), restartHashStable: true, immutableMutationRejected: true }), "FAIL");
  assert.equal(validateMigrationProof({ owner: "BOOKING", startingShape: "V2", migrations: MIGRATIONS.BOOKING.map(([version]) => ({ version, sha256: "0".repeat(64) })), restartHashStable: true, immutableMutationRejected: true }), "FAIL");
  assert.equal(validateMigrationProof({ owner: "CHARGE", startingShape: "V5", databaseOid: 101, migrations,
    catalogBefore: catalog, catalogAfter: [...catalog, { version: "V6", checksum: 6, success: true }],
    catalogHashBefore: "before", catalogHashAfter: "after", legacyRowsPreserved: true, inventedRateLinks: 0,
    restartHashStable: true, immutableMutation }), "FAIL");
  assert.equal(deterministicLegacyAgreementId("a", 1), deterministicLegacyAgreementId("a", 1));
});

test("restore targets are owner-separated and guards protect sources/manager", () => {
  const runId = "20260729T000000.000Z-deadbeef"; const charge = restoreTarget("CHARGE", runId, () => Buffer.from("deadbeef", "hex")); const booking = restoreTarget("BOOKING", runId, () => Buffer.from("cafebabe", "hex"));
  assert.notEqual(charge, booking);
  assert.equal(validateRestoreGuard({ owner: "CHARGE", target: charge, sourceName: "linercore_pricing", sourceOid: 1, targetExists: false, targetOid: null, otherTarget: booking, otherTargetOid: 2, project: "linercore-wave-a", adminDatabase: "postgres", runId }), true);
  assert.throws(() => validateRestoreGuard({ owner: "CHARGE", target: "linercore_pricing", sourceName: "linercore_pricing", sourceOid: 1, targetExists: true, project: "linercore-wave-a", adminDatabase: "postgres", runId }), /grammar|inequality/);
  assert.throws(() => validateRestoreGuard({ owner: "CHARGE", target: charge, sourceName: "x", sourceOid: 1, targetExists: false, project: "linercore-shared-platform", adminDatabase: "postgres", runId }), /server/);
  assert.throws(() => validateRestoreGuard({ owner: "MANAGER", target: "w203_restore_manager_x_deadbeef", sourceName: "linercore-shared-platform", project: "linercore-wave-a", adminDatabase: "postgres", runId }), /owner/);
});

test("independent commercial oracle and scenario validators reject fabricated or duplicate evidence", () => {
  const price = expectedPrice(); assert.equal(price.total, "125.90"); assert.deepEqual(price.lines.map((l) => l.amount), ["100.25", "20.10", "5.55"]);
  const priced = { id: "AGREEMENT_PRICE", correlationId: "c", httpCount: 1, ownerLocalDbOwners: ["CHARGE", "BOOKING"], price, receiptCount: 1, snapshotCount: 1 };
  assert.equal(validateCommercialScenario(priced), "PASS");
  assert.equal(validateCommercialScenario({ ...priced, price: { ...price, total: "0.00" } }), "FAIL");
  assert.equal(validateCommercialScenario({ id: "NO_RATE", correlationId: "c", httpCount: 1, ownerLocalDbOwners: ["CHARGE", "BOOKING"], amountPresent: false, caseCount: 1 }), "PASS");
  assert.equal(validateCommercialScenario({ id: "RECONFIRM_NO_CHARGE", correlationId: "c", httpCount: 1, ownerLocalDbOwners: ["BOOKING"], chargeCalls: 1 }), "FAIL");
});

test("browser matrix is exact and accessibility/network assertions are blocking", () => {
  const matrix = browserMatrix(registry); assert.equal(matrix.cells.length, 76); assert.equal(matrix.workers, 4);
  const good = { networkOrigins: [matrix.edgeOrigin], axeCritical: 0, axeSerious: 0, semantic: true, keyboard: true, focus: true, liveRegion: true, reducedMotion: true };
  assert.equal(validateBrowserAssertion(good), "PASS");
  assert.equal(validateBrowserAssertion({ ...good, axeSerious: 1 }), "FAIL");
  assert.equal(validateBrowserAssertion({ ...good, networkOrigins: ["http://127.0.0.1:18084"] }), "FAIL");
});

test("trace sanitizer redacts headers and blocks secrets, bombs, corrupt, and encrypted entries", () => {
  const safe = sanitizeTraceEntries([{ name: "network.txt", text: "authorization: abc", compressedContent: Buffer.alloc(10) }]);
  assert.equal(safe.status, "PASS"); assert.match(safe.entries[0].text, /redacted/);
  for (const bad of [{ encrypted: true }, { corrupt: true }, { unknown: true }, { text: "password=x" }, { text: "x".repeat(1000), compressedContent: Buffer.alloc(1) }]) {
    assert.equal(sanitizeTraceEntries([{ name: "x", text: "ok", compressedContent: Buffer.alloc(1), ...bad }], { ratio: 20 }).status, "BLOCKED");
  }
  assert.equal(sanitizeTraceEntries([{ name: "x", text: "é".repeat(10), compressedContent: Buffer.alloc(20) }], { entry: 10 }).status, "BLOCKED");
  assert.equal(sanitizeTraceEntries([{ name: "a", text: "12345", compressedContent: Buffer.alloc(6) }, { name: "b", text: "12345", compressedContent: Buffer.alloc(6) }], { compressed: 10 }).status, "BLOCKED");
});

test("performance population, nearest-rank p99, uniqueness, replay, and resources are exact", () => {
  const requests = performanceRequests(); assert.equal(requests.fresh.length, 200); assert.equal(requests.replay.length, 100); assert.equal(requests.concurrency, 10);
  const samples = [...requests.fresh.map((r, i) => ({ ...r, elapsedMs: 10 + i, receiptId: `receipt-${i}`, replayed: false, success: true })),
    ...requests.replay.map((r, i) => ({ ...r, elapsedMs: 5, receiptId: `replay-${i}`, success: true }))];
  const summary = validatePerformanceSamples(samples); assert.equal(summary.KNOWN.count, 100); assert.ok(summary.NO_RATE.p99 <= 800);
  assert.throws(() => validatePerformanceSamples(samples.map((s, i) => i === 1 ? { ...s, identityHash: samples[0].identityHash } : s)), /identity/);
  assert.equal(validateResourceCycles([{ heap: 100, rss: 100 }, { heap: 105, rss: 105 }, { heap: 110, rss: 110 }]), "PASS");
  assert.equal(validateResourceCycles([{ heap: 100, rss: 100 }, { heap: 200, rss: 200 }, { heap: 300, rss: 300, spill: true }]), "FAIL");
});

test("security, preservation, observability, and audits require closed manual evidence", () => {
  assert.equal(validateClosedMatrix(SECURITY_IDS, SECURITY_IDS.map((id) => ({ id, status: "PASS" }))), "PASS");
  assert.equal(validateClosedMatrix(PRESERVATION_IDS, PRESERVATION_IDS.slice(1).map((id) => ({ id, status: "PASS" }))), "FAIL");
  const obs = OBSERVABILITY_IDS.map((id) => ({ id, status: "PASS", delta: 1, safeCorrelation: true, highCardinality: false, redactionHits: 0, moneyInLabels: false }));
  assert.equal(validateObservability(obs), "PASS"); assert.equal(validateObservability(obs.map((o, i) => i ? o : { ...o, delta: 0 })), "FAIL");
  const lead = { severity: "HIGH", fileLine: "x.ts:10", scenario: "fault", reviewer: "operator", disposition: "OPEN", completedAt: "2026-07-29T00:00:00Z" };
  assert.equal(validateAudit([{ detectorExit: 0, manualComplete: true, leads: [lead] }, { detectorExit: 0, manualComplete: true, leads: [lead] }]), "PASS");
  assert.equal(validateAudit([]), "FAIL");
  assert.equal(validateAudit([{ detectorExit: 0, manualComplete: true, leads: [] }]), "FAIL");
  assert.equal(validateClosedMatrix(SECURITY_IDS, SECURITY_IDS.map((id, index) => ({ id, status: index ? "PASS" : "FAIL" }))), "FAIL");
});

test("end-to-end orchestrator is fail-fast, catches capabilities, rejects RUNNING, and cannot self-approve", async () => {
  const run = await orchestrateGates([{ id: "pre", run: () => ({ id: "pre", status: "PASS" }) }, { id: "docker", run: () => ({ id: "docker", status: "BLOCKED" }) }, { id: "browser", run: () => ({ id: "browser", status: "PASS" }) }]);
  assert.equal(run.status, "BLOCKED"); assert.deepEqual(run.results.map((r) => r.status), ["PASS", "BLOCKED", "SKIPPED"]); assert.equal(run.results[2].skippedBecause, "docker"); assert.equal(run.humanApproval, "NOT_EVALUATED");
  const malformed = await orchestrateGates([{ id: "bad", run: () => ({ status: "RUNNING" }) }]); assert.equal(malformed.status, "FAILED");
  const blocked = await orchestrateGates([{ id: "cap", run: () => { throw Object.assign(new Error("authorization: secret"), { status: "BLOCKED" }); } }]);
  assert.equal(blocked.status, "BLOCKED"); assert.equal(blocked.blockers.length, 1); assert.doesNotMatch(blocked.results[0].summary, /secret$/);
});
