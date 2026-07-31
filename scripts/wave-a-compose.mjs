import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, "infrastructure", "env", "wave-a.env.example");
const command = process.argv.slice(2);

if (command.length === 0) {
  console.error("Usage: node scripts/wave-a-compose.mjs <compose command> [arguments]");
  process.exit(2);
}

validateWaveAConfiguration();

const profiles = (process.env.WAVE_A_COMPOSE_PROFILES ?? "app")
  .split(",")
  .map((profile) => profile.trim())
  .filter(Boolean);

const args = [
  "compose",
  "--env-file",
  envFile,
  "--project-name",
  "linercore-wave-a",
];

for (const profile of profiles) {
  args.push("--profile", profile);
}

args.push(...command);

const result = spawnSync("docker", args, {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

function validateWaveAConfiguration() {
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
    || values.LINERCORE_NETWORK_NAME !== "linercore-wave-a-network") {
    fail("Wave A project/network topology drift detected");
  }
  for (const [name, value] of Object.entries(values)) {
    if (name.endsWith("_HOST_PORT")) {
      if (!/^127\.0\.0\.1:\d+$/.test(value)) fail(`${name} must use an explicit loopback binding`);
      if (Number(value.slice(value.lastIndexOf(":") + 1)) === 8088) {
        fail(`${name} must not target the manager port 8088`);
      }
    }
  }
  if (values.NGINX_HOST_PORT !== "127.0.0.1:18088") {
    fail("Wave A nginx must stay on 127.0.0.1:18088");
  }
  if (values.CHARGE_PRICING_SERVICE_ID !== "booking-service") {
    fail("Wave A pricing caller must be booking-service");
  }
  for (const name of requiredSecrets) {
    if (!values[name]?.trim()) fail(`${name} is required`);
  }
  if (values.AUTH_SESSION_SECRET === values.CHARGE_BFF_ASSERTION_SECRET) {
    fail("AUTH_SESSION_SECRET and CHARGE_BFF_ASSERTION_SECRET must differ");
  }
  if (!compose.includes("apps-charge-agreements:")
    || !compose.includes("reference-data-service:")
    || !compose.includes("charge-agreement-service:")
    || !nginx.includes("location ^~ /charge-agreements/")) {
    fail("required Wave A topology or Charge route is missing");
  }
  if (/linercore-manager/i.test(compose + nginx + JSON.stringify(values))) {
    fail("manager project target is forbidden");
  }
}

function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      if (separator < 1) fail(`malformed Wave A environment line: ${line}`);
      return [line.slice(0, separator), line.slice(separator + 1)];
    }));
}

function fail(message) {
  console.error(`Wave A configuration rejected: ${message}`);
  process.exit(2);
}
