#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROFILE_FILE = "infrastructure/runtime/profiles.json";
const ENV_FILE = "infrastructure/env/local.env.example";
const OPERATIONS = new Set(["plan", "start", "stop", "reset", "logs", "health"]);

export function loadRuntimeProfiles(root = process.cwd()) {
  const filePath = join(root, PROFILE_FILE);
  if (!existsSync(filePath)) throw new Error(`missing runtime profile metadata: ${PROFILE_FILE}`);
  const metadata = JSON.parse(readFileSync(filePath, "utf8"));
  const validation = validateRuntimeProfileMetadata(metadata);
  if (!validation.valid) throw new Error(validation.failures.join("; "));
  return metadata;
}

export function validateRuntimeProfileMetadata(metadata) {
  const failures = [];
  const identities = metadata.serviceIdentities ?? [];
  for (const identity of identities) {
    for (const key of ["serviceName", "clientId", "audience", "issuer"]) {
      if (!identity[key]) failures.push(`service identity missing ${key}`);
    }
    if (!Array.isArray(identity.capabilities) || identity.capabilities.length === 0) {
      failures.push(`service identity ${identity.serviceName ?? "(unknown)"} requires capabilities`);
    }
    if (identity.issuer && !identity.issuer.includes("/realms/linercore-local")) {
      failures.push(`service identity ${identity.serviceName} must use local realm issuer`);
    }
  }
  return { valid: failures.length === 0, failures };
}

export function getRuntimeProfile(profileName, metadata = loadRuntimeProfiles()) {
  const profile = metadata.profiles.find((candidate) => candidate.name === profileName);
  if (!profile) throw new Error(`unknown runtime profile: ${profileName}`);
  return profile;
}

export function composeCommandFor(operation, profileName, options = {}) {
  if (!OPERATIONS.has(operation)) throw new Error(`unknown runtime operation: ${operation}`);
  getRuntimeProfile(profileName, options.metadata ?? loadRuntimeProfiles(options.root));
  if (operation === "plan") return ["node", "scripts/local-runtime.mjs", "plan", "--profile", profileName, "--dry-run"];
  if (operation === "health") return ["node", "scripts/local-readiness.mjs", "--profile", profileName];

  const base = ["docker", "compose", "--profile", profileName];
  if (operation === "start") return [...base, "up", "-d", "--build"];
  if (operation === "stop") return [...base, "stop"];
  if (operation === "reset") return [...base, "down", "--volumes", "--remove-orphans"];
  return [...base, "logs", options.follow ? "-f" : "--tail=200"];
}

export function validateLocalEnvExample(root = process.cwd()) {
  const filePath = join(root, ENV_FILE);
  const failures = [];
  if (!existsSync(filePath)) return { valid: false, failures: [`missing ${ENV_FILE}`] };

  const contents = readFileSync(filePath, "utf8");
  const requiredKeys = [
    "LOCAL_RUNTIME_MODE",
    "LOCAL_RUNTIME_PROFILE",
    "AUTH_BYPASS",
    "HOST_RUNTIME",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "KEYCLOAK_ADMIN",
    "KEYCLOAK_ADMIN_PASSWORD",
    "KEYCLOAK_REALM",
    "KEYCLOAK_CALLBACK_URL",
    "JWT_ISSUER_URI",
    "AUTH_CLIENT_ID",
    "AUTH_AUDIENCE",
    "IDENTITY_SERVICE_CLIENT_ID",
    "REFERENCE_DATA_SERVICE_CLIENT_ID",
    "KAFKA_BOOTSTRAP_SERVERS",
    "SCHEMA_REGISTRY_URL",
    "NGINX_HEALTH_URL"
  ];

  for (const key of requiredKeys) {
    if (!new RegExp(`^${key}=`, "m").test(contents)) failures.push(`${key} is required in ${ENV_FILE}`);
  }
  for (const line of contents.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (/password|secret|token/i.test(line) && !/(local|admin|false|example|placeholder)/i.test(line)) {
      failures.push(`non-local secret-looking value in ${ENV_FILE}: ${line.split("=")[0]}`);
    }
    if (/prod|staging|vault:\/\//i.test(line)) {
      failures.push(`non-local environment reference in ${ENV_FILE}: ${line.split("=")[0]}`);
    }
  }

  return { valid: failures.length === 0, failures };
}

export function buildRuntimePlan(profileName, metadata = loadRuntimeProfiles()) {
  const profile = getRuntimeProfile(profileName, metadata);
  return {
    profile: profile.name,
    description: profile.description,
    readinessState: profile.readinessState,
    services: profile.services,
    serviceIdentities: (metadata.serviceIdentities ?? []).filter((identity) => profile.services.includes(identity.serviceName)),
    ports: metadata.ports.filter((port) => port.requiredProfiles.includes(profile.name)),
    ideModes: metadata.ideModes
  };
}

function parseArgs(argv) {
  const operation = OPERATIONS.has(argv[0]) ? argv[0] : "plan";
  return {
    operation,
    profile: valueAfter(argv, "--profile") ?? process.env.LOCAL_RUNTIME_PROFILE ?? "core",
    dryRun: argv.includes("--dry-run"),
    follow: argv.includes("--follow")
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const metadata = loadRuntimeProfiles();
  const envValidation = validateLocalEnvExample();
  if (!envValidation.valid) {
    console.error(JSON.stringify({ status: "failed", failures: envValidation.failures }, null, 2));
    process.exit(1);
  }

  if (args.operation === "plan" || args.dryRun) {
    console.log(JSON.stringify({
      status: "ok",
      operation: args.operation,
      command: composeCommandFor(args.operation, args.profile, { metadata, follow: args.follow }),
      plan: buildRuntimePlan(args.profile, metadata)
    }, null, 2));
  } else {
    const command = composeCommandFor(args.operation, args.profile, { metadata, follow: args.follow });
    const result = spawnSync(command[0], command.slice(1), { stdio: "inherit", shell: process.platform === "win32" });
    process.exit(result.status ?? 1);
  }
}
