import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { performanceRequests, validatePerformanceSamples, validateResourceCycles } from "../tools/u06/live-gates.mjs";
import { readSignedCookie } from "../tools/u06/readiness-observer.mjs";

const EDGE = "http://127.0.0.1:18088";
const root = path.resolve(".");
const storageState = valueAfter(process.argv, "--storage-state");
if (!storageState) throw new Error("--storage-state is required");
const cookie = readSignedCookie(root, storageState, new Date());
const cookieHeader = `${cookie.name}=${cookie.value}`;
const runId = `u06-perf-${Date.now()}`;
const plan = performanceRequests(runId);
const priced = new Map();
const samples = [];
const cycles = [];

await concurrent(plan.fresh, plan.concurrency, async (request, index) => {
  const date = request.set === "KNOWN" ? (index < 50 ? "2026-08-01" : "2026-09-01") : "2026-08-02";
  const equipment = request.set === "KNOWN" ? "22G1" : "42G1";
  const correlationId = `${runId}-${request.set.toLowerCase()}-${index}`;
  const booking = await command("/api/bookings", bookingBody(date, equipment), `${request.providerKey}:create`, correlationId, 201);
  await command(`/api/bookings/${booking.body.id}/validate`, {}, `${request.providerKey}:validate`, correlationId, 200);
  priced.set(request.providerKey, { bookingId: booking.body.id, correlationId, key: `${request.providerKey}:price` });
});

for (const set of ["KNOWN", "NO_RATE"]) {
  const requests = plan.fresh.filter((request) => request.set === set);
  await concurrent(requests, plan.concurrency, async (request) => {
    const target = priced.get(request.providerKey);
    const started = performance.now();
    const response = await command(`/api/bookings/${target.bookingId}/price`, {}, target.key, target.correlationId,
      set === "KNOWN" ? 200 : 422);
    const elapsedMs = performance.now() - started;
    const outcome = response.body?.result?.outcome;
    const success = set === "KNOWN" ? outcome === "PRICED" : outcome === "MANUAL_PRICING_REQUIRED";
    const receiptId = response.body?.result?.pricingRequestId;
    if (!success || !receiptId) throw new Error(`${set} pricing observation mismatch`);
    samples.push({ ...request, elapsedMs, receiptId, success, replayed: false, status: response.status });
  });
  cycles.push(await resourceCycle(cycles.length + 1));
}

await concurrent(plan.replay, plan.concurrency, async (request) => {
  const target = priced.get(request.providerKey);
  const started = performance.now();
  const response = await command(`/api/bookings/${target.bookingId}/price`, {}, target.key, target.correlationId, 200);
  const elapsedMs = performance.now() - started;
  if (response.body?.result?.outcome !== "PRICED" || !response.body?.result?.pricingRequestId) {
    throw new Error("replay pricing observation mismatch");
  }
  samples.push({ ...request, elapsedMs, receiptId: response.body.result.pricingRequestId, success: true, replayed: true,
    status: response.status });
});
cycles.push(await resourceCycle(3));

const percentiles = validatePerformanceSamples(samples);
if (validateResourceCycles(cycles) !== "PASS") throw new Error("resource cycle bounds failed");
const envelope = { schemaVersion: 1, stage: "performance", observedAt: new Date().toISOString(),
  proof: { concurrency: plan.concurrency, percentiles, samples, cycles } };
const output = path.resolve("artifacts/u06/observations/performance.json");
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ status: "PASS", percentiles, cycles }, null, 2)}\n`);

async function command(pathname, body, idempotencyKey, correlationId, expectedStatus) {
  const response = await fetch(`${EDGE}${pathname}`, { method: "POST", headers: { cookie: cookieHeader, origin: EDGE,
    "content-type": "application/json", "idempotency-key": safe(idempotencyKey), "x-correlation-id": correlationId },
    body: JSON.stringify(body) });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (response.status !== expectedStatus) {
    throw new Error(`${pathname} returned ${response.status}, expected ${expectedStatus}: ${text.slice(0, 300)}`);
  }
  return { status: response.status, body: parsed };
}

function bookingBody(date, equipmentTypeCode) {
  return { customerId: "LOCAL-CARRIER",
    routing: [{ legSequence: 1, loadUnLocode: "USNYC", dischargeUnLocode: "NLRTM", voyageId: "LC001E" }],
    equipment: [{ equipmentTypeCode, quantity: 1, equipmentId: "MSCU6639870" }],
    currency: "USD", cargoMode: "FCL_DRY", reefer: false, dangerousGoods: false,
    attributes: { tradeLaneId: "trade-lane-na-eu", commodityCode: "GEN", requestedDepartureDate: date } };
}

async function resourceCycle(cycle) {
  const [booking, charge] = await Promise.all([
    fetch("http://127.0.0.1:18085/actuator/prometheus").then((response) => response.text()),
    fetch("http://127.0.0.1:18084/actuator/prometheus").then((response) => response.text())
  ]);
  const heap = metricSum(booking, "jvm_memory_used_bytes", 'area="heap"') + metricSum(charge, "jvm_memory_used_bytes", 'area="heap"');
  const stats = wave(["stats", "--no-stream", "--format", "{{.Name}}|{{.MemUsage}}"]);
  const rss = stats.split(/\r?\n/)
    .filter((line) => /-(?:booking-service|charge-agreement-service)-1\|/.test(line))
    .reduce((sum, line) => sum + memoryBytes(line.split("|")[1]?.split("/")[0]?.trim()), 0);
  if (!(heap > 0) || !(rss > 0)) throw new Error("resource metrics unavailable");
  const logs = wave(["logs", "--tail", "400", "booking-service", "charge-agreement-service"]);
  return { cycle, heap, rss, oom: /outofmemory/i.test(logs), deadlock: /deadlock/i.test(logs),
    poolTimeout: /pool.{0,20}timeout/i.test(logs), nPlusOne: /n\+1/i.test(logs), spill: /temp(?:orary)? file|disk spill/i.test(logs) };
}

function metricSum(text, name, requiredLabel) {
  return text.split(/\r?\n/).filter((line) => line.startsWith(name) && (!requiredLabel || line.includes(requiredLabel)))
    .reduce((sum, line) => sum + Number(line.trim().split(/\s+/).at(-1)), 0);
}

function memoryBytes(value = "") {
  const match = /^(\d+(?:\.\d+)?)([KMG]iB)$/.exec(value);
  if (!match) return 0;
  const scale = { KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3 }[match[2]];
  return Number(match[1]) * scale;
}

async function concurrent(items, concurrency, task) {
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await task(items[index], index);
    }
  }));
}

function wave(args) {
  const result = spawnSync(process.execPath, ["scripts/wave-a-compose.mjs", ...args], { cwd: root, encoding: "utf8",
    windowsHide: true, timeout: 120_000 });
  if (result.status !== 0) throw new Error(`Wave A command failed: ${result.stderr || result.stdout}`);
  return `${result.stdout}\n${result.stderr}`;
}

function safe(value) { return value.toLowerCase().replace(/[^a-z0-9._:-]/g, "-").slice(0, 120); }
function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }
