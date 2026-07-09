import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_EVENT_SCHEMAS, validateContractCatalog } from "./validate-contract-catalog.mjs";

const REQUIRED_OPENAPI_PATHS = {
  "contracts/openapi/reference-data-service.yaml": [
    "/reference-sets",
    "/reference-sets/{set}/records",
    "/reference-sets/{set}/records/{id}",
    "/reference-sets/{set}/records/{id}/history",
    "/reference-sets/events"
  ],
  "contracts/openapi/identity-service.yaml": [
    "/internal/identity/authorize",
    "/internal/identity/effective-permissions",
    "/internal/identity/roles",
    "/internal/identity/roles/assign"
  ],
  "contracts/openapi/charge-agreements.yaml": [
    "/api/charge-agreements",
    "/api/charge-agreements/active-lookup",
    "/api/pricing/quote",
    "/api/pricing/dnd"
  ]
};

const REQUIRED_FIXTURES = [
  {
    path: "contracts/pact/booking-charge-pricing-fixtures.json",
    type: "http",
    contractId: "pact-booking-charge-pricing",
    requiredKeys: ["fixtureId", "provider", "consumer", "interactionId", "requestShape", "responseShape", "verificationStatus"]
  },
  {
    path: "contracts/pact/booking-charge-dnd-fixtures.json",
    type: "http",
    contractId: "pact-booking-charge-dnd",
    requiredKeys: ["fixtureId", "provider", "consumer", "interactionId", "requestShape", "responseShape", "verificationStatus"]
  },
  {
    path: "contracts/pact/booking-confirmed-message-fixtures.json",
    type: "message",
    contractId: "message-pact-booking-confirmed",
    requiredKeys: ["fixtureId", "producer", "consumer", "topic", "keyExample", "headerExample", "payloadExample", "orderingMetadata", "verificationStatus"]
  },
  {
    path: "contracts/pact/container-movement-status-message-fixtures.json",
    type: "message",
    contractId: "message-pact-container-movement-status",
    requiredKeys: ["fixtureId", "producer", "consumer", "topic", "keyExample", "headerExample", "payloadExample", "orderingMetadata", "verificationStatus"]
  }
];

const REQUIRED_ASYNCAPI_CHANNELS = {
  "contracts/asyncapi/reference-data-events.yaml": ["referencedata.currency.changed"],
  "contracts/asyncapi/booking-events.yaml": ["booking.confirmed"],
  "contracts/asyncapi/container-movement-events.yaml": ["containermovement.status"]
};

export async function verifyContractProviders(options = {}) {
  const root = options.root ?? process.cwd();
  const live = options.live ?? false;
  const checks = [];
  const failures = [];
  const catalog = validateContractCatalog(root);
  push(checks, failures, "contract catalog", catalog.valid, catalog.failures.join("; "));

  verifyOpenApiPaths(root, checks, failures);
  verifyAsyncApiChannels(root, checks, failures);
  verifyAvroSchemas(root, checks, failures);
  verifyFixtures(root, checks, failures);

  if (live) {
    await checkLive("identity roles", `${options.identityServiceUrl ?? process.env.IDENTITY_SERVICE_URL ?? "http://localhost:8082"}/internal/identity/roles`, checks, failures);
    await checkLive("reference sets", `${options.referenceDataServiceUrl ?? process.env.REFERENCE_DATA_SERVICE_URL ?? "http://localhost:8083"}/reference-sets`, checks, failures);
  } else {
    checks.push({ name: "live provider verification", status: "skipped", reason: "run with --live when services are available" });
  }

  const healthSnapshot = buildVerificationSnapshot(checks, failures, catalog.healthSnapshot);
  return { valid: failures.length === 0, failures, checks, healthSnapshot };
}

function verifyAsyncApiChannels(root, checks, failures) {
  for (const [path, channels] of Object.entries(REQUIRED_ASYNCAPI_CHANNELS)) {
    const absolutePath = resolve(root, path);
    const contents = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
    push(checks, failures, `${path} exists`, contents.length > 0, "missing AsyncAPI artifact");
    for (const channel of channels) {
      push(checks, failures, `${path} declares ${channel}`, contents.includes(channel), "missing AsyncAPI channel");
    }
  }
}

function verifyOpenApiPaths(root, checks, failures) {
  for (const [path, requiredPaths] of Object.entries(REQUIRED_OPENAPI_PATHS)) {
    const absolutePath = resolve(root, path);
    const contents = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
    push(checks, failures, `${path} exists`, contents.length > 0, "missing OpenAPI artifact");
    for (const requiredPath of requiredPaths) {
      push(checks, failures, `${path} declares ${requiredPath}`, contents.includes(requiredPath), "missing provider path");
    }
  }
}

function verifyAvroSchemas(root, checks, failures) {
  for (const [contractId, expected] of Object.entries(REQUIRED_EVENT_SCHEMAS)) {
    for (const eventType of expected.eventTypes) {
      const schemaPath = resolve(root, "contracts/avro", `${eventType}.avsc`);
      const schema = existsSync(schemaPath) ? JSON.parse(readFileSync(schemaPath, "utf8")) : null;
      push(checks, failures, `${eventType} avro record`, schema?.type === "record" && Boolean(schema?.name), "invalid Avro record schema");
      const fieldNames = new Set((schema?.fields ?? []).map((field) => field.name));
      for (const field of expected.requiredFields) {
        push(checks, failures, `${contractId} ${eventType} field ${field}`, fieldNames.has(field), "missing required Avro field");
      }
    }
  }
}

function verifyFixtures(root, checks, failures) {
  for (const fixtureSpec of REQUIRED_FIXTURES) {
    const absolutePath = resolve(root, fixtureSpec.path);
    const fixture = existsSync(absolutePath) ? JSON.parse(readFileSync(absolutePath, "utf8")) : null;
    push(checks, failures, `${fixtureSpec.path} exists`, Boolean(fixture), "missing fixture artifact");
    if (!fixture) continue;
    push(checks, failures, `${fixtureSpec.path} contract id`, fixture.contractId === fixtureSpec.contractId, "fixture contractId mismatch");
    for (const key of fixtureSpec.requiredKeys) {
      push(checks, failures, `${fixtureSpec.path} ${key}`, fixture[key] !== undefined && fixture[key] !== "", "missing fixture field");
    }
    if (fixtureSpec.type === "http") {
      push(checks, failures, `${fixtureSpec.path} request method`, Boolean(fixture.requestShape?.method), "missing request method");
      push(checks, failures, `${fixtureSpec.path} response status`, Number.isInteger(fixture.responseShape?.status), "missing response status");
    }
    if (fixtureSpec.type === "message") {
      push(checks, failures, `${fixtureSpec.path} payload example exists`, existsSync(resolve(root, fixture.payloadExample ?? "")), "missing payload example");
    }
  }
}

function push(checks, failures, name, condition, reason) {
  if (condition) {
    checks.push({ name, status: "ok" });
  } else {
    checks.push({ name, status: "failed", reason });
    failures.push(`${name}: ${reason}`);
  }
}

async function checkLive(name, url, checks, failures) {
  try {
    const response = await fetch(url);
    push(checks, failures, name, response.ok, `HTTP ${response.status}`);
  } catch (error) {
    push(checks, failures, name, false, error instanceof Error ? error.message : String(error));
  }
}

function buildVerificationSnapshot(checks, failures, catalogSnapshot) {
  return {
    snapshotId: `contract-verification-${new Date().toISOString()}`,
    generatedAt: new Date().toISOString(),
    overallStatus: failures.length > 0 ? "red" : "green",
    checkCount: checks.length,
    failedCheckCount: failures.length,
    blockingFailures: failures,
    catalogHealth: catalogSnapshot ?? null
  };
}

function parseArgs(argv) {
  const args = { live: false, evidenceFile: null };
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === "--live") args.live = true;
    if (argv[index] === "--evidence-file") args.evidenceFile = argv[++index];
  }
  return args;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const result = await verifyContractProviders({ live: args.live });
  const payload = { status: result.valid ? "ok" : "failed", ...result };
  if (args.evidenceFile) {
    const evidencePath = resolve(args.evidenceFile);
    mkdirSync(dirname(evidencePath), { recursive: true });
    writeFileSync(evidencePath, `${JSON.stringify(payload, null, 2)}\n`);
  }
  console.log(JSON.stringify(payload, null, 2));
  if (!result.valid) {
    process.exit(1);
  }
}
