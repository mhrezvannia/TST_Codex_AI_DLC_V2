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
  { id: "package-auth-test", scope: "packages/auth", required: true, command: "corepack yarn workspace @erp/auth test" },
  { id: "package-auth-typecheck", scope: "packages/auth", required: true, command: "corepack yarn workspace @erp/auth typecheck" },
  { id: "package-auth-lint", scope: "packages/auth", required: true, command: "corepack yarn workspace @erp/auth lint" },
  { id: "package-shared-types-test", scope: "packages/shared-types", required: true, command: "corepack yarn workspace @erp/shared-types test" },
  { id: "package-shared-types-typecheck", scope: "packages/shared-types", required: true, command: "corepack yarn workspace @erp/shared-types typecheck" },
  { id: "package-shared-types-lint", scope: "packages/shared-types", required: true, command: "corepack yarn workspace @erp/shared-types lint" },
  { id: "frontend-auth-test", scope: "apps/auth", required: true, command: "corepack yarn workspace @erp/app-auth test" },
  { id: "frontend-auth-typecheck", scope: "apps/auth", required: true, command: "corepack yarn workspace @erp/app-auth typecheck" },
  { id: "frontend-auth-lint", scope: "apps/auth", required: true, command: "corepack yarn workspace @erp/app-auth lint" },
  { id: "frontend-auth-build", scope: "apps/auth", required: true, command: "corepack yarn workspace @erp/app-auth build" },
  { id: "frontend-charge-agreements-test", scope: "apps/charge-agreements", required: true, command: "corepack yarn workspace @erp/app-charge-agreements test" },
  { id: "frontend-charge-agreements-typecheck", scope: "apps/charge-agreements", required: true, command: "corepack yarn workspace @erp/app-charge-agreements typecheck" },
  { id: "frontend-charge-agreements-lint", scope: "apps/charge-agreements", required: true, command: "corepack yarn workspace @erp/app-charge-agreements lint" },
  { id: "frontend-charge-agreements-build", scope: "apps/charge-agreements", required: true, command: "corepack yarn workspace @erp/app-charge-agreements build" },
  { id: "u02-route-preservation", scope: "apps/charge-agreements", required: true, command: "node scripts/u02-route-preservation.mjs" },
  { id: "u02-subject-assertion-contract", scope: "apps/charge-agreements", required: true, command: "mvn -f services/pom.xml -pl charge-agreement-service/container -am -Dtest=ChargeSubjectAssertionVerifierTest -Dsurefire.failIfNoSpecifiedTests=false test" },
  { id: "u02-security", scope: "apps/charge-agreements", required: true, command: "node scripts/run-u02-security-gates.mjs" },
  { id: "u02-performance", scope: "apps/charge-agreements", required: true, command: "node scripts/u02-bff-performance.mjs --input artifacts/u02/performance.json" },
  { id: "u03-agreement-preservation", scope: "apps/charge-agreements", required: true, command: "node scripts/u03-agreement-preservation.test.mjs" },
  { id: "u03-agreement-performance-contract", scope: "apps/charge-agreements", required: true, command: "node scripts/u03-agreement-performance.test.mjs" },
  { id: "u04-pricing-preservation", scope: "apps/charge-agreements", required: true, command: "node scripts/u04-pricing-preservation.test.mjs" },
  { id: "u04-pricing-performance-contract", scope: "apps/charge-agreements", required: true, command: "node scripts/u04-pricing-performance.test.mjs" },
  { id: "u04-rollback-policy", scope: "apps/charge-agreements", required: true, command: "node scripts/u04-rollback-policy.test.mjs" },
  { id: "frontend-booking-test", scope: "apps/booking", required: true, command: "corepack yarn workspace @erp/app-booking test" },
  { id: "frontend-booking-typecheck", scope: "apps/booking", required: true, command: "corepack yarn workspace @erp/app-booking typecheck" },
  { id: "frontend-booking-lint", scope: "apps/booking", required: true, command: "corepack yarn workspace @erp/app-booking lint" },
  { id: "frontend-booking-build", scope: "apps/booking", required: true, command: "corepack yarn workspace @erp/app-booking build" },
  { id: "frontend-shell-test", scope: "apps/shell", required: true, command: "corepack yarn workspace @erp/app-shell test" },
  { id: "frontend-shell-typecheck", scope: "apps/shell", required: true, command: "corepack yarn workspace @erp/app-shell typecheck" },
  { id: "frontend-shell-lint", scope: "apps/shell", required: true, command: "corepack yarn workspace @erp/app-shell lint" },
  { id: "frontend-shell-build", scope: "apps/shell", required: true, command: "corepack yarn workspace @erp/app-shell build" },
  { id: "w2-01-live-acceptance", scope: "w2-01-live", required: true, command: "node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth && node scripts/w2-01-live-acceptance.mjs --validate --require-pass --output-root artifacts/w2-01-live/app-shell-auth" },
  { id: "backend-test", scope: "services", required: true, command: "mvn -f services/pom.xml test" }
];

export function classifyChangedPaths(paths) {
  const scopes = new Set(["workspace"]);
  for (const path of paths) {
    if (path.startsWith("services/")) scopes.add("services");
    if (path.startsWith("apps/reference-data/")) scopes.add("apps/reference-data");
    if (path.startsWith("apps/auth/")) scopes.add("apps/auth");
    if (path.startsWith("apps/charge-agreements/")) scopes.add("apps/charge-agreements");
    if (path.startsWith("apps/booking/")) scopes.add("apps/booking");
    if (path.startsWith("apps/shell/")) scopes.add("apps/shell");
    if (path.startsWith("packages/auth/")) scopes.add("packages/auth");
    if (path.startsWith("packages/shared-types/")) scopes.add("packages/shared-types");
    if (path.startsWith("packages/")) scopes.add("packages");
    if (path.startsWith("contracts/")) scopes.add("contracts");
    if (path.startsWith("infrastructure/seeds/") || path === "compose.yaml") scopes.add("seeds");
    if (path.startsWith("scripts/w2-01-live-acceptance")) scopes.add("w2-01-live");
    if (path.startsWith("artifacts/w2-01-live/")) scopes.add("w2-01-live");
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
    if (result.error) {
      failures.push(`domain-core purity check unavailable under ${domainPath}: ${result.error.message}`);
    } else if ((result.stdout ?? "").trim()) {
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
  const scopes = options.all ? ["workspace", "services", "apps/reference-data", "apps/auth", "apps/charge-agreements", "apps/booking", "apps/shell", "packages", "packages/auth", "packages/shared-types", "contracts", "seeds", "w2-01-live"] : classifyChangedPaths(changedPaths);
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

export function parseArgs(argv) {
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
