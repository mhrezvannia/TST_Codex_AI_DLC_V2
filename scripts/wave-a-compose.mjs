import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, "infrastructure", "env", "wave-a.env.example");
const command = process.argv.slice(2);

if (command.length === 0) {
  console.error("Usage: node scripts/wave-a-compose.mjs <compose command> [arguments]");
  process.exit(2);
}

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
