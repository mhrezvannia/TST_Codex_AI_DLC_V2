import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const gateDefinitions = [
  { id: "policy-package-manager", scope: "workspace", required: true, command: "policy" },
  { id: "backend-domain-purity", scope: "services", required: true, command: "policy" },
  { id: "contracts-validate", scope: "contracts", required: true, command: "node scripts/validate-contract-catalog.mjs" },
  { id: "contracts-verify", scope: "contracts", required: true, command: "node scripts/verify-contract-providers.mjs" },
  { id: "seed-validate", scope: "seeds", required: true, command: "node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json" },
  { id: "skeleton-validate", scope: "workspace", required: true, command: "node scripts/validate-skeleton.mjs" },
  { id: "frontend-reference-data-test", scope: "apps/reference-data", required: true, command: "node node_modules/vitest/vitest.mjs run apps/reference-data/app/page.test.tsx apps/reference-data/lib/reference-data.test.ts apps/reference-data/lib/contract-catalog.test.ts --config vitest.config.ts" },
  { id: "frontend-reference-data-typecheck", scope: "apps/reference-data", required: true, command: "corepack yarn workspace @erp/app-reference-data typecheck" },
  { id: "frontend-auth-typecheck", scope: "apps/auth", required: true, command: "corepack yarn workspace @erp/app-auth typecheck" },
  { id: "frontend-charge-agreements-test", scope: "apps/charge-agreements", required: true, command: "corepack yarn workspace @erp/app-charge-agreements test" },
  { id: "frontend-charge-agreements-typecheck", scope: "apps/charge-agreements", required: true, command: "corepack yarn workspace @erp/app-charge-agreements typecheck" },
  { id: "backend-test", scope: "services", required: true, command: "mvn -f services/pom.xml test" }
];

export function classifyChangedPaths(paths) {
  const scopes = new Set(["workspace"]);
  for (const path of paths) {
    if (path.startsWith("services/")) scopes.add("services");
    if (path.startsWith("apps/reference-data/")) scopes.add("apps/reference-data");
    if (path.startsWith("apps/auth/")) scopes.add("apps/auth");
    if (path.startsWith("apps/charge-agreements/")) scopes.add("apps/charge-agreements");
    if (path.startsWith("packages/")) scopes.add("packages");
    if (path.startsWith("contracts/")) scopes.add("contracts");
    if (path.startsWith("infrastructure/seeds/") || path === "compose.yaml") scopes.add("seeds");
    if (path.startsWith(".github/workflows/") || path.startsWith("scripts/")) scopes.add("workspace");
  }
  return [...scopes].sort();
}

export function selectGates(scopes, all = false) {
  if (all) return gateDefinitions;
  const selectedScopes = new Set(scopes);
  return gateDefinitions.filter((gate) => selectedScopes.has(gate.scope) || gate.scope === "workspace");
}

export function runPolicyChecks(root = process.cwd()) {
  const failures = [];
  for (const lockfile of ["package-lock.json", "pnpm-lock.yaml"]) {
    if (existsSync(resolve(root, lockfile))) {
      failures.push(`unexpected frontend lockfile: ${lockfile}`);
    }
  }
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  if (!String(packageJson.packageManager ?? "").startsWith("yarn@")) {
    failures.push("packageManager must use yarn");
  }
  for (const domainPath of [
    "services/identity-service/domain-core/src/main/java",
    "services/reference-data-service/domain-core/src/main/java",
    "services/charge-agreement-service/domain-core/src/main/java"
  ]) {
    if (!existsSync(resolve(root, domainPath))) continue;
    const result = spawnSync("powershell", [
      "-NoProfile",
      "-Command",
      `Select-String -Path '${resolve(root, domainPath)}\\**\\*.java' -Pattern 'org.springframework|jakarta.persistence|javax.persistence|org.apache.kafka|com.fasterxml.jackson|lombok|dataaccess|messaging' -CaseSensitive:$false`
    ], { encoding: "utf8" });
    if (result.stdout.trim()) {
      failures.push(`domain-core impurity detected under ${domainPath}`);
    }
  }
  return failures;
}

export function aggregate(results) {
  const failedRequired = results.filter((result) => result.required && result.status !== "passed");
  return {
    status: failedRequired.length === 0 ? "passed" : "failed",
    failedRequired: failedRequired.map((result) => result.gateId)
  };
}

export function runQualityGates(options = {}) {
  const changedPaths = options.all ? ["<all>"] : options.changedPaths ?? discoverChangedPaths();
  const scopes = options.all ? ["workspace", "services", "apps/reference-data", "apps/auth", "apps/charge-agreements", "packages", "contracts", "seeds"] : classifyChangedPaths(changedPaths);
  const gates = selectGates(scopes, options.all);
  const results = gates.map((gate) => runGate(gate, options));
  const aggregateResult = aggregate(results);
  const evidence = {
    generatedAt: new Date().toISOString(),
    changedPaths,
    scopes,
    results,
    aggregate: aggregateResult
  };
  if (options.evidencePath) {
    const outputPath = resolve(options.evidencePath);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeGateLogs(dirname(outputPath), results);
    writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  }
  return evidence;
}

function writeGateLogs(outputDir, results) {
  for (const result of results) {
    writeFileSync(resolve(outputDir, `${result.gateId}.log`), `${result.status}\n${result.summary ?? ""}\n`);
  }
}

function runGate(gate, options) {
  if (gate.command === "policy") {
    const failures = runPolicyChecks();
    return resultFor(gate, failures.length === 0 ? "passed" : "failed", failures.join("; "));
  }
  if (options.dryRun) {
    return resultFor(gate, "skipped", "dry-run");
  }
  const commandResult = spawnSync(gate.command, {
    shell: true,
    encoding: "utf8",
    timeout: options.timeoutMs ?? 120000
  });
  return resultFor(gate, commandResult.status === 0 ? "passed" : "failed", (commandResult.stderr || commandResult.stdout || "").slice(0, 2000));
}

function resultFor(gate, status, summary) {
  return {
    gateId: gate.id,
    scope: gate.scope,
    command: gate.command,
    required: gate.required,
    status,
    summary,
    evidencePath: `artifacts/quality-gates/${gate.id}.log`
  };
}

function discoverChangedPaths() {
  const result = spawnSync("git", ["diff", "--name-only", "origin/main...HEAD"], { encoding: "utf8" });
  if (result.status !== 0 || result.stdout.trim().length === 0) {
    return ["<all>"];
  }
  return result.stdout.trim().split(/\r?\n/);
}

function parseArgs(argv) {
  return {
    all: argv.includes("--all"),
    dryRun: argv.includes("--dry-run"),
    evidencePath: valueAfter(argv, "--evidence") ?? "artifacts/quality-gates/evidence.json"
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const evidence = runQualityGates(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify({ status: evidence.aggregate.status, failedRequired: evidence.aggregate.failedRequired }, null, 2));
  process.exit(evidence.aggregate.status === "passed" ? 0 : 1);
}
