import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const DEFAULT_TIMEOUT_MS = 30_000;
const API_P95_LIMIT_MS = 2_000;
const API_MAX_LIMIT_MS = 5_000;

export async function runW204Acceptance(options) {
  const bookingId = required(options.bookingId ?? process.env.W2_04_BOOKING_ID, "bookingId");
  const containerId = options.containerId ?? "MSCU6639870";
  const actor = options.actor ?? "local.booking.user";
  const cmmUrl = trim(options.cmmUrl ?? process.env.CONTAINER_MOVEMENT_SERVICE_URL ?? "http://127.0.0.1:18086");
  const bookingUrl = trim(options.bookingUrl ?? process.env.BOOKING_SERVICE_URL ?? "http://127.0.0.1:18085");
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const correlationPrefix = options.correlationPrefix ?? `w2-04-${Date.now()}`;
  const bookingHeaders = {
    "x-linercore-service-id": options.bookingServiceId ?? "booking-bff",
    "x-linercore-service-token": options.bookingServiceToken ?? process.env.BOOKING_SERVICE_TOKEN ?? "booking_local_service_token",
    "x-linercore-actor-id": actor
  };
  const timings = [];

  const journey = await pollJson(
    `${cmmUrl}/api/container-movement/bookings/${encodeURIComponent(bookingId)}/journey?actor=${encodeURIComponent(actor)}`,
    { headers: { "x-correlation-id": `${correlationPrefix}-journey` } },
    timeoutMs,
    (value) => value?.id && value?.bookingId === bookingId
  );
  assertExpectedMoves(journey);

  const wrongNext = await timedJson(
    `${cmmUrl}/api/container-movement/journeys/${encodeURIComponent(journey.id)}/movements`,
    movementRequest("ACT_DISC", containerId, "NLRTM", actor, `${correlationPrefix}-wrong-next`),
    timings,
    409
  );
  assert(wrongNext.body?.code === "OUT_OF_SEQUENCE_MOVEMENT", "wrong-next response must be OUT_OF_SEQUENCE_MOVEMENT");

  const accepted = [];
  for (const [eventType, locationId] of [
    ["GTOT", "USNYC"],
    ["ACT_LOAD", "USNYC"],
    ["ACT_DISC", "NLRTM"],
    ["ACT_GTIN", "NLRTM"]
  ]) {
    const result = await timedJson(
      `${cmmUrl}/api/container-movement/journeys/${encodeURIComponent(journey.id)}/movements`,
      movementRequest(eventType, containerId, locationId, actor, `${correlationPrefix}-${eventType.toLowerCase()}`),
      timings,
      200
    );
    accepted.push({ eventType, status: result.body.status, historyCount: result.body.history?.length ?? 0 });
  }

  const duplicate = await timedJson(
    `${cmmUrl}/api/container-movement/journeys/${encodeURIComponent(journey.id)}/movements`,
    movementRequest("GTOT", containerId, "USNYC", actor, `${correlationPrefix}-duplicate`),
    timings,
    409
  );
  assert(duplicate.body?.code === "DUPLICATE_MOVEMENT", "duplicate response must be DUPLICATE_MOVEMENT");

  const finalJourney = await pollJson(
    `${cmmUrl}/api/container-movement/journeys/${encodeURIComponent(journey.id)}?actor=${encodeURIComponent(actor)}`,
    { headers: { "x-correlation-id": `${correlationPrefix}-final-journey` } },
    timeoutMs,
    (value) => value?.status === "RETURNED_EMPTY" && value?.history?.length === 4
  );
  const bookingProjection = await pollJson(
    `${bookingUrl}/api/bookings/${encodeURIComponent(bookingId)}`,
    { headers: { ...bookingHeaders, "x-correlation-id": `${correlationPrefix}-booking-projection` } },
    timeoutMs,
    (value) => value?.movementStatuses?.some((status) =>
      status.containerRef === containerId
      && status.derivedStatus === "RETURNED_EMPTY"
      && status.moveCode === "GTIN")
  );

  const summary = summarizeTimings(timings);
  assert(summary.p95Ms <= API_P95_LIMIT_MS, `API p95 ${summary.p95Ms}ms exceeds ${API_P95_LIMIT_MS}ms`);
  assert(summary.maxMs <= API_MAX_LIMIT_MS, `API max ${summary.maxMs}ms exceeds ${API_MAX_LIMIT_MS}ms`);
  const evidence = {
    schemaVersion: 1,
    intent: "W2-04-container-journey-track-trace",
    generatedAt: new Date().toISOString(),
    decision: "PASS",
    stack: "linercore-wave-a",
    bookingId,
    journeyId: journey.id,
    containerId,
    expectedMovements: journey.expectedMovements,
    wrongNext: wrongNext.body,
    accepted,
    duplicate: duplicate.body,
    finalStatus: finalJourney.status,
    history: finalJourney.history,
    bookingProjection: bookingProjection.movementStatuses.find((status) => status.containerRef === containerId),
    performance: {
      thresholds: { p95Ms: API_P95_LIMIT_MS, maxMs: API_MAX_LIMIT_MS, propagationMs: timeoutMs },
      ...summary
    },
    preservation: { managerDemoMutated: false, historicalW1Result: "BLOCKED_WAIVED" }
  };
  if (options.evidenceFile) {
    const output = resolve(options.evidenceFile);
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  }
  return evidence;
}

function movementRequest(eventType, containerId, locationId, actor, key) {
  return {
    method: "POST",
    headers: { "content-type": "application/json", "x-correlation-id": key },
    body: JSON.stringify({
      eventType,
      containerId,
      locationId,
      eventTime: new Date().toISOString(),
      actorSubjectId: actor,
      idempotencyKey: key,
      correlationId: key
    })
  };
}

async function timedJson(url, init, timings, expectedStatus) {
  const started = performance.now();
  const response = await fetch(url, init);
  const durationMs = Math.round((performance.now() - started) * 100) / 100;
  const body = await response.json().catch(() => null);
  timings.push({ method: init.method ?? "GET", url: new URL(url).pathname, status: response.status, durationMs });
  assert(response.status === expectedStatus, `${init.method ?? "GET"} ${url} expected ${expectedStatus}, got ${response.status}: ${JSON.stringify(body)}`);
  return { response, body, durationMs };
}

async function pollJson(url, init, timeoutMs, predicate) {
  const deadline = performance.now() + timeoutMs;
  let last;
  while (performance.now() < deadline) {
    const response = await fetch(url, init);
    last = await response.json().catch(() => null);
    if (response.ok && predicate(last)) return last;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }
  throw new Error(`Timed out after ${timeoutMs}ms polling ${url}; last=${JSON.stringify(last)}`);
}

function assertExpectedMoves(journey) {
  const moves = journey.expectedMovements ?? [];
  assert(moves.some((move) => move.moveCode === "LOAD" && move.locationId === "USNYC"), "expected LOAD@USNYC");
  assert(moves.some((move) => move.moveCode === "DISC" && move.locationId === "NLRTM"), "expected DISC@NLRTM");
}

function summarizeTimings(timings) {
  const values = timings.map((entry) => entry.durationMs).sort((a, b) => a - b);
  const rank = Math.max(0, Math.ceil(values.length * 0.95) - 1);
  return {
    sampleCount: values.length,
    p50Ms: values[Math.max(0, Math.ceil(values.length * 0.5) - 1)] ?? 0,
    p95Ms: values[rank] ?? 0,
    maxMs: values.at(-1) ?? 0,
    samples: timings
  };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--booking-id") options.bookingId = argv[++index];
    else if (arg === "--container-id") options.containerId = argv[++index];
    else if (arg === "--actor") options.actor = argv[++index];
    else if (arg === "--cmm-url") options.cmmUrl = argv[++index];
    else if (arg === "--booking-url") options.bookingUrl = argv[++index];
    else if (arg === "--evidence-file") options.evidenceFile = argv[++index];
    else if (arg === "--timeout-ms") options.timeoutMs = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function required(value, name) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function trim(value) {
  return value.replace(/\/+$/, "");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const evidence = await runW204Acceptance(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ status: "ok", decision: evidence.decision, evidenceFile: parseArgs(process.argv.slice(2)).evidenceFile ?? null }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
