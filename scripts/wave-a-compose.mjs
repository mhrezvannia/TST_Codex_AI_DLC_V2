import { spawnSync } from "node:child_process";
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
