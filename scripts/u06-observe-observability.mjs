import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import registry from "../tests/u06/acceptance-registry.json" with { type: "json" };
import { validateObservability } from "../tools/u06/live-gates.mjs";
import { readSignedCookie } from "../tools/u06/readiness-observer.mjs";

const root = path.resolve(".");
const EDGE = "http://127.0.0.1:18088";
const storageState = valueAfter(process.argv, "--storage-state");
if (!storageState) throw new Error("--storage-state is required");
const cookie = readSignedCookie(root, storageState, new Date());
const cookieHeader = `${cookie.name}=${cookie.value}`;
const runId = `u06-obs-${Date.now()}`;
const knownCorrelation = `${runId}-known`;
const manualCorrelation = `${runId}-manual`;
const before = await metrics();

const known = await createValidated("2026-08-01", "22G1", knownCorrelation, `${runId}-known`);
const knownResult = await price(known, `${runId}-known-price`, knownCorrelation, 200);
const replayResult = await price(known, `${runId}-known-price`, knownCorrelation, 200);
const manual = await createValidated("2026-08-02", "42G1", manualCorrelation, `${runId}-manual`);
const manualResult = await price(manual, `${runId}-manual-price`, manualCorrelation, 422);
const observedCorrelations = {
  known: knownResult.__observedCorrelationId,
  replay: replayResult.__observedCorrelationId,
  manual: manualResult.__observedCorrelationId
};

const after = await metrics();
const logs = wave(["logs", "--tail", "250", "booking-service", "charge-agreement-service"]);
const relevantLogs = logs.split(/\r?\n/).filter((line) => line.includes("pricing_terminal"));
const metricText = `${after.booking}\n${after.charge}`;
const metricLines = metricText.split(/\r?\n/).filter((line) => /(?:booking_pricing_operation|linercore_charge_pricing_operation)_seconds_count/.test(line));
const redactionHits = /(?:authorization|cookie|lc_session|password|service[-_ ]?token|owner[-_ ]?token)/i.test(relevantLogs.join("\n"));
const highCardinality = metricLines.some((line) => {
  const labels = /\{([^}]*)\}/.exec(line)?.[1] ?? "";
  return /correlation|booking|customer|party|request[_-]?id|version[_-]?id|idempotency/i.test(labels);
});
const moneyInLabels = metricLines.some((line) => /\{[^}]*\b\d+\.\d{2}\b[^}]*\}/.test(line));

const deltas = {
  LATENCY: delta(before, after, () => true),
  TERMINAL_OUTCOME: delta(before, after, (line) => line.includes('outcome="PRICED"')),
  BASIS: delta(before, after, (line) => line.includes('basis="AGREEMENT"')),
  MANUAL_FALLBACK: delta(before, after, (line) => line.includes('outcome="MANUAL') || line.includes('outcome="MANUAL_PRICING_REQUIRED"')),
  REPLAY_CONFLICT: delta(before, after, (line) => line.includes('receipt="REPLAY"')),
  REDACTION: delta(before, after, () => true)
};

const members = registry.members.filter((member) => member.category === "OBSERVABILITY");
const results = members.map((member) => {
  const id = member.key.split(":")[1];
  const correlationId = id === "MANUAL_FALLBACK" || id === "REDACTION" ? observedCorrelations.manual
    : id === "REPLAY_CONFLICT" ? observedCorrelations.replay : observedCorrelations.known;
  const safeCorrelation = relevantLogs.some((line) => line.includes(correlationId));
  const observation = { id, status: "PASS", delta: deltas[id].delta, safeCorrelation,
    highCardinality, redactionHits, moneyInLabels };
  if (!(observation.delta > 0) || !safeCorrelation || highCardinality || redactionHits || moneyInLabels) {
    observation.status = "FAIL";
  }
  return { key: member.key, status: observation.status, scenario: id, correlationId, observation,
    artifactPayloads: {
      "metric-delta": { id, ...deltas[id], seriesCount: metricLines.length },
      "safe-log-hops": { id, correlationId, lines: relevantLogs.filter((line) => line.includes(correlationId)) },
      "redaction-report": { id, scannedLogLines: relevantLogs.length, scannedMetricLines: metricLines.length,
        redactionHits, highCardinality, moneyInLabels }
    } };
});

const observations = results.map((result) => result.observation);
if (validateObservability(observations) !== "PASS") {
  throw new Error(`observability matrix failed: ${JSON.stringify(observations)}`);
}
const envelope = { schemaVersion: 1, stage: "observability", observedAt: new Date().toISOString(), results };
const output = path.resolve("artifacts/u06/observations/observability.json");
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ status: "PASS", observations }, null, 2)}\n`);

async function createValidated(date, equipmentTypeCode, correlationId, key) {
  const created = await command("/api/bookings", { customerId: "LOCAL-CARRIER",
    routing: [{ legSequence: 1, loadUnLocode: "USNYC", dischargeUnLocode: "NLRTM", voyageId: "LC001E" }],
    equipment: [{ equipmentTypeCode, quantity: 1, equipmentId: "MSCU6639870" }], currency: "USD",
    cargoMode: "FCL_DRY", reefer: false, dangerousGoods: false,
    attributes: { tradeLaneId: "trade-lane-na-eu", commodityCode: "GEN", requestedDepartureDate: date } },
    `${key}-create`, correlationId, 201);
  await command(`/api/bookings/${created.id}/validate`, {}, `${key}-validate`, correlationId, 200);
  return created.id;
}

async function price(bookingId, key, correlationId, expectedStatus) {
  return command(`/api/bookings/${bookingId}/price`, {}, key, correlationId, expectedStatus);
}

async function command(pathname, body, idempotencyKey, correlationId, expectedStatus) {
  const response = await fetch(`${EDGE}${pathname}`, { method: "POST", headers: { cookie: cookieHeader, origin: EDGE,
    "content-type": "application/json", "idempotency-key": idempotencyKey, "x-correlation-id": correlationId },
    body: JSON.stringify(body) });
  const text = await response.text();
  if (response.status !== expectedStatus) throw new Error(`${pathname} returned ${response.status}: ${text.slice(0, 300)}`);
  const parsed = text ? JSON.parse(text) : {};
  parsed.__observedCorrelationId = response.headers.get("x-correlation-id")
    ?? parsed?.result?.correlationId ?? parsed?.correlationId ?? correlationId;
  return parsed;
}

async function metrics() {
  const [booking, charge] = await Promise.all([
    fetch("http://127.0.0.1:18085/actuator/prometheus").then(assertOk).then((response) => response.text()),
    fetch("http://127.0.0.1:18084/actuator/prometheus").then(assertOk).then((response) => response.text())
  ]);
  return { booking, charge };
}

function delta(before, after, predicate) {
  const prior = metricCount(`${before.booking}\n${before.charge}`, predicate);
  const current = metricCount(`${after.booking}\n${after.charge}`, predicate);
  return { before: prior, after: current, delta: current - prior };
}

function metricCount(text, predicate) {
  return text.split(/\r?\n/)
    .filter((line) => /(?:booking_pricing_operation|linercore_charge_pricing_operation)_seconds_count/.test(line) && predicate(line))
    .reduce((sum, line) => sum + Number(line.trim().split(/\s+/).at(-1)), 0);
}

function assertOk(response) { if (!response.ok) throw new Error(`metrics returned ${response.status}`); return response; }
function wave(args) {
  const result = spawnSync(process.execPath, ["scripts/wave-a-compose.mjs", ...args], { cwd: root, encoding: "utf8", windowsHide: true, timeout: 120_000 });
  if (result.status !== 0) throw new Error(`Wave A command failed: ${result.stderr || result.stdout}`);
  return `${result.stdout}\n${result.stderr}`;
}
function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }
