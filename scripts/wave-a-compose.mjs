import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, "infrastructure", "env", "wave-a.env.example");
export const WAVE_A_SEQUENTIAL_BUILD_SERVICES = Object.freeze([
  "apps-auth",
  "apps-booking",
  "apps-charge-agreements",
  "apps-reference-data",
  "apps-shell",
  "booking-service",
  "charge-agreement-service",
  "container-movement-service",
  "identity-service",
  "reference-data-service"
]);

const composeBaseArgs = (env) => {
  const args = [
    "compose",
    "--env-file",
    envFile,
    "--project-name",
    "linercore-wave-a"
  ];
  const profiles = (env.WAVE_A_COMPOSE_PROFILES ?? "app")
    .split(",")
    .map((profile) => profile.trim())
    .filter(Boolean);
  for (const profile of profiles) args.push("--profile", profile);
  return args;
};

export function planWaveAComposeInvocations(command, env = process.env) {
  const base = composeBaseArgs(env);
  const acceptanceUpIndex = command.indexOf("acceptance-up");
  if (acceptanceUpIndex < 0) return [[...base, ...command]];

  const globalArgs = command.slice(0, acceptanceUpIndex);
  const waitArgs = command.slice(acceptanceUpIndex + 1);
  const usePrebuiltImages = env.WAVE_A_ACCEPTANCE_USE_PREBUILT === "1";
  return [
    ...(usePrebuiltImages
      ? []
      : WAVE_A_SEQUENTIAL_BUILD_SERVICES.map((service) => [...base, ...globalArgs, "build", service])),
    [...base, ...globalArgs, "up", "-d", "--no-build", "--wait", ...waitArgs]
  ];
}

export function runWaveACompose(command = process.argv.slice(2), env = process.env, runner = spawnSync) {
  if (command.length === 0) {
    console.error("Usage: node scripts/wave-a-compose.mjs <compose command> [arguments]");
    return 2;
  }

  try {
    validateWaveAConfiguration();
  } catch (error) {
    console.error(`Wave A configuration rejected: ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  }

  for (const args of planWaveAComposeInvocations(command, env)) {
    const result = runner("docker", args, {
      cwd: root,
      env,
      stdio: "inherit"
    });
    if (result.error) {
      console.error(result.error.message);
      return 1;
    }
    if (result.status !== 0) return result.status ?? 1;
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(runWaveACompose());
}

export function validateWaveAConfiguration() {
  const values = parseEnv(readFileSync(envFile, "utf8"));
  const compose = readFileSync(path.join(root, "compose.yaml"), "utf8");
  const nginx = readFileSync(path.join(root, "infrastructure", "nginx", "default.conf"), "utf8");
  const requiredSecrets = [
    "AUTH_SESSION_SECRET",
    "CHARGE_BFF_ASSERTION_SECRET",
    "CHARGE_SERVICE_TOKEN",
    "CHARGE_PRICING_SERVICE_TOKEN",
    "REFERENCE_DATA_CHARGE_TOKEN"
  ];

  if (values.LINERCORE_COMPOSE_PROJECT !== "linercore-wave-a"
    || values.LINERCORE_NETWORK_NAME !== "linercore-wave-a-network"
    || values.LINERCORE_CONTAINER_ENV_FILE !== "./infrastructure/env/wave-a.env.example") {
    throw new Error("Wave A project/network topology drift detected");
  }
  for (const [name, value] of Object.entries(values)) {
    if (name.endsWith("_HOST_PORT")) {
      if (!/^127\.0\.0\.1:\d+$/.test(value)) {
        throw new Error(`${name} must use an explicit loopback binding`);
      }
      if (Number(value.slice(value.lastIndexOf(":") + 1)) === 8088) {
        throw new Error(`${name} must not target the manager port 8088`);
      }
    }
  }
  if (values.NGINX_HOST_PORT !== "127.0.0.1:18088") {
    throw new Error("Wave A nginx must stay on 127.0.0.1:18088");
  }
  if (values.CHARGE_PRICING_SERVICE_ID !== "booking-service") {
    throw new Error("Wave A pricing caller must be booking-service");
  }
  for (const name of requiredSecrets) {
    if (!values[name]?.trim()) throw new Error(`${name} is required`);
  }
  if (values.AUTH_SESSION_SECRET === values.CHARGE_BFF_ASSERTION_SECRET) {
    throw new Error("AUTH_SESSION_SECRET and CHARGE_BFF_ASSERTION_SECRET must differ");
  }
  if (!compose.includes("apps-charge-agreements:")
    || !compose.includes("reference-data-service:")
    || !compose.includes("charge-agreement-service:")
    || !nginx.includes("location ^~ /charge-agreements/")) {
    throw new Error("required Wave A topology or Charge route is missing");
  }
  if (/linercore-manager/i.test(compose + nginx + JSON.stringify(values))) {
    throw new Error("manager project target is forbidden");
  }
}

function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      if (separator < 1) throw new Error(`malformed Wave A environment line: ${line}`);
      return [line.slice(0, separator), line.slice(separator + 1)];
    }));
}
