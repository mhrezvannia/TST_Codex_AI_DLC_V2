import { randomBytes } from "node:crypto";
import { statfsSync } from "node:fs";
import os from "node:os";

export const RESOURCE_LIMITS = Object.freeze({
  pricingWorkers: 10, browserWorkers: 4, writerQueue: 256, pendingFutures: 14,
  responseBytes: 1024 * 1024, commandLogBytes: 32 * 1024 * 1024,
  artifactBytes: 64 * 1024 * 1024, nonTraceLogBytes: 512 * 1024 * 1024,
  traceEntries: 2048, traceCompressedBytes: 64 * 1024 * 1024,
  traceExpandedBytes: 256 * 1024 * 1024, traceEntryBytes: 32 * 1024 * 1024,
  traceCompressionRatio: 20, rawTraceTempBytes: 512 * 1024 * 1024,
  runRootBytes: 2 * 1024 * 1024 * 1024, freeReserveBytes: 5 * 1024 * 1024 * 1024,
});

export function createRunId(now = new Date(), random = randomBytes) {
  const utc = now.toISOString().replace(/[-:]/g, "").replace("Z", "Z");
  return `${utc}-${random(4).toString("hex")}`;
}

export function captureProvenance({ cwd, git = {}, env = process.env, now = new Date() }) {
  const forbidden = Object.keys(env).filter((key) => /^(?:DEMO_COMPOSE_PROJECT|DEMO_EDGE_URL)$/.test(key));
  return {
    capturedAt: now.toISOString(), runId: createRunId(now), branch: git.branch ?? null,
    commit: git.commit ?? null, dirtySummary: git.dirtySummary ?? [],
    host: { platform: os.platform(), release: os.release(), arch: os.arch(), cpus: os.cpus().length, totalMemoryBytes: os.totalmem() },
    toolchain: { node: process.version, java: git.javaVersion ?? null, docker: git.dockerVersion ?? null },
    cwd, forbiddenManagerOverridesPresent: forbidden, resourceLimits: RESOURCE_LIMITS,
  };
}

export function assertResourcePreflight(rootPath, limits = RESOURCE_LIMITS) {
  if (limits.pricingWorkers !== 10 || limits.browserWorkers > 4 || limits.writerQueue > 256 || limits.pendingFutures > 14) throw new Error("resource concurrency contract mismatch");
  const fs = statfsSync(rootPath, { bigint: true });
  const freeBytes = fs.bavail * fs.bsize;
  if (freeBytes < BigInt(limits.freeReserveBytes)) { const error = new Error("less than 5 GiB evidence reserve"); error.status = "BLOCKED"; throw error; }
  return { freeBytes: freeBytes.toString(), reserveBytes: String(limits.freeReserveBytes), status: "PASS" };
}
