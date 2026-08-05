import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const composeProject = "linercore-wave-a";
export const requiredGateIds = [
  "demo-snapshot",
  "preflight",
  "compose-config",
  "compose-start",
  "charge-health",
  "booking-health",
  "charge-ui-health",
  "live-journey",
  "restart-services",
  "restart-persistence",
  "contracts",
  "aidlc-audit",
  "erp-fidelity-audit",
  "compose-cleanup",
  "demo-verify"
];

const isolatedEnv = {
  POSTGRES_HOST_PORT: "55433",
  KEYCLOAK_HOST_PORT: "18080",
  KAFKA_HOST_PORT: "19092",
  SCHEMA_REGISTRY_HOST_PORT: "18081",
  IDENTITY_SERVICE_HOST_PORT: "18082",
  REFERENCE_DATA_SERVICE_HOST_PORT: "18083",
  CHARGE_AGREEMENT_SERVICE_HOST_PORT: "18084",
  BOOKING_SERVICE_HOST_PORT: "18085",
  CONTAINER_MOVEMENT_SERVICE_HOST_PORT: "18086",
  CHARGE_AGREEMENTS_UI_HOST_PORT: "13013",
  NGINX_HOST_PORT: "18088",
  PROMETHEUS_HOST_PORT: "19090",
  GRAFANA_HOST_PORT: "13004",
  JAEGER_UI_HOST_PORT: "16687",
  LINERCORE_NETWORK_NAME: "linercore-wave-a",
  COMPOSE_PARALLEL_LIMIT: "1"
};

const dockerBlockers = [
  "Cannot connect to the Docker daemon",
  "failed to connect to the docker API",
  "error during connect",
  "connectex",
  "no space left on device",
  "pull access denied",
  "failed to fetch anonymous token"
];
const probeBlockers = ["ECONNREFUSED", "fetch failed", "probe failed", "socket hang up"];

export const liveAcceptanceGates = [
  gate("demo-snapshot", "guard", ["W2-03-S5"], "node scripts/demo-guard.mjs --snapshot {RUN_DIR}/guard/protected-before.json", dockerBlockers),
  gate("preflight", "preflight", ["W2-03-S5"], "node scripts/w2-03-live-acceptance.mjs --preflight", ["PRECHECK_BLOCKED"]),
  gate("compose-config", "compose", ["W2-03-S5"], `docker compose -p ${composeProject} --profile full config --quiet`, dockerBlockers),
  gate("compose-start", "compose", ["W2-03-S5"], `docker compose -p ${composeProject} --profile full up -d --build postgres kafka schema-registry identity-service reference-data-service charge-agreement-service booking-service apps-charge-agreements`, dockerBlockers),
  gate("charge-health", "runtime", ["W2-03-S1", "W2-03-S2", "W2-03-S3"], "node scripts/w2-03-live-acceptance.mjs --probe http://127.0.0.1:18084/actuator/health", probeBlockers),
  gate("booking-health", "runtime", ["W2-03-S4"], "node scripts/w2-03-live-acceptance.mjs --probe http://127.0.0.1:18085/actuator/health", probeBlockers),
  gate("charge-ui-health", "runtime", ["W2-03-S1", "W2-03-S2", "W2-03-S3"], "node scripts/w2-03-live-acceptance.mjs --probe http://127.0.0.1:13013/api/health", probeBlockers),
  gate("live-journey", "journey", ["W2-03-S1", "W2-03-S2", "W2-03-S3", "W2-03-S4", "W2-03-S5"], "node scripts/w2-03-live-acceptance.mjs --journey {RUN_DIR}/journey/scenarios.json", probeBlockers),
  gate("restart-services", "restart", ["W2-03-S5"], `docker compose -p ${composeProject} restart postgres charge-agreement-service booking-service`, dockerBlockers),
  gate("restart-persistence", "restart", ["W2-03-S4", "W2-03-S5"], "node scripts/w2-03-live-acceptance.mjs --verify-restart {RUN_DIR}/journey/scenarios.json", probeBlockers),
  gate("contracts", "quality", ["W2-03-S4", "W2-03-S5"], "node scripts/validate-contract-catalog.mjs"),
  { ...gate("aidlc-audit", "audits", ["W2-03-S5"], "node scripts/w2-03-live-acceptance.mjs --audit aidlc"), alwaysRun: true },
  { ...gate("erp-fidelity-audit", "audits", ["W2-03-S5"], "node scripts/w2-03-live-acceptance.mjs --audit erp-fidelity"), alwaysRun: true },
  { ...gate("compose-cleanup", "cleanup", ["W2-03-S5"], `docker compose -p ${composeProject} --profile full down`, dockerBlockers), alwaysRun: true },
  { ...gate("demo-verify", "guard", ["W2-03-S5"], "node scripts/demo-guard.mjs --verify {RUN_DIR}/guard/protected-before.json", [...dockerBlockers, "snapshot is missing"]), alwaysRun: true }
];

function gate(id, section, mapsTo, command, blockedWhen = []) {
  return { id, section, mapsTo, command, blockedWhen };
}

export function runW203Acceptance(options = {}) {
  const dryRun = options.dryRun ?? false;
  const runId = options.runId ?? `w2-03-live-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const outputRoot = resolve(options.outputRoot ?? "artifacts/w2-03-live");
  const runDir = resolve(outputRoot, runId);
  const gatesToRun = options.gates ?? liveAcceptanceGates;
  const runner = options.runner ?? runCommand;
  mkdirSync(runDir, { recursive: true });

  let stopped = false;
  const gates = gatesToRun.map((definition) => {
    const resolvedGate = { ...definition, command: definition.command.replaceAll("{RUN_DIR}", commandPath(runDir)) };
    let result;
    if (stopped && !definition.alwaysRun) {
      result = gateResult(resolvedGate, "SKIPPED", null, "skipped after prior blocking gate");
    } else if (dryRun) {
      result = gateResult(resolvedGate, "PLANNED", null, "dry-run: command not executed");
    } else {
      result = classifyGate(resolvedGate, runner(resolvedGate.command));
    }
    writeGateEvidence(runDir, result);
    if (!definition.alwaysRun && ["FAIL", "BLOCKED"].includes(result.status)) stopped = true;
    return result;
  });

  const status = gates.some((item) => item.status === "FAIL")
    ? "FAILED"
    : gates.some((item) => item.status === "BLOCKED")
      ? "BLOCKED"
      : gates.some((item) => item.status === "PLANNED")
        ? "PLANNED"
        : "PASSED";
  const manifestPath = resolve(runDir, "manifest.json");
  const manifest = {
    intent: "W2-03-charge-tariffs-and-agreements",
    runId,
    generatedAt: options.now ?? new Date().toISOString(),
    status,
    composeProject,
    destructiveDatabaseResetAllowed: false,
    protectedComposeProject: "linercore-shared-platform",
    isolatedPorts: isolatedEnv,
    gates,
    artifacts: indexArtifacts(runDir)
  };
  writeJson(manifestPath, manifest);
  const finalManifest = { ...manifest, artifacts: indexArtifacts(runDir) };
  writeJson(manifestPath, finalManifest);
  writeFileSync(resolve(runDir, "index.md"), renderIndex(finalManifest));
  return finalManifest;
}

export function validateLivePreflight(options = {}) {
  const composeText = options.composeText ?? readFileSync(resolve("compose.yaml"), "utf8");
  const failures = [];
  requireText(composeText, "${POSTGRES_HOST_PORT:-55432}:5432", "PostgreSQL host port must default to 55432", failures);
  requireText(composeText, "linercore_postgres_data:/var/lib/postgresql/data", "PostgreSQL must use durable named storage", failures);
  requireText(composeText, "linercore_postgres_data:", "the durable PostgreSQL volume must be declared", failures);
  requireText(composeText, "${CHARGE_AGREEMENT_SERVICE_HOST_PORT:-8084}:8084", "Charge API host port must be overridable", failures);
  requireText(composeText, "${BOOKING_SERVICE_HOST_PORT:-8085}:8085", "Booking API host port must be overridable", failures);
  requireText(composeText, "${CHARGE_AGREEMENTS_UI_HOST_PORT:-3003}:3000", "Charge UI host port must be overridable", failures);
  requireText(composeText, "${GRAFANA_HOST_PORT:-13003}:3000", "Grafana must not collide with the Charge UI", failures);
  requireText(composeText, "${LINERCORE_NETWORK_NAME:-linercore-local}", "the Compose network must be project-overridable", failures);
  requireText(composeText, "SPRING_PROFILES_ACTIVE: local,kafka", "Charge and Booking must use local,kafka profiles", failures);
  requireText(composeText, "MESSAGING_REQUIRE_REAL: \"true\"", "real messaging must be required", failures);
  requireText(composeText, "http://localhost:8084/actuator/health", "Charge API healthcheck is required", failures);
  requireText(composeText, "http://localhost:3000/api/health", "Charge UI healthcheck is required", failures);
  requireText(composeText, "condition: service_healthy", "Booking must depend on healthy services", failures);
  if (composeText.includes("local-noop")) failures.push("local-noop cannot satisfy live acceptance");
  return { status: failures.length === 0 ? "PASS" : "BLOCKED", failures };
}

export function classifyGate(definition, result) {
  const output = redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.message ?? ""}`).trim();
  const summary = output.length <= 4000 ? output : `${output.slice(0, 2000)}\n... output truncated ...\n${output.slice(-2000)}`;
  const blocked = result.status !== 0 && (definition.blockedWhen ?? []).some((pattern) => summary.includes(pattern));
  return gateResult(definition, result.status === 0 ? "PASS" : blocked ? "BLOCKED" : "FAIL", result.status, summary);
}

export function validateEvidencePackage(path = "artifacts/w2-03-live", options = {}) {
  const runDir = resolveEvidenceRun(path, options.runId);
  const failures = [];
  if (!runDir || !existsSync(resolve(runDir, "manifest.json"))) {
    return { status: "FAIL", failures: ["manifest.json is missing"] };
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(resolve(runDir, "manifest.json"), "utf8"));
  } catch (error) {
    return { status: "FAIL", failures: [`manifest.json is invalid: ${error.message}`] };
  }
  for (const field of ["intent", "runId", "generatedAt", "status", "composeProject", "gates", "artifacts"]) {
    if (!(field in manifest)) failures.push(`manifest missing ${field}`);
  }
  if (!["PASSED", "BLOCKED", "FAILED", "PLANNED"].includes(manifest.status)) failures.push("manifest status is invalid");
  if (options.requirePass && manifest.status !== "PASSED") failures.push("manifest status must be PASSED");
  const gateIds = (manifest.gates ?? []).map((item) => item.id);
  for (const id of requiredGateIds) {
    if (gateIds.filter((candidate) => candidate === id).length !== 1) failures.push(`gate ${id} must appear exactly once`);
  }
  for (const item of manifest.gates ?? []) {
    if (!["PASS", "BLOCKED", "FAIL", "SKIPPED", "PLANNED"].includes(item.status)) failures.push(`gate ${item.id} has invalid status`);
    if (!existsSync(resolve(runDir, item.artifactPath ?? ""))) failures.push(`gate ${item.id} evidence is missing`);
  }
  for (const artifact of manifest.artifacts ?? []) {
    const artifactPath = resolve(runDir, artifact.path);
    if (!existsSync(artifactPath)) {
      failures.push(`artifact ${artifact.path} is missing`);
    } else if (sha256(readFileSync(artifactPath)) !== artifact.sha256) {
      failures.push(`artifact ${artifact.path} hash mismatch`);
    }
  }
  return { status: failures.length === 0 ? "PASS" : "FAIL", failures, runDir };
}

export async function runLiveJourney(path, options = {}) {
  const chargeUrl = options.chargeUrl ?? "http://127.0.0.1:18084";
  const bookingUrl = options.bookingUrl ?? "http://127.0.0.1:18085";
  const suffix = options.suffix ?? Date.now().toString(36);
  const lane = `TL-${suffix}`;
  const customer = `customer-${suffix}`;
  const commodity = `commodity-${suffix}`;
  const equipment = "42G1";
  const pol = "NLRTM";
  const pod = "USNYC";
  const rates = [];
  for (const definition of [
    { category: "FREIGHT", chargeCodeId: `FRT-${suffix}`, amount: 1200, locationId: null },
    { category: "SURCHARGE", chargeCodeId: `BAF-${suffix}`, amount: 175, locationId: null },
    { category: "LOCAL", chargeCodeId: `THC-${suffix}`, amount: 90, locationId: pol }
  ]) {
    const created = await requestJson(`${chargeUrl}/api/charge-rates`, {
      method: "POST",
      body: { ...definition, tradeLaneId: lane, equipmentTypeId: equipment, currencyId: "USD", validFrom: "2026-01-01", validTo: "2027-12-31", actorSubjectId: "local-user" }
    });
    rates.push(await requestJson(`${chargeUrl}/api/charge-rates/${created.id}/approve?version=${created.version}`, { method: "POST", body: { actorSubjectId: "local-user" } }));
  }
  const firstAuthority = await createApprovedAuthority({ chargeUrl, suffix: `${suffix}-a`, customer, lane, commodity, rateIds: rates.map((item) => item.id) });
  const firstBooking = await createAndPriceBooking({ bookingUrl, suffix: `${suffix}-a`, customer, lane, commodity, equipment, pol, pod });
  assert(firstBooking.status === "PRICED", `expected PRICED Booking, received ${firstBooking.status}`);
  assert(firstBooking.pricingSnapshot?.quotedAmounts?.pricingBasis === "AGREEMENT", "Booking did not persist AGREEMENT pricing basis");
  assert(Object.keys(firstBooking.pricingSnapshot?.quotedAmounts ?? {}).some((key) => key.startsWith("line.")), "Booking snapshot has no itemised charge lines");

  const newFreight = await requestJson(`${chargeUrl}/api/charge-rates/${rates[0].id}/versions`, {
    method: "POST",
    body: { expectedVersion: rates[0].version, amount: 1400, currencyId: "USD", validFrom: "2026-01-01", validTo: "2027-12-31", actorSubjectId: "local-user" }
  });
  const approvedFreight = await requestJson(`${chargeUrl}/api/charge-rates/${newFreight.id}/approve?version=${newFreight.version}`, { method: "POST", body: { actorSubjectId: "local-user" } });
  await requestJson(`${chargeUrl}/api/charge-agreements/${firstAuthority.id}/suspend?version=${firstAuthority.version}`, { method: "POST", body: { actorSubjectId: "local-user", reason: "W2-03 rate change" } });
  const secondAuthority = await createApprovedAuthority({ chargeUrl, suffix: `${suffix}-b`, customer, lane, commodity, rateIds: [approvedFreight.id, rates[1].id, rates[2].id] });
  const repricedBooking = await createAndPriceBooking({ bookingUrl, suffix: `${suffix}-b`, customer, lane, commodity, equipment, pol, pod });
  assert(repricedBooking.status === "PRICED", "rate-change Booking was not priced");
  assert(snapshotTotal(repricedBooking) !== snapshotTotal(firstBooking), "rate change did not alter the Booking total");

  const manualBooking = await createAndPriceBooking({ bookingUrl, suffix: `${suffix}-manual`, customer, lane: `${lane}-NO-RATE`, commodity, equipment, pol, pod });
  assert(manualBooking.status === "MANUAL_PRICING", `expected MANUAL_PRICING, received ${manualBooking.status}`);
  assert((manualBooking.exceptions ?? []).some((item) => item.code === "MANUAL_PRICING_REQUIRED"), "manual Booking exception was not persisted");

  const evidence = {
    generatedAt: new Date().toISOString(),
    status: "PASS",
    scenarios: [
      { id: "create-approve-price", status: "PASS", agreementId: firstAuthority.id, bookingId: firstBooking.id, rateVersionIds: rates.map((item) => item.id) },
      { id: "rate-change-reprice", status: "PASS", agreementId: secondAuthority.id, bookingId: repricedBooking.id, rateVersionId: approvedFreight.id },
      { id: "no-rate-manual", status: "PASS", bookingId: manualBooking.id, exceptionCode: "MANUAL_PRICING_REQUIRED" }
    ],
    persistence: { agreementIds: [firstAuthority.id, secondAuthority.id], rateIds: [...rates.map((item) => item.id), approvedFreight.id], bookingIds: [firstBooking.id, repricedBooking.id, manualBooking.id] }
  };
  writeJson(resolve(path), evidence);
  return evidence;
}

export async function verifyRestartPersistence(path, options = {}) {
  const evidence = JSON.parse(readFileSync(resolve(path), "utf8"));
  const chargeUrl = options.chargeUrl ?? "http://127.0.0.1:18084";
  const bookingUrl = options.bookingUrl ?? "http://127.0.0.1:18085";
  await waitForHealth(`${chargeUrl}/actuator/health`);
  await waitForHealth(`${bookingUrl}/actuator/health`);
  for (const id of evidence.persistence.agreementIds) await requestJson(`${chargeUrl}/api/charge-agreements/${id}?actor=local-user`);
  for (const id of evidence.persistence.rateIds) await requestJson(`${chargeUrl}/api/charge-rates/${id}?actor=local-user`);
  for (const id of evidence.persistence.bookingIds) await requestJson(`${bookingUrl}/api/bookings/${id}`, { headers: { "X-LinerCore-Actor-Id": "local.booking.user", "X-Correlation-Id": "w2-03-restart" } });
  return { status: "PASS", verified: evidence.persistence };
}

async function createApprovedAuthority({ chargeUrl, suffix, customer, lane, commodity, rateIds }) {
  let agreement = await requestJson(`${chargeUrl}/api/charge-agreements`, {
    method: "POST",
    body: { agreementNumber: `AGR-${suffix}`, customerId: customer, tradeLaneId: lane, commodityId: commodity, validFrom: "2026-01-01", validTo: "2027-12-31", actorSubjectId: "local-user", reason: "W2-03 live acceptance" }
  });
  agreement = await requestJson(`${chargeUrl}/api/charge-agreements/${agreement.id}?version=${agreement.version}`, {
    method: "PUT",
    body: { agreementNumber: agreement.agreementNumber, customerId: customer, tradeLaneId: lane, commodityId: commodity, validFrom: "2026-01-01", validTo: "2027-12-31", terms: [{ id: `legacy-${suffix}`, chargeCodeId: `LEG-${suffix}`, basis: "PER_CONTAINER", amount: 1, currencyId: "USD", validFrom: "2026-01-01", validTo: "2027-12-31", notes: "legacy aggregate approval invariant" }], actorSubjectId: "local-user", reason: "attach exact rate authority" }
  });
  await requestJson(`${chargeUrl}/api/charge-agreements/${agreement.id}/rate-bindings?version=${agreement.version}`, { method: "POST", body: { rateVersionIds: rateIds, actorSubjectId: "local-user" } });
  return requestJson(`${chargeUrl}/api/charge-agreements/${agreement.id}/approve?version=${agreement.version}`, { method: "POST", body: { actorSubjectId: "local-user", reason: "W2-03 acceptance approval" } });
}

async function createAndPriceBooking({ bookingUrl, suffix, customer, lane, commodity, equipment, pol, pod }) {
  const booking = await requestJson(`${bookingUrl}/api/bookings`, {
    method: "POST",
    headers: { "Idempotency-Key": `create-${suffix}`, "X-LinerCore-Actor-Id": "local.booking.user", "X-Correlation-Id": `corr-${suffix}` },
    body: { customerId: customer, routing: [{ legSequence: 1, loadUnLocode: pol, dischargeUnLocode: pod, voyageId: `VOY-${suffix}` }], equipment: [{ equipmentTypeCode: equipment, quantity: 1, equipmentId: `EQ-${suffix}` }], currency: "USD", cargoMode: "FCL", reefer: false, dangerousGoods: false, attributes: { tradeLaneId: lane, commodityCode: commodity } }
  });
  return requestJson(`${bookingUrl}/api/bookings/${booking.id}/price`, { method: "POST", body: { idempotencyKey: `${booking.id}:${booking.revision}`, actorSubjectId: "local.booking.user", correlationId: `price-${suffix}` } });
}

async function requestJson(url, options = {}) {
  const headers = { accept: "application/json", ...(options.headers ?? {}) };
  if (options.body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(url, { method: options.method ?? "GET", headers, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}: ${redact(typeof body === "string" ? body : JSON.stringify(body))}`);
  return body;
}

async function waitForHealth(url, attempts = 30) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { await requestJson(url); return; } catch { await new Promise((resolveWait) => setTimeout(resolveWait, 2000)); }
  }
  throw new Error(`probe failed ${url}`);
}

function requireText(text, expected, message, failures) {
  if (!text.includes(expected)) failures.push(message);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function snapshotTotal(booking) {
  return Object.entries(booking.pricingSnapshot?.quotedAmounts ?? {})
    .filter(([key]) => /^line\.\d+\.amount$/.test(key))
    .reduce((total, [, amount]) => total + Number(amount), 0);
}

function gateResult(definition, status, exitCode, summary) {
  return { id: definition.id, section: definition.section, mapsTo: definition.mapsTo, command: redact(definition.command), status, exitCode, artifactPath: `${definition.section}/${definition.id}.txt`, summary };
}

function writeGateEvidence(runDir, result) {
  const path = resolve(runDir, result.artifactPath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `gate=${result.id}\nstatus=${result.status}\nexitCode=${result.exitCode ?? ""}\ncommand=${result.command}\n\n${result.summary}\n`);
}

function indexArtifacts(runDir) {
  const artifacts = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (!new Set(["manifest.json", "index.md"]).has(entry.name)) {
        const content = readFileSync(path);
        artifacts.push({ path: manifestPath(relative(runDir, path)), sha256: sha256(content), bytes: content.length });
      }
    }
  };
  visit(runDir);
  return artifacts.sort((left, right) => left.path.localeCompare(right.path));
}

function renderIndex(manifest) {
  const lines = [`# W2-03 Live Acceptance - ${manifest.runId}`, "", `Status: ${manifest.status}`, "", "| Gate | Status | Story | Evidence |", "|---|---|---|---|"];
  for (const item of manifest.gates) lines.push(`| ${item.id} | ${item.status} | ${item.mapsTo.join(", ")} | ${item.artifactPath} |`);
  lines.push("", "## Artifacts", "");
  for (const artifact of manifest.artifacts) lines.push(`- ${artifact.path} sha256=${artifact.sha256}`);
  return `${lines.join("\n")}\n`;
}

function resolveEvidenceRun(path, runId) {
  const root = resolve(path);
  if (existsSync(resolve(root, "manifest.json"))) return root;
  if (runId && existsSync(resolve(root, runId, "manifest.json"))) return resolve(root, runId);
  if (!existsSync(root)) return null;
  const candidates = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && existsSync(resolve(root, entry.name, "manifest.json"))).map((entry) => entry.name).sort();
  return candidates.length === 0 ? null : resolve(root, candidates.at(-1));
}

function runCommand(command) {
  return spawnSync(command, { shell: true, encoding: "utf8", timeout: 900000, env: { ...process.env, ...isolatedEnv } });
}

export function redact(value) {
  return String(value).replace(/(TOKEN|PASSWORD|SECRET|COOKIE)=([^\s;]+)/gi, "$1=<redacted>").replace(/(lc_session=)[^\s;]+/gi, "$1<redacted>");
}

export function resolveBashExecutable({ platform = process.platform, env = process.env, pathExists = existsSync } = {}) {
  const override = env.W2_03_BASH_PATH?.trim();
  if (override) return override;
  if (platform !== "win32") return "bash";
  const candidates = [
    join(env.ProgramFiles ?? "C:\\Program Files", "Git", "bin", "bash.exe"),
    join(env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe")
  ];
  return candidates.find((candidate) => pathExists(candidate)) ?? "bash";
}

export function runAudit(name, options = {}) {
  const scripts = {
    aidlc: ".claude/skills/aidlc-audit/detectors.sh",
    "erp-fidelity": ".claude/skills/erp-fidelity-audit/detectors.sh"
  };
  const script = scripts[name];
  if (!script) return { status: 1, stdout: "", stderr: `unknown audit ${name}` };
  return (options.runner ?? spawnSync)(options.executable ?? resolveBashExecutable(), [script], { encoding: "utf8", timeout: 300000 });
}

function sha256(content) { return createHash("sha256").update(content).digest("hex"); }
function writeJson(path, value) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`); }
function commandPath(value) { return value.replaceAll("\\", "/"); }
function manifestPath(value) { return value.replaceAll("\\", "/"); }
function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  try {
    if (argv.includes("--preflight")) {
      const result = validateLivePreflight();
      if (result.status !== "PASS") throw new Error(`PRECHECK_BLOCKED ${result.failures.join("; ")}`);
      console.log(JSON.stringify(result, null, 2));
    } else if (valueAfter(argv, "--probe")) {
      await waitForHealth(valueAfter(argv, "--probe"));
      console.log(JSON.stringify({ status: "PASS", url: valueAfter(argv, "--probe") }, null, 2));
    } else if (valueAfter(argv, "--journey")) {
      console.log(JSON.stringify(await runLiveJourney(valueAfter(argv, "--journey")), null, 2));
    } else if (valueAfter(argv, "--verify-restart")) {
      console.log(JSON.stringify(await verifyRestartPersistence(valueAfter(argv, "--verify-restart")), null, 2));
    } else if (valueAfter(argv, "--audit")) {
      const result = runAudit(valueAfter(argv, "--audit"));
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      if (result.status !== 0) process.exitCode = result.status ?? 1;
    } else if (argv.includes("--validate")) {
      const result = validateEvidencePackage(valueAfter(argv, "--output-root") ?? "artifacts/w2-03-live", { runId: valueAfter(argv, "--run-id"), requirePass: argv.includes("--require-pass") });
      console.log(JSON.stringify(result, null, 2));
      if (result.status !== "PASS") process.exitCode = 1;
    } else {
      const manifest = runW203Acceptance({ dryRun: argv.includes("--dry-run"), outputRoot: valueAfter(argv, "--output-root"), runId: valueAfter(argv, "--run-id") });
      console.log(JSON.stringify({ status: manifest.status, runId: manifest.runId }, null, 2));
      if (manifest.status === "FAILED") process.exitCode = 1;
    }
  } catch (error) {
    console.error(redact(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}
