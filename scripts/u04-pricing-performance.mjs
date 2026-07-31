import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FRESH_PATHS = Object.freeze([
  "agreement",
  "tariff",
  "no-rate",
  "ambiguous-agreement",
  "ambiguous-base",
  "ambiguous-surcharge",
  "ambiguous-local"
]);

export function nearestRank(values, percentile) {
  if (!Array.isArray(values) || values.length === 0) throw new Error("sample set is empty");
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.max(0, Math.ceil(percentile * sorted.length) - 1)];
}

export function evaluateU04Performance(evidence) {
  const failures = [];
  if (evidence?.status !== "measured") failures.push("measured retained raw evidence is required");
  if (evidence?.clients !== 10) failures.push("client concurrency must be exactly 10");
  if (evidence?.warmupsPerPath !== 20) failures.push("each fresh path requires 20 discarded warm-ups");
  if ((evidence?.fixture?.manualCases ?? 0) < 10_000) {
    failures.push("manual evidence fixture must contain at least 10000 OPEN cases");
  }
  for (const key of ["commit", "os", "cpu", "memoryBytes", "java", "postgresql"]) {
    if (evidence?.environment?.[key] === undefined) failures.push(`environment.${key} is required`);
  }

  const fresh = Array.isArray(evidence?.freshSamples) ? evidence.freshSamples : [];
  if (!validSamples(fresh)) failures.push("fresh raw sample shape is invalid");
  for (const path of FRESH_PATHS) {
    const samples = fresh.filter((sample) => sample.path === path);
    if (samples.length < 100) {
      failures.push(`${path}: at least 100 fresh samples are required`);
      continue;
    }
    if (samples.some((sample) => sample.outcome !== "expected")) {
      failures.push(`${path}: unexpected terminal outcome`);
    }
    if (nearestRank(samples.map((sample) => sample.elapsedMs), 0.99) > 800) {
      failures.push(`${path}: p99 exceeds 800 ms`);
    }
  }

  const replays = Array.isArray(evidence?.replays) ? evidence.replays : [];
  for (const status of [200, 404, 422]) {
    const samples = replays.filter((sample) => sample.status === status);
    if (samples.length !== 25 || samples.some((sample) =>
      !sample.byteIdentical || sample.resolverReads !== 0 || sample.caseWrites !== 0)) {
      failures.push(`${status}: requires 25 exact replays with zero resolver reads/case writes`);
    }
  }

  const manual = Array.isArray(evidence?.manualSamples) ? evidence.manualSamples : [];
  if (!validSamples(manual)) failures.push("manual raw sample shape is invalid");
  for (const operation of ["list", "detail"]) {
    const samples = manual.filter((sample) => sample.operation === operation);
    if (samples.length < 100) {
      failures.push(`${operation}: at least 100 manual samples are required`);
    } else if (nearestRank(samples.map((sample) => sample.elapsedMs), 0.95) > 750) {
      failures.push(`${operation}: p95 exceeds 750 ms`);
    }
  }

  const plans = Array.isArray(evidence?.queryPlans) ? evidence.queryPlans : [];
  for (const operation of ["list", "detail"]) {
    const plan = plans.find((candidate) => candidate.operation === operation);
    if (!plan?.captured || plan.spilled || plan.workMemKiB !== 4096 || !plan.rawPlan) {
      failures.push(`${operation}: retained 4 MiB no-spill query plan is required`);
    }
  }

  const cycles = Array.isArray(evidence?.postGcResourceCycles)
    ? evidence.postGcResourceCycles : [];
  if (cycles.length !== 3 || cycles.some((cycle) =>
    !Number.isFinite(cycle.heapBytes) || !Number.isFinite(cycle.rssBytes))) {
    failures.push("three post-GC heap/RSS cycles are required");
  } else if (cycles[2].heapBytes > cycles[0].heapBytes || cycles[2].rssBytes > cycles[0].rssBytes) {
    failures.push("post-GC heap/RSS must show no three-cycle growth");
  }
  return failures;
}

function validSamples(samples) {
  return samples.every((sample) =>
    Number.isFinite(sample.startedMonotonicMs)
    && Number.isFinite(sample.endedMonotonicMs)
    && sample.endedMonotonicMs >= sample.startedMonotonicMs
    && Number.isFinite(sample.elapsedMs)
    && sample.elapsedMs >= 0
    && typeof sample.correlationId === "string"
    && sample.correlationId.length > 0);
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const input = valueAfter(argv, "--input") ?? process.env.U04_PERFORMANCE_INPUT;
  const output = valueAfter(argv, "--evidence");
  if (!input || !existsSync(input)) {
    const blocked = {
      status: "blocked",
      generatedAt: new Date().toISOString(),
      reason: "U06 isolated-stack measured input is required; synthetic U04 performance evidence is forbidden."
    };
    if (output) {
      mkdirSync(dirname(resolve(output)), { recursive: true });
      writeFileSync(resolve(output), `${JSON.stringify(blocked, null, 2)}\n`);
    }
    console.error(blocked.reason);
    process.exit(2);
  }
  const evidence = JSON.parse(readFileSync(resolve(input), "utf8"));
  const failures = evaluateU04Performance(evidence);
  const result = { ...evidence, validation: {
    status: failures.length ? "failed" : "passed", failures
  } };
  if (output) {
    mkdirSync(dirname(resolve(output)), { recursive: true });
    writeFileSync(resolve(output), `${JSON.stringify(result, null, 2)}\n`);
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("U04 measured pricing performance evidence: PASS");
}
