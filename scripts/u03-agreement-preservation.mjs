import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sha256CanonicalText } from "./canonical-sha256.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function verifyU03AgreementPreservation(root = repositoryRoot) {
  const failures = [];
  const fixture = json(root, "apps/charge-agreements/test/fixtures/u03-agreement-preservation.json");
  const controller = text(root,
    "services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/ChargeAgreementApiController.java");
  const policies = text(root, "apps/charge-agreements/lib/bff/policies.ts");
  const messagingConfiguration = text(root,
    "services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/ChargeAgreementMessagingConfiguration.java");
  const applicationLocal = text(root,
    "services/charge-agreement-service/container/src/main/resources/application-local.yaml");
  const nginx = text(root, "infrastructure/nginx/default.conf");
  const compose = text(root, "compose.yaml");
  const waveEnv = env(text(root, "infrastructure/env/wave-a.env.example"));

  for (const route of fixture.u01RateBffRoutes) {
    if (!existsSync(path.join(root, route))) failures.push(`missing preserved U01 Rate route: ${route}`);
  }
  for (const policyId of fixture.u02AgreementPolicyIds) {
    requireText(policies, `"${policyId}"`, failures);
  }
  requireText(policies, "AGREEMENT_V2_MEDIA_TYPE", failures);
  requireText(policies, 'assertionMode: "SUBJECT_ASSERTION_V1"', failures);
  requireText(policies, 'idempotencyMode: method === "GET" ? "NONE" : "FORWARD_DERIVED"', failures);
  requireText(applicationLocal,
    "enabled: ${CHARGE_AGREEMENT_OUTBOX_RELAY_ENABLED:false}", failures);
  const unsafeRelayActivationPatterns = [
    ["ScheduledOutboxRelay", /ScheduledOutboxRelay/],
    ["publishOutboxBatch", /publishOutboxBatch\s*\(/],
    ["charge-agreement.outbox-relay", /charge-agreement\.outbox-relay/]
  ];
  for (const [name, pattern] of unsafeRelayActivationPatterns) {
    if (pattern.test(messagingConfiguration)) {
      failures.push(`Agreement messaging configuration declares unsafe relay activation path: ${name}`);
    }
  }

  for (const legacyPath of fixture.legacyApiPaths) {
    const normalized = legacyPath.replaceAll("{id}", "{id}");
    const last = normalized.split("/").at(-1);
    if (last === "active-lookup") requireText(controller, '"/active-lookup"', failures);
    else if (["approve", "suspend", "expire"].includes(last)) {
      requireText(controller, `"/{id}/${last}"`, failures);
    } else if (last === "{id}") requireText(controller, '"/{id}"', failures);
    else requireText(controller, '@RequestMapping("/api/charge-agreements")', failures);
  }

  requireText(nginx, "location = /charge-agreements {", failures);
  requireText(nginx, "location ^~ /charge-agreements/ {", failures);
  requireText(compose, "http://127.0.0.1:3000/charge-agreements/api/health", failures);
  if (waveEnv.LINERCORE_COMPOSE_PROJECT !== fixture.waveA.project) {
    failures.push("Wave A project changed");
  }
  if (waveEnv.NGINX_HOST_PORT !== `127.0.0.1:${fixture.waveA.nginxHostPort}`) {
    failures.push("Wave A nginx binding changed");
  }
  if (waveEnv.CHARGE_AGREEMENT_OUTBOX_RELAY_ENABLED !== "false") {
    failures.push("Wave A must explicitly disable the unsafe V3 relay");
  }

  const migrationDir = path.join(root,
    "services/charge-agreement-service/dataaccess/src/main/resources/db/migration");
  const actualMigrations = readdirSync(migrationDir)
    .filter((name) => /^V\d+__.*\.sql$/.test(name)).sort();
  const expectedMigrations = Object.keys(fixture.chargeFlywaySha256).sort();
  if (JSON.stringify(actualMigrations) !== JSON.stringify(expectedMigrations)) {
    failures.push("U01-owned Charge Flyway migration set changed");
  }
  for (const [name, expected] of Object.entries(fixture.chargeFlywaySha256)) {
    const migration = path.join(migrationDir, name);
    if (!existsSync(migration)) continue;
    const actual = sha256CanonicalText(migration);
    if (actual !== expected) failures.push(`U01-owned migration changed: ${name}`);
  }

  const chargeAppStart = compose.indexOf("  apps-charge-agreements:");
  const chargeAppEnd = compose.indexOf("\n  apps-booking:", chargeAppStart);
  const chargeServiceStart = compose.indexOf("  charge-agreement-service:");
  const chargeServiceEnd = compose.indexOf("\n  container-movement-service:", chargeServiceStart);
  const chargeService = compose.slice(chargeServiceStart, chargeServiceEnd);
  requireText(chargeService,
    'CHARGE_AGREEMENT_OUTBOX_RELAY_ENABLED: "false"', failures);
  if (/CHARGE_AGREEMENT_OUTBOX_RELAY_ENABLED:\s*["']?true/i.test(compose)) {
    failures.push("Compose contains an enabled Agreement relay claimant");
  }
  const scopedEnv = Object.entries(waveEnv)
    .filter(([key]) => key.startsWith("CHARGE_") || key === "NGINX_HOST_PORT")
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const u03Runtime = [policies, compose.slice(chargeAppStart, chargeAppEnd), scopedEnv].join("\n");
  if (/(?:^|[^0-9])8088(?:[^0-9]|$)/.test(u03Runtime)) {
    failures.push("U03 runtime targets forbidden manager port 8088");
  }
  if (/linercore-manager/i.test(u03Runtime)) failures.push("U03 runtime targets manager project");
  return failures;
}

function requireText(source, expected, failures) {
  if (!source.includes(expected)) failures.push(`missing preserved contract: ${expected}`);
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
  const failures = verifyU03AgreementPreservation();
  const evidenceFlag = process.argv.indexOf("--evidence");
  const evidencePath = evidenceFlag >= 0 ? process.argv[evidenceFlag + 1] : undefined;
  const evidence = {
    generatedAt: new Date().toISOString(),
    sourcePreservation: {
      status: failures.length ? "failed" : "passed",
      failures
    },
    runtimeUpgradeRestart: {
      status: "blocked",
      reason: "Requires the isolated Docker Compose PostgreSQL stack; source checks do not substitute for V1/V3 upgrade/backfill/restart evidence."
    },
    rollbackEligibility: {
      status: "blocked",
      reason: "Requires measured database/outbox state from the isolated stack."
    }
  };
  if (evidencePath) {
    const output = path.resolve(evidencePath);
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("U03 Agreement source preservation baseline: PASS; live upgrade/restart evidence remains blocked");
}
