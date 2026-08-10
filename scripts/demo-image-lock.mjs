import { execFileSync } from "node:child_process";

const project = process.env.DEMO_COMPOSE_PROJECT ?? "linercore-shared-platform";
const demoTag = process.env.DEMO_IMAGE_TAG ?? "demo-20260721";
const seedWaveA = process.argv.includes("--seed-wave-a");

function docker(...args) {
  return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

const containerIds = docker(
  "ps",
  "--filter",
  `label=com.docker.compose.project=${project}`,
  "--format",
  "{{.ID}}",
)
  .split(/\r?\n/)
  .filter(Boolean);

if (containerIds.length === 0) {
  throw new Error(`No running containers found for demo project ${project}`);
}

const locked = new Map();

for (const containerId of containerIds) {
  const inspection = JSON.parse(docker("inspect", containerId))[0];
  const source = inspection.Config.Image;
  if (!source.startsWith("linercore/")) continue;

  const separator = source.lastIndexOf(":");
  const repository = separator === -1 ? source : source.slice(0, separator);
  if (locked.has(repository)) continue;

  docker("image", "tag", inspection.Image, `${repository}:${demoTag}`);
  if (seedWaveA) docker("image", "tag", inspection.Image, `${repository}:wave-a`);
  locked.set(repository, inspection.Image);
}

console.log(
  `Locked ${locked.size} running LinerCore images as ${demoTag}` +
    (seedWaveA ? " and seeded wave-a" : ""),
);
