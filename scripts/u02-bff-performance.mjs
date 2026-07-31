import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function nearestRank(values, percentile) {
  if (!values.length) throw new Error("sample set is empty");
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(percentile * sorted.length) - 1)];
}

export function evaluateU02Performance(evidence) {
  const failures = [];
  for (const route of evidence.routes ?? []) {
    if (route.warmups !== 20 || route.overheadMs?.length !== 100) {
      failures.push(`${route.id}: requires 20 warm-ups and 100 measured calls`);
      continue;
    }
    if (nearestRank(route.overheadMs, 0.95) > 100) failures.push(`${route.id}: p95 exceeds 100 ms`);
    if (nearestRank(route.overheadMs, 0.99) > 200) failures.push(`${route.id}: p99 exceeds 200 ms`);
    if (!route.parentChildCorrelationValid) failures.push(`${route.id}: correlation invalid`);
  }
  const resource = evidence.resource ?? {};
  if (resource.bytesPerAdmission > 24 * 1024 * 1024) failures.push("admission memory exceeds 24 MiB");
  if (resource.heapUsed > 432 * 1024 * 1024) failures.push("heapUsed exceeds 432 MiB");
  if (resource.external > 48 * 1024 * 1024) failures.push("external exceeds 48 MiB");
  if (resource.rssMinusHeapExternal > 64 * 1024 * 1024) failures.push("native RSS exceeds 64 MiB");
  if (resource.rss > 544 * 1024 * 1024) failures.push("RSS exceeds 544 MiB");
  if (resource.oldSpaceHeadroom < 80 * 1024 * 1024) failures.push("old-space headroom below 80 MiB");
  if (resource.retainedAdmissions !== 0) failures.push("retained admissions detected");
  if (resource.socketsAfterQuiescence > resource.idleSockets + 2) failures.push("socket quiescence failed");
  if (evidence.normalClients !== 10 || evidence.adversarialAdmissions !== 20
    || evidence.quiescenceSeconds !== 60) failures.push("load shape or quiescence interval invalid");
  return failures;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputFlag = process.argv.indexOf("--input");
  const input = inputFlag >= 0 ? process.argv[inputFlag + 1] : undefined;
  if (!input || !existsSync(input)) {
    console.error("U02 performance evidence is required; synthetic data is not accepted");
    process.exit(2);
  }
  const failures = evaluateU02Performance(JSON.parse(readFileSync(input, "utf8")));
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("U02 measured BFF performance evidence: PASS");
}
