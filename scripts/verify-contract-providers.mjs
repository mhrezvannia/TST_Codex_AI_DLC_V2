import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_EVENTS, validateContractCatalog } from "./validate-contract-catalog.mjs";

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
  ]
};

export async function verifyContractProviders(options = {}) {
  const root = options.root ?? process.cwd();
  const live = options.live ?? false;
  const checks = [];
  const failures = [];
  const catalog = validateContractCatalog(root);
  push(checks, failures, "contract catalog", catalog.valid, catalog.failures.join("; "));

  for (const [path, requiredPaths] of Object.entries(REQUIRED_OPENAPI_PATHS)) {
    const absolutePath = resolve(root, path);
    const contents = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
    push(checks, failures, `${path} exists`, contents.length > 0, "missing OpenAPI artifact");
    for (const requiredPath of requiredPaths) {
      push(checks, failures, `${path} declares ${requiredPath}`, contents.includes(requiredPath), "missing provider path");
    }
  }

  for (const eventType of REQUIRED_EVENTS) {
    const schemaPath = resolve(root, "contracts/avro", `${eventType}.avsc`);
    const schema = existsSync(schemaPath) ? JSON.parse(readFileSync(schemaPath, "utf8")) : null;
    push(checks, failures, `${eventType} avro record`, schema?.type === "record" && Boolean(schema?.name), "invalid Avro record schema");
  }

  if (live) {
    await checkLive("identity roles", `${options.identityServiceUrl ?? process.env.IDENTITY_SERVICE_URL ?? "http://localhost:8082"}/internal/identity/roles`, checks, failures);
    await checkLive("reference sets", `${options.referenceDataServiceUrl ?? process.env.REFERENCE_DATA_SERVICE_URL ?? "http://localhost:8083"}/reference-sets`, checks, failures);
  } else {
    checks.push({ name: "live provider verification", status: "skipped", reason: "run with --live when services are available" });
  }

  return { valid: failures.length === 0, failures, checks };
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
    writeFileSync(resolve(args.evidenceFile), `${JSON.stringify(payload, null, 2)}\n`);
  }
  console.log(JSON.stringify(payload, null, 2));
  if (!result.valid) {
    process.exit(1);
  }
}
