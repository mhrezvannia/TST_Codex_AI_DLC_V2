import { execFileSync } from "node:child_process";

const project = process.env.DEMO_COMPOSE_PROJECT ?? "linercore-shared-platform";
const demoTag = process.env.DEMO_IMAGE_TAG ?? "demo-20260721";
const edgeUrl = process.env.DEMO_EDGE_URL ?? "http://127.0.0.1:8088";

const requiredServices = new Set([
  "postgres",
  "keycloak",
  "kafka",
  "schema-registry",
  "identity-service",
  "reference-data-service",
  "charge-agreement-service",
  "booking-service",
  "container-movement-service",
  "apps-auth",
  "apps-shell",
  "apps-reference-data",
  "apps-charge-agreements",
  "apps-booking",
  "nginx",
]);

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

const runningServices = new Set();
const imageFailures = [];

for (const containerId of containerIds) {
  const inspection = JSON.parse(docker("inspect", containerId))[0];
  const labels = inspection.Config.Labels ?? {};
  const service = labels["com.docker.compose.service"];
  if (service) runningServices.add(service);

  const source = inspection.Config.Image;
  if (!source.startsWith("linercore/")) continue;

  const separator = source.lastIndexOf(":");
  const repository = separator === -1 ? source : source.slice(0, separator);
  let lockedImage;
  try {
    lockedImage = docker("image", "inspect", "--format", "{{.Id}}", `${repository}:${demoTag}`);
  } catch {
    imageFailures.push(`${repository}:${demoTag} is missing`);
    continue;
  }

  if (lockedImage !== inspection.Image) {
    imageFailures.push(`${repository}:${demoTag} does not match the running demo image`);
  }
}

const missingServices = [...requiredServices].filter((service) => !runningServices.has(service));

async function probe(path, accepted) {
  const response = await fetch(`${edgeUrl}${path}`, { redirect: "manual" });
  if (!accepted(response.status)) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  return response.status;
}

const routeResults = await Promise.all([
  probe("/health", (status) => status === 200),
  probe("/booking", (status) => status >= 200 && status < 400),
  probe("/reference-data", (status) => status >= 200 && status < 400),
  probe("/charge-agreements", (status) => status >= 200 && status < 400),
]);

if (missingServices.length > 0 || imageFailures.length > 0) {
  for (const service of missingServices) console.error(`Missing demo service: ${service}`);
  for (const failure of imageFailures) console.error(`Image lock failure: ${failure}`);
  process.exit(1);
}

console.log(
  `Demo guard PASS: ${containerIds.length} containers, ${runningServices.size} services, routes ${routeResults.join(", ")}`,
);
