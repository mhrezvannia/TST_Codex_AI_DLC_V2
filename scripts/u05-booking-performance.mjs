export function percentile(values, ratio) {
  if (!Array.isArray(values) || values.length === 0) throw new Error("samples required");
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.max(0, Math.ceil(ordered.length * ratio) - 1)];
}

export function evaluateU05Performance(evidence) {
  const failures = [];
  if (evidence?.status !== "measured") failures.push("measured retained raw evidence is required");
  if (evidence?.clients !== 10) failures.push("exactly 10 clients are required");
  if (evidence?.warmups !== 20) failures.push("exactly 20 warm-ups are required");
  for (const operation of ["price", "reprice"]) {
    const samples = (evidence?.samples ?? []).filter((sample) => sample.operation === operation);
    if (samples.length < 100) failures.push(`${operation}: at least 100 samples required`);
    else if (percentile(samples.map((sample) => sample.elapsedMs), 0.99) > 800) {
      failures.push(`${operation}: p99 exceeds 800 ms`);
    }
  }
  const bounds = evidence?.resourceBounds ?? {};
  if (bounds.maxConnections !== 10 || bounds.maxPermits !== 10 || bounds.acquireMs !== 100
      || bounds.connectMs !== 500 || bounds.deadlineMs !== 2000 || bounds.maxResponseBytes !== 65536) {
    failures.push("HTTP resource bounds do not match U05 design");
  }
  const retry = evidence?.resilience ?? {};
  if (retry.maxAttempts !== 2 || retry.circuitWindow !== 5 || retry.minimumCalls !== 5
      || retry.failureThreshold !== 100 || retry.openWaitMs !== 30000 || retry.halfOpenPermits !== 1) {
    failures.push("retry/circuit evidence does not match U05 design");
  }
  const history = evidence?.history ?? {};
  if (!history.planCaptured || history.spilled || history.workMemKiB !== 4096 || !history.rawPlan) {
    failures.push("retained 4 MiB no-spill history plan is required");
  }
  const cycles = evidence?.postGcResourceCycles ?? [];
  if (cycles.length !== 3 || cycles[2]?.heapBytes > cycles[0]?.heapBytes
      || cycles[2]?.rssBytes > cycles[0]?.rssBytes) {
    failures.push("three non-growing post-GC heap/RSS cycles are required");
  }
  return failures;
}
