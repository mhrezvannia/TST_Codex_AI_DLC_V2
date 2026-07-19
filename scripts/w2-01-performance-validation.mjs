import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const metricDefinitions = [
  { key: "bookingReadMs", targetMs: 3000, requirement: "U01 authenticated Booking read p95" },
  { key: "createMs", targetMs: 5000, requirement: "U02 Booking create p95" },
  { key: "detailMs", targetMs: 3000, requirement: "U02 created Booking detail p95" },
  { key: "denyMs", targetMs: 3000, requirement: "U03 authenticated deny render p95" },
  { key: "signOutMs", targetMs: 3000, requirement: "U04 sign-out p95" },
  { key: "postSignOutGuardMs", targetMs: 3000, requirement: "U04 protected-route reauth p95" },
  { key: "staleCallMs", targetMs: 1000, requirement: "U04 stale BFF fail-closed p95" },
  { key: "compatibilityListMs", targetMs: 1000, requirement: "U05 /bookings redirect p95" },
  { key: "compatibilityNewMs", targetMs: 1000, requirement: "U05 /bookings/new redirect p95" },
  { key: "compatibilityDetailMs", targetMs: 1000, requirement: "U05 /bookings/{id} redirect p95" }
];

export function nearestRankPercentile(samples, percentile) {
  if (samples.length === 0) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(percentile * sorted.length) - 1)];
}

export function summarizeMetric(definition, samples, expectedSamples) {
  const p50Ms = nearestRankPercentile(samples, 0.5);
  const p95Ms = nearestRankPercentile(samples, 0.95);
  const maxMs = samples.length === 0 ? null : Math.max(...samples);
  const status = samples.length === expectedSamples && p95Ms <= definition.targetMs ? "PASS" : "BLOCKED";
  return { ...definition, samples: samples.length, p50Ms, p95Ms, maxMs, status };
}

export function extractTimings(evidence) {
  const scenarios = new Map((evidence.scenarios ?? []).map((scenario) => [scenario.scenarioId, scenario]));
  const allowed = scenarios.get("allow-booking-create-detail")?.timings ?? {};
  const denied = scenarios.get("deny-booking-access")?.timings ?? {};
  const signOut = scenarios.get("sign-out-reauth-stale-call")?.timings ?? evidence.signOut?.timings ?? {};
  const compatibility = new Map((evidence.compatibility ?? []).map((row) => [row.legacyPath, row.durationMs]));
  const detailRow = (evidence.compatibility ?? []).find((row) => row.legacyPath !== "/bookings/new" && /^\/bookings\/[^/]+$/.test(row.legacyPath));
  return {
    bookingReadMs: allowed.bookingReadMs,
    createMs: allowed.createMs,
    detailMs: allowed.detailMs,
    denyMs: denied.denyMs,
    signOutMs: signOut.signOutMs,
    postSignOutGuardMs: signOut.postSignOutGuardMs,
    staleCallMs: signOut.staleCallMs,
    compatibilityListMs: compatibility.get("/bookings"),
    compatibilityNewMs: compatibility.get("/bookings/new"),
    compatibilityDetailMs: detailRow?.durationMs
  };
}

export function runPerformanceValidation(options = {}) {
  const outputRoot = resolve(options.outputRoot ?? "artifacts/w2-01-performance");
  const iterations = Number(options.iterations ?? 10);
  const composeProject = options.composeProject ?? process.env.W2_01_COMPOSE_PROJECT ?? "linercore-w2-01";
  if (!Number.isInteger(iterations) || iterations < 1) throw new Error("iterations must be a positive integer");
  mkdirSync(outputRoot, { recursive: true });

  const samples = Object.fromEntries(metricDefinitions.map(({ key }) => [key, []]));
  const runs = [];
  for (let index = 1; index <= iterations; index++) {
    const runId = String(index).padStart(2, "0");
    const runRoot = join(outputRoot, `run-${runId}`);
    mkdirSync(runRoot, { recursive: true });
    const started = performance.now();
    const result = spawnSync(process.execPath, [
      resolve("scripts/w2-01-live-browser.mjs"),
      "--output-root", runRoot,
      "--compose-project", composeProject
    ], { encoding: "utf8", timeout: 240_000 });
    const durationMs = Math.round((performance.now() - started) * 100) / 100;
    let evidence = null;
    try {
      evidence = JSON.parse(readFileSync(join(runRoot, "browser-evidence.json"), "utf8"));
    } catch (error) {
      runs.push({ run: index, status: "BLOCKED", durationMs, error: error.message });
      continue;
    }
    const timings = extractTimings(evidence);
    for (const { key } of metricDefinitions) {
      if (Number.isFinite(timings[key])) samples[key].push(timings[key]);
    }
    const scenarioPass = ["allow-booking-create-detail", "deny-booking-access", "sign-out-reauth-stale-call", "legacy-bookings-compatibility"]
      .every((scenarioId) => evidence.scenarios?.some((scenario) => scenario.scenarioId === scenarioId && scenario.status === "PASS"));
    runs.push({
      run: index,
      status: result.status === 0 && scenarioPass && evidence.errors?.length === 0 ? "PASS" : "BLOCKED",
      durationMs,
      timings,
      evidence: `run-${runId}/browser-evidence.json`,
      error: result.status === 0 ? undefined : (result.stderr || result.stdout || result.error?.message || "browser driver failed").trim().slice(0, 1000)
    });
  }

  const metrics = metricDefinitions.map((definition) => summarizeMetric(definition, samples[definition.key], iterations));
  const passedRuns = runs.filter((run) => run.status === "PASS").length;
  const status = passedRuns === iterations && metrics.every((metric) => metric.status === "PASS") ? "PASS" : "BLOCKED";
  const summary = {
    generatedAt: new Date().toISOString(),
    scope: "single-user sequential warm local proof",
    iterations,
    passedRuns,
    completionRate: passedRuns / iterations,
    throughputClaim: "observed full-journey completion rate only; no acceptance target",
    status,
    metrics,
    fullJourney: {
      p50Ms: nearestRankPercentile(runs.map((run) => run.durationMs), 0.5),
      p95Ms: nearestRankPercentile(runs.map((run) => run.durationMs), 0.95),
      maxMs: Math.max(...runs.map((run) => run.durationMs))
    },
    runs
  };
  writeFileSync(join(outputRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const summary = runPerformanceValidation({
    outputRoot: valueAfter(argv, "--output-root"),
    iterations: valueAfter(argv, "--iterations"),
    composeProject: valueAfter(argv, "--compose-project")
  });
  console.log(JSON.stringify({ status: summary.status, iterations: summary.iterations, passedRuns: summary.passedRuns, evidence: resolve(valueAfter(argv, "--output-root") ?? "artifacts/w2-01-performance", "summary.json") }, null, 2));
  process.exit(summary.status === "PASS" ? 0 : 1);
}
