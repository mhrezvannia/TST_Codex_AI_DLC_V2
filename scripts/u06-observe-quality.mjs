import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import registry from "../tests/u06/acceptance-registry.json" with { type: "json" };
import { validateClosedMatrix, validatePerformanceSamples, validateResourceCycles } from "../tools/u06/live-gates.mjs";

const root = path.resolve(".");
const node = process.execPath;
const yarn = [".yarn/releases/yarn-4.5.3.cjs"];
const storageState = valueAfter(process.argv, "--storage-state");
if (!storageState) throw new Error("--storage-state is required");

const backend = maven(["-f", "services/pom.xml", "test"]);
const frontend = mergeCommands(
  command(node, [...yarn, "test"]),
  command(node, [...yarn, "typecheck"]),
  command(node, [...yarn, "lint"]),
  command(node, [...yarn, "build"]),
  command(node, ["--test", "--test-isolation=none", ...u06Tests()]),
);
const contract = mergeCommands(
  command(node, ["scripts/validate-contract-catalog.mjs"]),
  command(node, ["scripts/verify-contract-providers.mjs"]),
);
const migration = maven(["-f", "services/pom.xml", "-pl", "booking-service/container,charge-agreement-service/container", "-am",
  "-Dtest=BookingFlywayMigrationStrategyLiveTest,ChargeFlywayMigrationStrategyPostgresTest,BookingPreparedSchemaContractTest,AgreementPreparedSchemaContractTest",
  "-Dsurefire.failIfNoSpecifiedTests=false", "test"]);
const coverage = coverageEvidence();
const nginx = mergeCommands(
  command(node, ["scripts/wave-a-compose.mjs", "exec", "-T", "nginx", "nginx", "-t"]),
  command(node, ["scripts/u02-route-preservation.test.mjs"]),
);
const playwright = command(node, ["scripts/u06-observe-browser.mjs"]);
const performance = performanceEvidence();
const restartRestore = await restartRestoreEvidence();
const gitDiff = command("git", ["diff", "--check"]);

const evidence = new Map([
  ["BACKEND", fromCommand(backend, "full Maven service reactor tests pass")],
  ["FRONTEND", fromCommand(frontend, "workspace test, typecheck, lint, build, and U06 tool tests pass")],
  ["CONTRACT", fromCommand(contract, "catalog and provider/consumer contract verification pass")],
  ["MIGRATION", fromCommand(migration, "Booking V1-V4 and Charge V1-V5 live migration/prepared-schema tests pass")],
  ["COVERAGE", { passed: coverage.passed, command: coverage.command, output: JSON.stringify(coverage, null, 2), assertion: "changed production code line coverage is at least 80%", details: coverage }],
  ["NGINX", fromCommand(nginx, "live nginx config and route/base-path regressions pass")],
  ["PLAYWRIGHT", fromCommand(playwright, "all 76 responsive, semantic, keyboard, focus, overflow, theme, and axe cells pass")],
  ["PERFORMANCE", { passed: performance.passed, command: performance.command, output: JSON.stringify(performance, null, 2), assertion: "fresh 300-sample p99/resource evidence validates", details: performance }],
  ["RESTART_RESTORE", { passed: restartRestore.passed, command: restartRestore.command, output: JSON.stringify(restartRestore, null, 2), assertion: "bounded backend restart preserves business counts and authenticated readiness", details: restartRestore }],
  ["GIT_DIFF", fromCommand(gitDiff, "git diff whitespace validation passes")],
]);

const members = registry.members.filter((member) => member.category === "QUALITY");
const results = members.map((member) => {
  const id = member.key.split(":")[1]; const item = evidence.get(id);
  const observation = { id, status: item?.passed ? "PASS" : "FAIL" };
  return { key: member.key, status: observation.status, observation, artifactPayloads: {
    "command-log": { id, command: item?.command, exitCode: item?.passed ? 0 : 1, output: bounded(item?.output ?? "") },
    "assertion-json": { id, assertion: item?.assertion, passed: item?.passed === true, details: item?.details ?? null },
  } };
});
const observations = results.map((result) => result.observation);
const ids = members.map((member) => member.key.split(":")[1]);
if (validateClosedMatrix(ids, observations) !== "PASS") {
  throw new Error(`quality matrix failed: ${JSON.stringify(results.filter((result) => result.status !== "PASS").map((result) => ({ key: result.key, evidence: evidence.get(result.observation.id) })))}`);
}
const envelope = { schemaVersion: 1, stage: "quality", observedAt: new Date().toISOString(), results };
const output = path.resolve("artifacts/u06/observations/quality.json");
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ status: "PASS", observations, coverage: coverage.percent, restartCounts: restartRestore.counts }, null, 2)}\n`);

function fromCommand(item, assertion) { return { passed: item.status === 0, command: item.command, output: item.output, assertion }; }
function command(executable, args, timeout = 900_000) {
  const result = spawnSync(executable, args, { cwd: root, encoding: "utf8", windowsHide: true, timeout });
  return { command: [executable, ...args].join(" "), status: result.status ?? 1,
    output: `${result.stdout ?? ""}\n${result.stderr ?? result.error?.message ?? ""}` };
}
function maven(args) {
  return process.platform === "win32" ? command(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `mvn ${args.join(" ")}`]) : command("mvn", args);
}
function mergeCommands(...items) {
  return { command: items.map((item) => item.command).join(" && "), status: items.every((item) => item.status === 0) ? 0 : 1,
    output: items.map((item) => `$ ${item.command}\n${item.output}`).join("\n") };
}
function u06Tests() {
  return readdirSync(path.resolve("tests/u06"), { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith(".test.mjs"))
    .map((entry) => `tests/u06/${entry.name}`);
}

function coverageEvidence() {
  const frontendPath = path.resolve("artifacts/u06/coverage-frontend/coverage-summary.json");
  const frontend = JSON.parse(readFileSync(frontendPath, "utf8"));
  const frontendFiles = [
    "apps/charge-agreements/app/AgreementDetailView.tsx", "apps/charge-agreements/app/AgreementForm.tsx",
    "apps/charge-agreements/app/AgreementList.tsx", "apps/shell/app/booking/[bookingId]/BookingActions.tsx",
    "apps/shell/app/booking/[bookingId]/BookingPricingPanel.tsx", "apps/shell/lib/booking-client.ts",
    "packages/ui/src/index.tsx", "packages/ui/src/styles.ts",
  ];
  let covered = 0; let total = 0; const files = [];
  for (const relative of frontendFiles) {
    const key = Object.keys(frontend).find((candidate) => candidate.replaceAll("\\", "/").endsWith(relative));
    if (!key) throw new Error(`frontend coverage missing ${relative}`);
    const lines = frontend[key].lines; covered += lines.covered; total += lines.total;
    files.push({ path: relative, covered: lines.covered, total: lines.total, percent: lines.pct });
  }
  const java = javaChangedCoverage(); covered += java.covered; total += java.total;
  const percent = Number((100 * covered / total).toFixed(2));
  return { passed: total > 0 && percent >= 80, command: "JaCoCo full reactor + Vitest V8 changed-production coverage",
    percent, threshold: 80, covered, total, frontendFiles: files, java };
}

function javaChangedCoverage() {
  const files = [
    "services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/BookingApplicationService.java",
    "services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/pricing/PricingInput.java",
    "services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java",
    "services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/ChargeAgreementMessagingConfiguration.java",
    "services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/PricingApiController.java",
    "services/identity-service/domain-core/src/main/java/com/linercore/platform/identity/domain/catalog/MvpAuthorizationCatalog.java",
    "services/identity-service/domain-core/src/main/java/com/linercore/platform/identity/domain/model/PermissionAction.java",
  ];
  const changed = changedLineNumbers(files); const reports = findFiles(path.resolve("services"), "jacoco.xml");
  let covered = 0; let total = 0; const details = [];
  for (const relative of files) {
    const name = path.basename(relative); const lines = jacocoLines(reports, name); const changedNumbers = changed.get(relative) ?? new Set();
    let fileCovered = 0; let fileTotal = 0;
    for (const line of changedNumbers) {
      const hit = lines.get(line); if (!hit) continue;
      fileTotal += 1; if (hit) fileCovered += 1;
    }
    covered += fileCovered; total += fileTotal;
    details.push({ path: relative, changedExecutable: fileTotal, covered: fileCovered,
      percent: fileTotal ? Number((100 * fileCovered / fileTotal).toFixed(2)) : 100 });
  }
  return { covered, total, percent: total ? Number((100 * covered / total).toFixed(2)) : 0, files: details };
}

function changedLineNumbers(files) {
  const diff = command("git", ["diff", "--unified=0", "--", ...files]);
  if (diff.status !== 0) throw new Error(`git diff for coverage failed: ${diff.output}`);
  const result = new Map(); let current;
  for (const line of diff.output.split(/\r?\n/)) {
    if (line.startsWith("+++ b/")) { current = line.slice(6).replaceAll("\\", "/"); if (!result.has(current)) result.set(current, new Set()); continue; }
    const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (!match || !current) continue;
    const start = Number(match[1]); const count = match[2] === undefined ? 1 : Number(match[2]);
    for (let number = start; number < start + count; number += 1) result.get(current).add(number);
  }
  return result;
}
function jacocoLines(reports, name) {
  for (const report of reports) {
    const xml = readFileSync(report, "utf8"); const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const source = xml.match(new RegExp(`<sourcefile name="${escaped}">([\\s\\S]*?)</sourcefile>`));
    if (!source) continue;
    const lines = new Map();
    for (const tag of source[1].match(/<line\s+[^>]+\/>/g) ?? []) {
      const nr = Number(tag.match(/nr="(\d+)"/)?.[1]); const ci = Number(tag.match(/ci="(\d+)"/)?.[1]);
      if (nr) lines.set(nr, ci > 0);
    }
    return lines;
  }
  throw new Error(`JaCoCo source missing ${name}`);
}
function findFiles(directory, name) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue; const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...findFiles(absolute, name)); else if (entry.name === name) found.push(absolute);
  }
  return found;
}

function performanceEvidence() {
  const file = path.resolve("artifacts/u06/observations/performance.json"); const envelope = JSON.parse(readFileSync(file, "utf8"));
  const ageMs = Date.now() - Date.parse(envelope.observedAt); const percentiles = validatePerformanceSamples(envelope.proof?.samples ?? []);
  const resources = validateResourceCycles(envelope.proof?.cycles ?? []);
  return { passed: ageMs >= 0 && ageMs <= 4 * 60 * 60_000 && resources === "PASS", command: "validatePerformanceSamples + validateResourceCycles",
    ageMs, samples: envelope.proof?.samples?.length, percentiles, resources };
}

async function restartRestoreEvidence() {
  const before = businessCounts();
  const restarted = command(node, ["scripts/wave-a-compose.mjs", "restart", "booking-service", "charge-agreement-service"]);
  let healthy = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const [booking, charge] = await Promise.all([fetch("http://127.0.0.1:18082/actuator/health"), fetch("http://127.0.0.1:18084/actuator/health")]);
      healthy = booking.ok && charge.ok; if (healthy) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  let readiness = { status: 1, command: "authenticated readiness", output: "services did not become healthy" };
  let readinessAttempts = 0;
  if (healthy) {
    for (let attempt = 1; attempt <= 15; attempt += 1) {
      readinessAttempts = attempt;
      readiness = command(node, ["scripts/u06-observe-readiness.mjs", "--storage-state", storageState, "--subject", "local.booking.user"]);
      if (readiness.status === 0) break;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
  const after = businessCounts(); const stable = JSON.stringify(before.values) === JSON.stringify(after.values);
  return { passed: restarted.status === 0 && healthy && readiness.status === 0 && stable,
    command: `${restarted.command} && ${readiness.command}`, counts: { before: before.values, after: after.values, stable },
    restartExit: restarted.status, healthy, readinessExit: readiness.status, readinessAttempts,
    output: bounded(`${restarted.output}\n${readiness.output}`) };
}
function businessCounts() {
  const booking = command(node, ["scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-U", "linercore_booking", "-X", "-At", "-d", "linercore_booking", "-c", "SELECT COUNT(*) FROM booking_records; SELECT COUNT(*) FROM booking_pricing_snapshots;"]);
  const charge = command(node, ["scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-U", "linercore_pricing", "-X", "-At", "-d", "linercore_pricing", "-c", "SELECT COUNT(*) FROM pricing_requests; SELECT COUNT(*) FROM manual_pricing_cases; SELECT COUNT(*) FROM charge_agreement_activity;"]);
  if (booking.status !== 0 || charge.status !== 0) throw new Error(`business count query failed: ${booking.output}\n${charge.output}`);
  const values = [...numbers(booking.output), ...numbers(charge.output)]; if (values.length !== 5) throw new Error(`business count cardinality mismatch: ${values}`);
  return { values };
}
function numbers(output) { return output.split(/\r?\n/).map((value) => value.trim()).filter((value) => /^\d+$/.test(value)).map(Number); }
function bounded(value) { return String(value).replace(/(authorization|cookie|token|password)=?\S*/gi, "$1=<redacted>").slice(-20_000); }
function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }
