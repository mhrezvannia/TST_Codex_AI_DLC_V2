import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_REFERENCE_SETS = [
  "PARTY_CUSTOMER",
  "LOCATION",
  "REGION",
  "VOYAGE",
  "CURRENCY",
  "CHARGE_CODE",
  "EQUIPMENT_TYPE",
  "COMMODITY",
  "TRADE_LANE"
];

export const REQUIRED_ROLES = [
  "pricing",
  "sales",
  "booking-desk",
  "equipment-control",
  "customer-service",
  "finance-read",
  "reference-admin",
  "platform-operator",
  "security-admin"
];

export function loadSeedPack(path) {
  const absolutePath = resolve(path);
  if (!existsSync(absolutePath)) {
    throw new Error(`missing seed file: ${absolutePath}`);
  }
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

export function validateSeedPack(pack) {
  const errors = [];
  requireString(pack, "seedPackId", errors);
  requireString(pack, "seedVersion", errors);
  requireString(pack, "environmentScope", errors);
  if (pack.environmentScope !== "local") {
    errors.push("environmentScope must be local for this seed loader");
  }
  if (!pack.referenceData?.sets || typeof pack.referenceData.sets !== "object") {
    errors.push("referenceData.sets is required");
  }
  for (const setName of REQUIRED_REFERENCE_SETS) {
    const records = pack.referenceData?.sets?.[setName];
    if (!Array.isArray(records) || records.length === 0) {
      errors.push(`referenceData.sets.${setName} must contain at least one record`);
    }
  }
  validateReferenceRecords(pack, errors);
  validateIdentity(pack, errors);
  validateLocalUsers(pack, errors);
  return { valid: errors.length === 0, errors };
}

export function buildSeedRunSummary(pack, existingFingerprints = new Map(), correlationId = randomUUID()) {
  const validation = validateSeedPack(pack);
  const summary = {
    seedPackId: pack.seedPackId,
    seedVersion: pack.seedVersion,
    correlationId,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: validation.errors.length,
    failures: validation.errors,
    records: []
  };
  if (!validation.valid) {
    return summary;
  }
  for (const record of orderedReferenceRecords(pack)) {
    const key = `${record.set}:${record.code}`;
    const fingerprint = fingerprintRecord(pack.seedVersion, record);
    const current = existingFingerprints.get(key);
    const status = current === fingerprint ? "skipped" : current ? "updated" : "created";
    summary[status] += 1;
    summary.records.push({ key, id: record.id, fingerprint, status });
  }
  return summary;
}

export async function applySeedPack(pack, options = {}) {
  const validation = validateSeedPack(pack);
  const correlationId = options.correlationId ?? randomUUID();
  const summary = {
    seedPackId: pack.seedPackId,
    seedVersion: pack.seedVersion,
    correlationId,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: validation.errors.length,
    failures: [...validation.errors],
    records: [],
    identityAssignments: []
  };
  if (!validation.valid) {
    return summary;
  }

  const fetcher = options.fetcher ?? fetch;
  const identityUrl = trimUrl(options.identityServiceUrl ?? process.env.IDENTITY_SERVICE_URL ?? "http://localhost:8082");
  const referenceUrl = trimUrl(options.referenceDataServiceUrl ?? process.env.REFERENCE_DATA_SERVICE_URL ?? "http://localhost:8083");
  const actorTokenReference = options.actorTokenReference ?? process.env.SEED_ACTOR_TOKEN_REFERENCE ?? "local.reference.admin";

  for (const command of buildRoleAssignmentCommands(pack, actorTokenReference, correlationId)) {
    const result = await postJson(fetcher, `${identityUrl}/internal/identity/roles/assign`, command, correlationId);
    const entry = { targetSubjectId: command.targetSubjectId, roleCode: command.roleCode, status: result.ok ? "applied" : "failed" };
    summary.identityAssignments.push(entry);
    if (!result.ok) {
      summary.failed += 1;
      summary.failures.push(`identity role ${command.roleCode} for ${command.targetSubjectId}: ${result.detail}`);
    }
  }

  for (const record of orderedReferenceRecords(pack)) {
    const fingerprint = fingerprintRecord(pack.seedVersion, record);
    const detail = await getJson(fetcher, `${referenceUrl}/reference-sets/${record.set}/records/${encodeURIComponent(record.id)}`, correlationId);
    const command = buildReferenceMutationCommand(record, correlationId);
    const key = `${record.set}:${record.code}`;
    if (detail.ok) {
      const version = Number(detail.data?.version ?? 1);
      const update = await putJson(fetcher, `${referenceUrl}/reference-sets/${record.set}/records/${encodeURIComponent(record.id)}?version=${version}`, command, correlationId);
      if (update.ok) {
        summary.updated += 1;
        summary.records.push({ key, id: record.id, fingerprint, status: "updated" });
      } else {
        summary.failed += 1;
        summary.failures.push(`${key}: ${update.detail}`);
        summary.records.push({ key, id: record.id, fingerprint, status: "failed" });
      }
    } else if (detail.status === 404) {
      const create = await putJson(fetcher, `${referenceUrl}/reference-sets/${record.set}/records/${encodeURIComponent(record.id)}?version=0`, command, correlationId);
      if (create.ok) {
        summary.created += 1;
        summary.records.push({ key, id: record.id, fingerprint, status: "created" });
      } else {
        summary.failed += 1;
        summary.failures.push(`${key}: ${create.detail}`);
        summary.records.push({ key, id: record.id, fingerprint, status: "failed" });
      }
    } else {
      summary.failed += 1;
      summary.failures.push(`${key}: ${detail.detail}`);
      summary.records.push({ key, id: record.id, fingerprint, status: "failed" });
    }
  }

  return summary;
}

export function buildReferenceMutationCommand(record, correlationId) {
  return {
    set: record.set,
    code: record.code,
    displayName: record.displayName,
    attributes: record.attributes ?? {},
    actorSubjectId: "local.reference.admin",
    actorDisplayName: "Local Reference Admin",
    operation: "seed",
    reason: `local seed ${record.id}`,
    correlationId
  };
}

export function buildRoleAssignmentCommands(pack, actorTokenReference = "local.reference.admin", correlationId = randomUUID()) {
  return (pack.identity?.localUsers ?? []).flatMap((user) =>
    (user.roles ?? []).map((roleCode) => ({
      actorTokenReference,
      targetSubjectId: user.username,
      roleCode,
      reason: `local seed role ${roleCode}`,
      expectedVersion: 0,
      correlationId
    }))
  );
}

export function orderedReferenceRecords(pack) {
  const records = [];
  for (const setName of REQUIRED_REFERENCE_SETS) {
    for (const record of pack.referenceData.sets[setName] ?? []) {
      records.push({ ...record, set: setName });
    }
  }
  return records;
}

export function fingerprintRecord(seedVersion, record) {
  const stable = {
    seedVersion,
    set: record.set,
    id: record.id,
    code: record.code,
    displayName: record.displayName,
    status: record.status,
    attributes: sortObject(record.attributes ?? {})
  };
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}

export async function waitForHealth(checks, options = {}) {
  const timeoutMs = options.timeoutMs ?? 30000;
  const intervalMs = options.intervalMs ?? 1000;
  const started = Date.now();
  const pending = new Map(checks.map((check) => [check.name, check]));
  while (pending.size > 0 && Date.now() - started < timeoutMs) {
    for (const [name, check] of [...pending.entries()]) {
      try {
        const response = await fetch(check.url, { method: check.method ?? "GET" });
        if (response.ok) {
          pending.delete(name);
        }
      } catch {
        // Retry until timeout.
      }
    }
    if (pending.size > 0) {
      await new Promise((resolveTimer) => setTimeout(resolveTimer, intervalMs));
    }
  }
  if (pending.size > 0) {
    throw new Error(`unhealthy services: ${[...pending.keys()].join(", ")}`);
  }
}

function validateReferenceRecords(pack, errors) {
  const seen = new Map();
  const declaredKeys = new Set();
  for (const record of orderedReferenceRecords(pack)) {
    const path = `referenceData.sets.${record.set}.${record.code ?? "<missing-code>"}`;
    requireString(record, "id", errors, path);
    requireString(record, "code", errors, path);
    requireString(record, "displayName", errors, path);
    if (!["ACTIVE", "INACTIVE"].includes(record.status)) {
      errors.push(`${path}.status must be ACTIVE or INACTIVE`);
    }
    const naturalKey = `${record.set}:${record.code}`;
    declaredKeys.add(naturalKey);
    const immutable = `${record.set}:${record.code}:${record.id}`;
    if (seen.has(naturalKey) && seen.get(naturalKey) !== immutable) {
      errors.push(`${path} duplicates natural key with different immutable identity`);
    }
    seen.set(naturalKey, immutable);
  }
  for (const record of orderedReferenceRecords(pack)) {
    for (const dependency of record.dependencies ?? []) {
      if (!declaredKeys.has(dependency)) {
        errors.push(`referenceData.sets.${record.set}.${record.code} missing dependency ${dependency}`);
      }
    }
  }
}

function validateIdentity(pack, errors) {
  const roles = pack.identity?.roles ?? [];
  for (const role of REQUIRED_ROLES) {
    if (!roles.includes(role)) {
      errors.push(`identity.roles missing ${role}`);
    }
  }
  for (const link of pack.identity?.rolePermissions ?? []) {
    if (!roles.includes(link.role)) {
      errors.push(`identity.rolePermissions references unknown role ${link.role}`);
    }
  }
}

function validateLocalUsers(pack, errors) {
  const users = [...(pack.identity?.localUsers ?? []), ...(pack.keycloak?.users ?? [])];
  for (const user of users) {
    if (!String(user.username ?? "").startsWith("local.")) {
      errors.push(`local user ${user.username ?? "<missing>"} must use local.* username`);
    }
    if (!String(user.email ?? "example.invalid").endsWith(".invalid")) {
      errors.push(`local user ${user.username} must use non-routable .invalid email`);
    }
  }
}

function requireString(object, field, errors, prefix = "") {
  if (typeof object?.[field] !== "string" || object[field].trim() === "") {
    errors.push(`${prefix ? `${prefix}.` : ""}${field} is required`);
  }
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

function parseArgs(argv) {
  const args = {
    seedFile: "infrastructure/seeds/shared-platform-mvp-defaults.json",
    dryRun: false,
    summaryFile: null,
    wait: false
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--seed-file") {
      args.seedFile = argv[++index];
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--summary-file") {
      args.summaryFile = argv[++index];
    } else if (arg === "--wait") {
      args.wait = true;
    }
  }
  return args;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const pack = loadSeedPack(args.seedFile);
  const validation = validateSeedPack(pack);
  if (!validation.valid) {
    console.error(JSON.stringify({ status: "failed", errors: validation.errors }, null, 2));
    process.exit(1);
  }
  if (args.wait) {
    await waitForHealth([
      { name: "nginx", url: process.env.NGINX_HEALTH_URL ?? "http://localhost:8088/health" },
      { name: "identity-service", url: `${process.env.IDENTITY_SERVICE_URL ?? "http://localhost:8082"}/actuator/health` },
      { name: "reference-data-service", url: `${process.env.REFERENCE_DATA_SERVICE_URL ?? "http://localhost:8083"}/actuator/health` },
      { name: "schema-registry", url: process.env.SCHEMA_REGISTRY_URL ?? "http://localhost:8081" }
    ], { timeoutMs: Number(process.env.SEED_WAIT_TIMEOUT_MS ?? 30000) });
  }
  const summary = args.dryRun ? buildSeedRunSummary(pack) : await applySeedPack(pack);
  const payload = { status: args.dryRun ? "dry-run" : summary.failed > 0 ? "failed" : "applied", ...summary };
  if (args.summaryFile) {
    writeFileSync(resolve(args.summaryFile), `${JSON.stringify(payload, null, 2)}\n`);
  }
  console.log(JSON.stringify(payload, null, 2));
  if (payload.status === "failed") {
    process.exit(1);
  }
}

async function getJson(fetcher, url, correlationId) {
  return requestJson(fetcher, url, { method: "GET" }, correlationId);
}

async function postJson(fetcher, url, body, correlationId) {
  return requestJson(fetcher, url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  }, correlationId);
}

async function putJson(fetcher, url, body, correlationId) {
  return requestJson(fetcher, url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  }, correlationId);
}

async function requestJson(fetcher, url, init, correlationId) {
  try {
    const response = await fetcher(url, {
      ...init,
      headers: { "x-correlation-id": correlationId, ...(init.headers ?? {}) }
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return response.ok
      ? { ok: true, status: response.status, data }
      : { ok: false, status: response.status, detail: JSON.stringify(data) };
  } catch (error) {
    return { ok: false, status: 503, detail: error instanceof Error ? error.message : String(error) };
  }
}

function trimUrl(value) {
  return value.replace(/\/+$/, "");
}
