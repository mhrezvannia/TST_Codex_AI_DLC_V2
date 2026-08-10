import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const QUERY_OPERATIONS = Object.freeze({ list: 50, detail: 50 });
const MUTATION_OPERATIONS = Object.freeze({
  create: 20,
  edit: 20,
  approve: 20,
  successor: 20,
  suspend: 20,
  expire: 20
});
const LEGACY_OPERATIONS = Object.freeze(["search", "detail", "activeLookup"]);

export function nearestRank(values, percentile) {
  if (!Array.isArray(values) || values.length === 0) throw new Error("sample set is empty");
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.max(0, Math.ceil(percentile * sorted.length) - 1)];
}

export function summarizeSamples(samples) {
  const elapsed = samples.map((sample) => sample.elapsedMs);
  return {
    count: elapsed.length,
    p50Ms: nearestRank(elapsed, 0.50),
    p95Ms: nearestRank(elapsed, 0.95),
    p99Ms: nearestRank(elapsed, 0.99),
    maxMs: Math.max(...elapsed)
  };
}

export function evaluateU03Performance(evidence) {
  const failures = [];
  if (evidence?.status !== "measured") failures.push("measured live evidence is required");
  if (evidence?.concurrency !== 10) failures.push("concurrency must be exactly 10");
  if (evidence?.warmupsPerOperation !== 20) failures.push("each operation requires 20 discarded warm-ups");
  if (evidence?.cycles !== 3 || evidence?.quiescenceSeconds !== 60) {
    failures.push("three cycles with 60-second quiescence are required");
  }
  const fixture = evidence?.fixture ?? {};
  if (fixture.agreements < 10_000 || fixture.versions < 50_000 || fixture.links !== 150_000) {
    failures.push("fixture cardinality is below the U03 contract");
  }
  for (const key of ["commit", "os", "cpu", "memoryBytes", "java", "postgresql", "kafka"]) {
    if (evidence?.environment?.[key] === undefined) failures.push(`environment.${key} is required`);
  }

  const samples = Array.isArray(evidence?.samples) ? evidence.samples : [];
  for (const sample of samples) {
    if (!Number.isFinite(sample.elapsedMs) || sample.elapsedMs < 0
      || !Number.isFinite(sample.startedMonotonicMs)
      || !Number.isFinite(sample.endedMonotonicMs)
      || sample.endedMonotonicMs < sample.startedMonotonicMs
      || !sample.correlationId || !sample.expectedClassification) {
      failures.push("raw sample shape is invalid");
      break;
    }
  }
  for (const [operation, count] of Object.entries({ ...QUERY_OPERATIONS, ...MUTATION_OPERATIONS })) {
    const operationSamples = samples.filter((sample) =>
      sample.classification === "healthy" && sample.operation === operation);
    if (operationSamples.length !== count * 3) {
      failures.push(`${operation}: expected ${count * 3} healthy samples across three cycles`);
      continue;
    }
    if (operationSamples.some((sample) => sample.outcome !== "expected")) {
      failures.push(`${operation}: unexpected outcome retained in healthy samples`);
    }
    const limit = operation in QUERY_OPERATIONS ? 750 : 1_000;
    if (nearestRank(operationSamples.map((sample) => sample.elapsedMs), 0.95) > limit) {
      failures.push(`${operation}: p95 exceeds ${limit} ms`);
    }
  }
  const legacySamples = samples.filter((sample) => sample.media === "legacy-default");
  if (legacySamples.length !== 300
    || LEGACY_OPERATIONS.some((operation) =>
      !legacySamples.some((sample) => sample.operation === operation))
    || legacySamples.some((sample) => sample.outcome !== "expected")) {
    failures.push("legacy fixed mix must contain 100 expected samples per cycle across all operations");
  }
  const dependencyFaults = samples.filter((sample) => sample.classification === "dependency-fault");
  if (dependencyFaults.length === 0 || dependencyFaults.some((sample) => sample.elapsedMs > 2_000)) {
    failures.push("dependency faults require separate bounded samples <=2000 ms");
  }
  const domainFailures = samples.filter((sample) => sample.classification === "domain-failure");
  if (domainFailures.length === 0) failures.push("domain failures require separate samples");

  const concurrency = evidence?.contention ?? {};
  if (concurrency.rounds !== 20 || !concurrency.oneWinnerPerRound
    || !concurrency.noLoserSideEffects || !concurrency.independentKeysConcurrent) {
    failures.push("contention proof is incomplete");
  }
  const database = evidence?.database ?? {};
  if (!database.pageSizeBounded || !database.queryPlansCaptured || database.nPlusOneDetected
    || database.poolAcquisitionTimeouts > 0 || database.deadlocks > 0) {
    failures.push("bounded-query/pool evidence failed");
  }
  if (!Array.isArray(evidence?.resourceCycles) || evidence.resourceCycles.length !== 3) {
    failures.push("three resource cycles are required");
  }
  return failures;
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const output = valueAfter(argv, "--evidence");
  const input = valueAfter(argv, "--input") ?? process.env.U03_PERFORMANCE_INPUT;
  if (!input || !existsSync(input)) {
    const blocked = {
      status: "blocked",
      generatedAt: new Date().toISOString(),
      reason: "Measured isolated-stack input is required; synthetic performance evidence is forbidden."
    };
    if (output) {
      mkdirSync(dirname(resolve(output)), { recursive: true });
      writeFileSync(resolve(output), `${JSON.stringify(blocked, null, 2)}\n`);
    }
    console.error(blocked.reason);
    process.exit(2);
  }
  const evidence = JSON.parse(readFileSync(input, "utf8"));
  const failures = evaluateU03Performance(evidence);
  const result = { ...evidence, validation: { status: failures.length ? "failed" : "passed", failures } };
  if (output) {
    mkdirSync(dirname(resolve(output)), { recursive: true });
    writeFileSync(resolve(output), `${JSON.stringify(result, null, 2)}\n`);
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("U03 measured Agreement performance evidence: PASS");
}
