import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import registry from "../tests/u06/acceptance-registry.json" with { type: "json" };
import { encodeSessionCookie } from "../packages/auth/src/index.ts";
import { validateClosedMatrix, SECURITY_IDS } from "../tools/u06/live-gates.mjs";
import { readSignedCookie } from "../tools/u06/readiness-observer.mjs";

const root = path.resolve(".");
const EDGE = "http://127.0.0.1:18088";
const storageState = valueAfter(process.argv, "--storage-state");
const pricingStorageState = valueAfter(process.argv, "--pricing-storage-state");
if (!storageState || !pricingStorageState) throw new Error("--storage-state and --pricing-storage-state are required");
readSignedCookie(root, storageState, new Date());
const pricing = readSignedCookie(root, pricingStorageState, new Date());
const pricingCookie = `${pricing.name}=${pricing.value}`;
const limitedCookie = `lc_session=${encodeSessionCookie(limitedSession(), sessionSecret())}`;
const before = mutationCount();
const evidence = new Map();

evidence.set("SEC-U06-001", await exchange("/charge-agreements/api/agreements?page=1&size=1", {
  headers: { cookie: pricingCookie }
}, (response) => response.status === 200));
evidence.set("SEC-U06-002", await exchange("/charge-agreements/api/manual-cases?page=1", {
  headers: { cookie: limitedCookie }
}, (response, body) => response.status === 403 && !/caseId|pricingRequestId|bookingRef/.test(body)));
evidence.set("SEC-U06-003", await exchange("/charge-agreements/api/rates?page=1", {
  headers: { cookie: limitedCookie, "x-linercore-actor-id": "spoofed-browser-actor", "x-linercore-service-id": "booking-service",
    "x-linercore-capabilities": "charge-agreements:write,manual-pricing:read" }
}, (response, body) => response.status === 403 && !/rateId|agreementId|amount|currency/.test(body)));
evidence.set("SEC-U06-004", await exchange("http://127.0.0.1:18084/pricing-requests", {
  method: "POST", headers: { "content-type": "application/vnd.api.v1+json", "idempotency-key": crypto.randomUUID(),
    "x-correlation-id": crypto.randomUUID() }, body: "{}"
}, (response) => [401, 403].includes(response.status)));

const configTests = command(process.execPath, ["node_modules/vitest/vitest.mjs", "--root", ".", "run",
  "apps/charge-agreements/lib/bff/config.test.ts", "apps/reference-data/lib/service-clients.test.ts"]);
evidence.set("SEC-U06-005", { passed: configTests.status === 0, status: configTests.status,
  body: bounded(configTests.output), assertion: "missing required non-local secrets fail closed" });
evidence.set("SEC-U06-006", { passed: configTests.status === 0, status: configTests.status,
  body: bounded(configTests.output), assertion: "non-local bypass/profile activation is rejected" });

const after = mutationCount();
const members = registry.members.filter((member) => member.category === "SECURITY");
const results = members.map((member) => {
  const id = member.key.split(":")[1];
  const item = evidence.get(id);
  const observation = { id, status: item?.passed && after === before ? "PASS" : "FAIL" };
  const correlationId = `u06-security-${id.toLowerCase()}`;
  return { key: member.key, status: observation.status, scenario: id, correlationId, observation,
    artifactPayloads: {
      "http-evidence": { id, status: item?.status, response: bounded(item?.body ?? ""), assertion: item?.assertion },
      "mutation-count": { id, before, after, delta: after - before },
      "audit-evidence": { id, correlationId, allowed: item?.passed === true, commandStatus: item?.status }
    } };
});
const observations = results.map((result) => result.observation);
if (validateClosedMatrix(SECURITY_IDS, observations) !== "PASS") {
  throw new Error(`security matrix failed: ${JSON.stringify(results.map((result) => ({ key: result.key, status: result.status, evidence: evidence.get(result.observation.id) })))}`);
}
const envelope = { schemaVersion: 1, stage: "security", observedAt: new Date().toISOString(), results };
const output = path.resolve("artifacts/u06/observations/security.json");
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ status: "PASS", observations, mutationDelta: after - before }, null, 2)}\n`);

async function exchange(url, init, assert) {
  const response = await fetch(url.startsWith("http") ? url : `${EDGE}${url}`, { redirect: "manual", ...init });
  const body = await response.text();
  return { passed: assert(response, body), status: response.status, body };
}

function mutationCount() {
  const sql = "SELECT (SELECT COUNT(*) FROM pricing_requests)+(SELECT COUNT(*) FROM manual_pricing_cases)+(SELECT COUNT(*) FROM charge_agreement_activity);";
  const result = command(process.execPath, ["scripts/wave-a-compose.mjs", "exec", "-T", "postgres", "psql", "-U",
    "linercore_pricing", "-X", "-At", "-d", "linercore_pricing", "-c", sql]);
  if (result.status !== 0) throw new Error(`security mutation query failed: ${result.output}`);
  return Number(result.output.trim().split(/\r?\n/).filter(Boolean).at(-1));
}

function command(executable, args) {
  const result = spawnSync(executable, args, { cwd: root, encoding: "utf8", windowsHide: true, timeout: 180_000 });
  return { status: result.status ?? 1, output: `${result.stdout ?? ""}\n${result.stderr ?? ""}` };
}

function limitedSession() {
  const now = new Date();
  return { sessionId: crypto.randomUUID(), subjectId: "local.booking.user", subjectType: "user", displayName: "Limited user",
    email: "limited@example.test", roles: ["booking-desk"], permissions: ["booking:read"], issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 60_000).toISOString(), policyVersion: "u06-security" };
}

function sessionSecret() {
  const text = readFileSync(path.resolve("infrastructure/env/wave-a.env.example"), "utf8");
  const value = text.split(/\r?\n/).find((line) => line.startsWith("AUTH_SESSION_SECRET="))?.split("=").slice(1).join("=").trim();
  if (!value) throw new Error("session secret unavailable");
  return value;
}

function bounded(value) { return String(value).replace(/(authorization|cookie|token|password)=?\S*/gi, "$1=<redacted>").slice(0, 4_000); }
function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }
