import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function verifyU02RoutePreservation(root = repositoryRoot) {
  const failures = [];
  const fixture = json(root, "apps/charge-agreements/test/fixtures/u02-preservation.json");
  const nginx = text(root, "infrastructure/nginx/default.conf");
  const compose = text(root, "compose.yaml");
  const nextConfig = text(root, "apps/charge-agreements/next.config.mjs");
  const waveEnv = env(text(root, "infrastructure/env/wave-a.env.example"));

  requireText(nginx, "location = /charge-agreements {", failures);
  requireText(nginx, "return 308 /charge-agreements/;", failures);
  requireText(nginx, "location ^~ /charge-agreements/ {", failures);
  requireText(nginx, "proxy_pass http://apps-charge-agreements:3000;", failures);
  for (const route of fixture.preservedEdgeRoutes) {
    if (route === "/") requireText(nginx, "location / {", failures);
    else requireText(nginx, `location ${route}/ {`, failures);
  }
  requireText(nextConfig, `basePath: "${fixture.chargeBasePath}"`, failures);
  requireText(compose,
    "http://127.0.0.1:3000/charge-agreements/api/health", failures);
  if (waveEnv.LINERCORE_COMPOSE_PROJECT !== fixture.waveA.project) {
    failures.push("Wave A project changed");
  }
  if (waveEnv.NGINX_HOST_PORT !== `127.0.0.1:${fixture.waveA.nginxHostPort}`) {
    failures.push("Wave A nginx binding changed");
  }

  const migrationDir = path.join(root,
    "services/charge-agreement-service/dataaccess/src/main/resources/db/migration");
  const actualMigrations = readdirSync(migrationDir).filter((name) => /^V\d+__.*\.sql$/.test(name)).sort();
  const expectedMigrations = Object.keys(fixture.chargeFlywaySha256).sort();
  if (JSON.stringify(actualMigrations) !== JSON.stringify(expectedMigrations)) {
    failures.push("Charge Flyway migration set changed");
  }
  for (const [name, expected] of Object.entries(fixture.chargeFlywaySha256)) {
    const migration = path.join(migrationDir, name);
    if (!existsSync(migration)) continue;
    const actual = createHash("sha256").update(readFileSync(migration)).digest("hex");
    if (actual !== expected) failures.push(`Charge Flyway migration changed: ${name}`);
  }

  const chargeAppStart = compose.indexOf("  apps-charge-agreements:");
  const chargeAppEnd = compose.indexOf("\n  apps-booking:", chargeAppStart);
  const u02Runtime = [
    text(root, "apps/charge-agreements/lib/bff/config.ts"),
    compose.slice(chargeAppStart, chargeAppEnd),
    text(root, "infrastructure/env/wave-a.env.example")
  ].join("\n");
  if (/(?:^|[^0-9])8088(?:[^0-9]|$)/.test(u02Runtime)) {
    failures.push("U02 runtime targets forbidden manager port 8088");
  }
  if (/linercore-manager/i.test(u02Runtime)) failures.push("U02 runtime targets manager project");
  return failures;
}

function requireText(source, expected, failures) {
  if (!source.includes(expected)) failures.push(`missing required route/config: ${expected}`);
}

function text(root, relative) {
  return readFileSync(path.join(root, relative), "utf8");
}

function json(root, relative) {
  return JSON.parse(text(root, relative));
}

function env(source) {
  return Object.fromEntries(source.split(/\r?\n/).map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const failures = verifyU02RoutePreservation();
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("U02 route, base-path, Wave A, and migration preservation: PASS");
}
