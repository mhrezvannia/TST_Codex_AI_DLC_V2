import { existsSync, readFileSync } from "node:fs";
import { validateSeedPack } from "./seed-local.mjs";

const seedFile = "infrastructure/seeds/shared-platform-mvp-defaults.json";
const composeFile = "compose.yaml";
const nginxFile = "infrastructure/nginx/default.conf";

const failures = [];
const checks = [];

function pass(name, details = {}) {
  checks.push({ name, status: "ok", ...details });
}

function fail(name, reason) {
  failures.push({ name, reason });
  checks.push({ name, status: "failed", reason });
}

if (!existsSync(seedFile)) {
  fail("seed pack exists", `${seedFile} is missing`);
} else {
  const pack = JSON.parse(readFileSync(seedFile, "utf8"));
  const validation = validateSeedPack(pack);
  if (validation.valid) {
    pass("seed pack validates", { seedPackId: pack.seedPackId, seedVersion: pack.seedVersion });
  } else {
    fail("seed pack validates", validation.errors.join("; "));
  }
}

const compose = existsSync(composeFile) ? readFileSync(composeFile, "utf8") : "";
for (const service of ["postgres", "keycloak", "kafka", "schema-registry", "identity-service", "reference-data-service", "apps-auth", "apps-reference-data", "nginx", "seed-loader"]) {
  if (compose.includes(`${service}:`)) {
    pass(`compose service ${service} present`);
  } else {
    fail(`compose service ${service} present`, "service is not declared");
  }
}

const nginx = existsSync(nginxFile) ? readFileSync(nginxFile, "utf8") : "";
for (const route of ["/auth/", "/reference-data/", "/health"]) {
  if (nginx.includes(route)) {
    pass(`nginx route ${route} present`);
  } else {
    fail(`nginx route ${route} present`, "route is not declared");
  }
}

if (compose.includes("observability") && compose.includes("profiles: [\"observability\"]")) {
  pass("observability profile remains optional");
} else {
  fail("observability profile remains optional", "optional observability profile marker is missing");
}

if (failures.length > 0) {
  console.error(JSON.stringify({ status: "failed", failures, checks }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: "ok", checks }, null, 2));
