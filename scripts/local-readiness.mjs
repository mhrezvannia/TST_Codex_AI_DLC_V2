import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRuntimePlan, loadRuntimeProfiles } from "./local-runtime.mjs";

export const readinessSteps = [
  { id: "prerequisites", command: "node scripts/check-local-prereqs.mjs --json", blockedWhen: ["\"status\": \"blocked\""] },
  { id: "seed-dry-run", command: "node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json" },
  { id: "contracts-offline", command: "node scripts/verify-contract-providers.mjs" },
  { id: "reference-data-typecheck", command: "node_modules\\.bin\\tsc.cmd -p apps/reference-data/tsconfig.json --noEmit" },
  { id: "auth-typecheck", command: "node_modules\\.bin\\tsc.cmd -p apps/auth/tsconfig.json --noEmit" },
  { id: "reference-data-tests", command: "node_modules\\.bin\\vitest.cmd run apps/reference-data/app/page.test.tsx apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts" },
  { id: "auth-tests", command: "node_modules\\.bin\\vitest.cmd run packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts --config vitest.config.ts" },
  { id: "script-tests", command: "node --test scripts/seed-local.test.mjs scripts/verify-contract-providers.test.mjs scripts/run-quality-gates.test.mjs" },
  { id: "contracts-live", command: "node scripts/verify-contract-providers.mjs --live --evidence-file artifacts/contracts-live-verification.json", blockedWhen: ["fetch failed", "ECONNREFUSED"] },
  { id: "seed-apply-live", command: "node scripts/seed-local.mjs --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json --summary-file artifacts/seed-apply-attempt.json", blockedWhen: ["fetch failed", "ECONNREFUSED"] }
];

export function runLocalReadiness(options = {}) {
  const runner = options.runner ?? runCommand;
  const profile = options.profile ?? "full";
  const metadata = options.profileMetadata ?? loadRuntimeProfiles(options.root ?? process.cwd());
  const runtimePlan = buildRuntimePlan(profile, metadata);
  const steps = (options.steps ?? readinessSteps).map((step) => {
    const result = runner(step.command);
    return classifyStep(step, result);
  });
  const failed = steps.filter((step) => step.status === "failed");
  const blocked = steps.filter((step) => step.status === "blocked");
  const evidence = {
    generatedAt: new Date().toISOString(),
    profile,
    readinessState: failed.length > 0 ? "failed" : blocked.length > 0 ? "blocked" : runtimePlan.readinessState,
    status: failed.length > 0 ? "failed" : blocked.length > 0 ? "blocked" : "passed",
    summary: {
      passed: steps.filter((step) => step.status === "passed").length,
      blocked: blocked.length,
      failed: failed.length
    },
    serviceStatuses: runtimePlan.services.map((serviceName) => ({
      serviceName,
      status: failed.length > 0 ? "unknown" : blocked.length > 0 ? "blocked" : "evidence_ready"
    })),
    runtimePlan,
    steps
  };
  if (options.evidencePath) {
    const outputPath = resolve(options.evidencePath);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  }
  return evidence;
}

export function classifyStep(step, result) {
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const blocked = result.status !== 0 && (step.blockedWhen ?? []).some((pattern) => output.includes(pattern));
  return {
    id: step.id,
    command: step.command,
    status: result.status === 0 ? "passed" : blocked ? "blocked" : "failed",
    exitCode: result.status,
    summary: output.trim().slice(0, 2000)
  };
}

function runCommand(command) {
  return spawnSync(command, { shell: true, encoding: "utf8", timeout: 180000 });
}

function parseArgs(argv) {
  return {
    profile: valueAfter(argv, "--profile") ?? process.env.LOCAL_RUNTIME_PROFILE ?? "full",
    evidencePath: valueAfter(argv, "--evidence") ?? "artifacts/readiness/local-readiness.json"
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const evidence = runLocalReadiness(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify({ status: evidence.status, summary: evidence.summary }, null, 2));
  process.exit(evidence.status === "failed" ? 1 : 0);
}
