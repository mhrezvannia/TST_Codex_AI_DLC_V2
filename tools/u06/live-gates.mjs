import { createHash, randomBytes } from "node:crypto";
import { redactText } from "./command.mjs";

export const MIGRATIONS = Object.freeze({
  CHARGE: [
    ["V1", "63524a7922f55229bfb14a477b966e1ea8aa0241e572a56dbd699a14f3d97e3a"],
    ["V2", "ae009a733508ee14c208b1cd7ab973a2ce6ca5f369ce78238a58206f1b95c156"],
    ["V3", "10f3f9b13243de1be3b8c1db4f3eb86c0caff12edf18bdd5a0903fbb2f2beba5"],
    ["V4", "830ea4b77c99502f53d725f62c93fcd875c82a675166acd851302f04f4756b7e"],
    ["V5", "b29258844d76721679c021b40cd1c80e1009d31ab0bb6aca0c9d287de4d02667"],
  ],
  BOOKING: [
    ["V1", "19a6edbc324efd79452350ff33e86860263c24e42044455594f24d71d93cee12"],
    ["V2", "cfd6c0552361ecd60b79f19890d4f4769af36a848c07bd015665bbbfc546042f"],
    ["V3", "4b333a0287266211239317761247a9c9feb8ea462d241d22e0e04e41789604c7"],
    ["V4", "b66f42be5d741d3425437bbda2863eba5adea06af86dc995a52f42cd123cc185"],
  ],
});
export const STARTING_SHAPES = Object.freeze({
  CHARGE: ["EMPTY", "LEGACY", "V1", "V2", "V3", "V4", "V5", "PARTIAL", "DRIFTED"],
  BOOKING: ["EMPTY", "V1", "V2", "V3", "V4", "PARTIAL", "DRIFTED"],
});
export const DB_QUERIES = Object.freeze({
  CHARGE: new Set(["charge-flyway", "charge-version-hashes", "charge-receipt", "charge-manual-case", "charge-query-plan"]),
  BOOKING: new Set(["booking-flyway", "booking-snapshot", "booking-receipt", "booking-history", "booking-query-plan"]),
});
export const SEED = Object.freeze({ currency: "USD", quantity: 1, customer: "u06-customer", lane: "u06-lane", origin: "USNYC", destination: "NLRTM", equipment: "22G1",
  rates: [{ category: "BASE", code: "OFR", unitRate: "100.25", versionId: "rv-ofr-1" }, { category: "SURCHARGE", code: "BAF", unitRate: "20.10", versionId: "rv-baf-1" }, { category: "LOCAL", code: "THC", unitRate: "5.55", versionId: "rv-thc-1" }] });
export const SECURITY_IDS = Object.freeze(["SEC-U06-001", "SEC-U06-002", "SEC-U06-003", "SEC-U06-004", "SEC-U06-005", "SEC-U06-006"]);
export const OBSERVABILITY_IDS = Object.freeze(["LATENCY", "TERMINAL_OUTCOME", "BASIS", "MANUAL_FALLBACK", "REPLAY_CONFLICT", "REDACTION"]);
export const PRESERVATION_IDS = Object.freeze(["W0-01", "W0-02", "W1-01", "W2-01", "W2-02"]);

export async function boundedReadiness({ services, probe, now = () => Date.now(), wait = async () => {}, serviceMs = 120_000, stackMs = 600_000 }) {
  const stackStart = now(); const history = [];
  for (const service of services) {
    const start = now(); let interval = 1000;
    while (true) {
      let result; try { result = await probe(service); } catch (error) { result = { unavailable: true, error: error.message }; }
      history.push({ service, atMs: now(), ...result });
      if (result.ready && result.authenticated) break;
      if (result.unavailable) return { status: "BLOCKED", blockerId: `B-readiness-${service}`, history };
      if (now() - start >= serviceMs || now() - stackStart >= stackMs) return { status: "FAIL", history };
      await wait(interval); interval = Math.min(5000, interval * 2);
    }
  }
  return { status: "PASS", history };
}

export function databaseEvidence({ owner, queryId, parameters, rows, correlationId }) {
  if (!DB_QUERIES[owner]?.has(queryId)) throw new Error("unknown owner-local query");
  if (!Array.isArray(parameters) || !Array.isArray(rows)) throw new Error("parameterized query evidence required");
  const forbiddenOwner = owner === "CHARGE" ? /booking_/i : /(?:charge_|pricing_requests|manual_pricing)/i;
  if (rows.some((row) => Object.keys(row).some((key) => forbiddenOwner.test(key)))) throw new Error("cross-database evidence rejected");
  return { recordKind: "database", schemaVersion: 1, owner, queryId, parameterHashes: parameters.map(hash), rowCount: rows.length,
    rowHashes: rows.map((row) => hash(canonical(row))), correlationId };
}

export function deterministicLegacyAgreementId(id, version) { return `av-${createHash("md5").update(`${id}:${version}`).digest("hex")}`; }
export function validateMigrationProof(proof) {
  const expected = MIGRATIONS[proof.owner]; if (!expected) throw new Error("unknown migration owner");
  if (!STARTING_SHAPES[proof.owner].includes(proof.startingShape)) return "FAIL";
  if (["PARTIAL", "DRIFTED"].includes(proof.startingShape)) return proof.startupRejected ? "PASS" : "FAIL";
  if (!Array.isArray(proof.migrations) || proof.migrations.length !== expected.length) return "FAIL";
  for (let i = 0; i < expected.length; i++) if (proof.migrations[i].version !== expected[i][0] || proof.migrations[i].sha256 !== expected[i][1]) return "FAIL";
  if (!Number.isSafeInteger(proof.databaseOid) || proof.databaseOid <= 0
    || !Array.isArray(proof.catalogBefore) || !Array.isArray(proof.catalogAfter)
    || canonical(proof.catalogBefore) !== canonical(proof.catalogAfter)
    || !proof.catalogHashBefore || proof.catalogHashBefore !== proof.catalogHashAfter) return "FAIL";
  if (proof.owner === "CHARGE" && (!proof.legacyRowsPreserved || proof.inventedRateLinks !== 0)) return "FAIL";
  if (proof.owner === "BOOKING" && !proof.legacySnapshotsPreserved) return "FAIL";
  if (!proof.restartHashStable || !proof.immutableMutation?.attempted || !proof.immutableMutation?.rejected
    || proof.immutableMutation.beforeHash !== proof.immutableMutation.afterHash) return "FAIL";
  return "PASS";
}

export function restoreTarget(owner, runId, random = randomBytes) {
  const service = owner.toLowerCase(); if (!/^(?:charge|booking)$/.test(service)) throw new Error("restore owner invalid");
  const safeRun = runId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
  return `w203_restore_${service}_${safeRun}_${random(4).toString("hex")}`;
}
export function validateRestoreGuard({ owner, target, sourceName, sourceOid, targetExists, targetOid, otherTarget, otherTargetOid, project, adminDatabase, ownerMarker, runId, expectedExists = false }) {
  if (!["CHARGE", "BOOKING"].includes(owner)) throw new Error("restore owner invalid");
  if (project !== "linercore-wave-a" || adminDatabase !== "postgres") throw new Error("restore server/project rejected");
  const expectedSource = owner === "CHARGE" ? "linercore_pricing" : "linercore_booking";
  const otherOwner = owner === "CHARGE" ? "booking" : "charge";
  if (sourceName !== expectedSource || /(?:manager|shared-platform|postgres$)/i.test(sourceName)) throw new Error("restore source identity rejected");
  if (!new RegExp(`^w203_restore_${owner.toLowerCase()}_[a-z0-9]+_[a-f0-9]{8}$`).test(target)) throw new Error("restore target grammar rejected");
  if (otherTarget && !new RegExp(`^w203_restore_${otherOwner}_[a-z0-9]+_[a-f0-9]{8}$`).test(otherTarget)) throw new Error("other restore target rejected");
  if (targetExists !== expectedExists || Boolean(targetOid) !== expectedExists) throw new Error("restore target existence observation rejected");
  if (target === sourceName || target === otherTarget || (targetOid && [sourceOid, otherTargetOid].includes(targetOid))) throw new Error("restore identity inequality rejected");
  if (expectedExists && ownerMarker !== `U06:${owner}:${runId}`) throw new Error("restore owner marker rejected");
  return true;
}

export function expectedPrice(seed = SEED) {
  const lines = seed.rates.map((rate) => ({ ...rate, quantity: seed.quantity, amount: multiplyScaleTwo(rate.unitRate, seed.quantity) }));
  const total = formatCents(lines.reduce((sum, line) => sum + parseCents(line.amount), 0n));
  return { lines, total, currency: seed.currency };
}
export function validateCommercialScenario(evidence) {
  if (!evidence.correlationId || evidence.httpCount < 1 || evidence.ownerLocalDbOwners?.some((owner) => !["CHARGE", "BOOKING"].includes(owner))) return "FAIL";
  if (evidence.id === "RECONFIRM_NO_CHARGE" && evidence.chargeCalls !== 0) return "FAIL";
  if (/^(?:NO_RATE|AMBIGUITY_)/.test(evidence.id) && (evidence.amountPresent || evidence.caseCount !== 1)) return "FAIL";
  if (/^OUTAGE_|CHARGE_DISABLED/.test(evidence.id) && (evidence.amountPresent || evidence.chargeCaseCount !== 0)) return "FAIL";
  if (["AGREEMENT_PRICE", "TARIFF_FALLBACK", "SUCCESSOR_REPRICE"].includes(evidence.id)) {
    const expected = expectedPrice();
    if (canonical(evidence.price) !== canonical(expected)) return "FAIL";
    if (evidence.receiptCount !== 1 || evidence.snapshotCount !== 1) return "FAIL";
  }
  return "PASS";
}

export function browserMatrix(registry) {
  const cells = registry.members.filter((m) => ["BROWSER_STRUCTURAL", "BROWSER_STATE", "DESIGN_DEPENDENCY"].includes(m.category));
  return { workers: 4, edgeOrigin: "http://127.0.0.1:18088", contextsIsolated: true, cells: cells.map((m) => ({ key: m.key, route: m.route, scenario: m.scenario })) };
}
export function validateBrowserAssertion(result) {
  if (result.networkOrigins?.some((origin) => origin !== "http://127.0.0.1:18088")) return "FAIL";
  if ((result.axeCritical ?? 0) > 0 || (result.axeSerious ?? 0) > 0 || result.pageOverflow || result.focusClipped || result.hiddenPrimaryAction) return "FAIL";
  if (!result.semantic || !result.keyboard || !result.focus || !result.liveRegion || !result.reducedMotion) return "FAIL";
  return "PASS";
}

export function sanitizeTraceEntries(entries, limits) {
  const cap = { entries: 2048, compressed: 64 << 20, expanded: 256 << 20, entry: 32 << 20, ratio: 20, ...(limits ?? {}) };
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > cap.entries) return blocked("trace entry cap exceeded");
  let expanded = 0; let compressed = 0; const safe = [];
  for (const entry of entries) {
    const expandedContent = Buffer.isBuffer(entry.expandedContent) ? entry.expandedContent : Buffer.from(String(entry.text ?? ""), "utf8");
    const compressedContent = Buffer.isBuffer(entry.compressedContent) ? entry.compressedContent : null;
    if (!compressedContent || entry.encrypted || entry.unknown || entry.corrupt || expandedContent.length > cap.entry || expandedContent.length / Math.max(1, compressedContent.length) > cap.ratio) return blocked("unsafe trace archive");
    expanded += expandedContent.length; compressed += compressedContent.length;
    if (expanded > cap.expanded) return blocked("expanded trace cap exceeded");
    if (compressed > cap.compressed) return blocked("compressed trace cap exceeded");
    const text = redactText(expandedContent.toString("utf8")).replace(/"(?:localStorage|sessionStorage|cookies)"\s*:\s*[^,}\n]+/gi, '"storage":"<redacted>"');
    if (Buffer.byteLength(text) > cap.entry) return blocked("sanitized trace entry cap exceeded");
    if (/(?:bearer\s+[a-z0-9._-]+|password=|secret=)/i.test(text)) return blocked("trace secret canary found");
    safe.push({ name: entry.name, text, expandedBytes: Buffer.byteLength(text), compressedBytes: compressedContent.length });
  }
  return { status: "PASS", entries: safe.sort((a, b) => a.name.localeCompare(b.name)), rescanned: true, deterministic: true };
}

export function performanceRequests(prefix = "u06") {
  const fresh = [];
  for (let i = 0; i < 100; i++) fresh.push(request(`${prefix}-known`, i, i < 50 ? "AGREEMENT" : "TARIFF"));
  for (let i = 0; i < 100; i++) fresh.push(request(`${prefix}-norate`, i, ["BASE", "SURCHARGE", "LOCAL", "MULTIPLE"][Math.floor(i / 25)]));
  const replay = Array.from({ length: 100 }, (_, i) => ({ ...fresh[i], set: "REPLAY", replayed: true }));
  return { concurrency: 10, warmupNamespace: `${prefix}-warmup`, fresh, replay };
}
export function validatePerformanceSamples(samples) {
  const groups = Map.groupBy(samples, (s) => s.set);
  for (const [name, expected] of [["KNOWN", 100], ["NO_RATE", 100], ["REPLAY", 100]]) if (groups.get(name)?.length !== expected) throw new Error(`${name} cardinality mismatch`);
  const fresh = samples.filter((s) => s.set !== "REPLAY");
  if (new Set(fresh.map((s) => s.identityHash)).size !== 200 || new Set(fresh.map((s) => s.receiptId)).size !== 200 || fresh.some((s) => s.replayed || !s.success)) throw new Error("fresh performance identity/replay failure");
  const summary = {};
  for (const name of ["KNOWN", "NO_RATE"]) { const values = groups.get(name).map((s) => s.elapsedMs); summary[name] = percentiles(values); if (summary[name].p99 > 800) throw new Error(`${name} p99 exceeds 800ms`); }
  return summary;
}
export function validateResourceCycles(cycles) {
  if (cycles.length !== 3) return "FAIL"; const first = cycles[0], third = cycles[2];
  const heapLimit = Math.max(first.heap * 1.2, first.heap + 32 * 1024 * 1024); const rssLimit = Math.max(first.rss * 1.2, first.rss + 32 * 1024 * 1024);
  return third.heap <= heapLimit && third.rss <= rssLimit && cycles.every((c) => !c.oom && !c.deadlock && !c.poolTimeout && !c.nPlusOne && !c.spill) ? "PASS" : "FAIL";
}

export function validateClosedMatrix(ids, results) {
  if (!Array.isArray(results) || results.length !== ids.length || new Set(results.map((r) => r.id)).size !== ids.length) return "FAIL";
  if (results.some((result) => !ids.includes(result.id) || !["PASS", "FAIL", "BLOCKED", "SKIPPED"].includes(result.status))) return "FAIL";
  if (results.some((result) => result.status === "FAIL")) return "FAIL";
  return ids.every((id) => results.some((r) => r.id === id && r.status === "PASS")) ? "PASS" : "BLOCKED";
}
export function validateObservability(results) {
  const matrix = validateClosedMatrix(OBSERVABILITY_IDS, results); if (matrix !== "PASS") return matrix;
  return results.every((r) => r.delta > 0 && r.safeCorrelation && !r.highCardinality && !r.redactionHits && !r.moneyInLabels) ? "PASS" : "FAIL";
}
export function validateAudit(results) {
  if (!Array.isArray(results) || results.length !== 2) return "FAIL";
  return results.every((result) => result.detectorExit === 0 && result.manualComplete === true && Array.isArray(result.leads)
    && result.leads.length > 0 && result.leads.every((lead) => lead.severity && /^[^:]+:\d+$/.test(lead.fileLine)
      && lead.scenario && lead.reviewer && lead.disposition && lead.completedAt)) ? "PASS" : "FAIL";
}

export async function orchestrateGates(gates) {
  const results = []; const blockers = []; let terminal;
  for (const gate of gates) {
    if (terminal) { results.push({ id: gate.id, status: "SKIPPED", skippedBecause: terminal.id }); continue; }
    let result;
    try { result = await gate.run(); }
    catch (error) {
      const status = error?.status === "BLOCKED" ? "BLOCKED" : "FAIL";
      result = { id: gate.id, status, blockerId: status === "BLOCKED" ? `B-${gate.id}` : undefined, summary: redactText(error?.message ?? "capability exception") };
      blockers.push({ id: result.blockerId ?? `F-${gate.id}`, gateId: gate.id, status, message: result.summary });
    }
    if (!result || !["PASS", "FAIL", "BLOCKED", "SKIPPED"].includes(result.status)) {
      result = { id: gate.id, status: "FAIL", summary: "malformed non-terminal gate result" };
      blockers.push({ id: `F-${gate.id}`, gateId: gate.id, status: "FAIL", message: result.summary });
    }
    result.id ??= gate.id; results.push(result);
    if (["FAIL", "BLOCKED"].includes(result.status)) terminal = result;
  }
  return { results, blockers, status: results.some((r) => r.status === "FAIL") ? "FAILED" : results.some((r) => r.status === "BLOCKED" || r.status === "SKIPPED") ? "BLOCKED" : "PASSED", humanApproval: "NOT_EVALUATED" };
}

function request(namespace, index, subtype) { const key = `${namespace}-${index}`; return { set: namespace.includes("known") ? "KNOWN" : "NO_RATE", subtype, bookingRef: key, amendmentSeq: 1, providerKey: `${key}:1`, identityHash: hash(`${key}:1`) }; }
function percentiles(values) { const sorted = [...values].sort((a, b) => a - b); const rank = (p) => sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)]; return { count: sorted.length, min: sorted[0], median: rank(.5), p95: rank(.95), p99: rank(.99), max: sorted.at(-1) }; }
function multiplyScaleTwo(value, quantity) { return formatCents(parseCents(value) * BigInt(quantity)); }
function parseCents(value) { const [whole, fraction] = value.split("."); return BigInt(whole) * 100n + BigInt(fraction); }
function formatCents(value) { return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`; }
function canonical(value) { return JSON.stringify(value, Object.keys(value).sort()); }
function hash(value) { return createHash("sha256").update(typeof value === "string" ? value : canonical(value)).digest("hex"); }
function blocked(message) { return { status: "BLOCKED", blockerId: `B-${hash(message).slice(0, 8)}`, message }; }
