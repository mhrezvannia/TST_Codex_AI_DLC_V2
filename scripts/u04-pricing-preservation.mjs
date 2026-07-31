import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const INCOMPATIBLE_U04_ROWS_SQL = `SELECT
  (SELECT count(*) FROM pricing_requests
   WHERE terminal_schema_version = 'pricing.v1'
      OR terminal_http_status IS NOT NULL
      OR terminal_pricing_request_id IS NOT NULL
      OR manual_case_id IS NOT NULL)
  +
  (SELECT count(*) FROM manual_pricing_cases
   WHERE booking_ref IS NOT NULL
      OR amendment_seq IS NOT NULL
      OR request_hash IS NOT NULL)
  AS incompatible_u04_rows;`;

export function verifyU04PricingPreservation(root = repositoryRoot) {
  const failures = [];
  const fixture = json(root, "apps/charge-agreements/test/fixtures/u03-agreement-preservation.json");
  const migrationDir = path.join(root,
    "services/charge-agreement-service/dataaccess/src/main/resources/db/migration");
  const actualMigrations = readdirSync(migrationDir)
    .filter((name) => /^V\d+__.*\.sql$/.test(name)).sort();
  const expectedMigrations = Object.keys(fixture.chargeFlywaySha256).sort();
  if (JSON.stringify(actualMigrations) !== JSON.stringify(expectedMigrations)) {
    failures.push("V1-V4 migration catalog changed");
  }
  for (const [name, expected] of Object.entries(fixture.chargeFlywaySha256)) {
    const actual = createHash("sha256")
      .update(readFileSync(path.join(migrationDir, name))).digest("hex");
    if (actual !== expected) failures.push(`immutable migration changed: ${name}`);
  }

  for (const required of [
    "services/charge-agreement-service/dataaccess/src/test/java/com/linercore/platform/chargeagreement/dataaccess/ChargeMigrationCatalogTest.java",
    "services/charge-agreement-service/dataaccess/src/test/java/com/linercore/platform/chargeagreement/dataaccess/ChargeFlywayPostgresTest.java",
    "services/charge-agreement-service/dataaccess/src/test/java/com/linercore/platform/chargeagreement/dataaccess/jdbc/JdbcRateRepositoryConcurrencyPostgresTest.java",
    "services/charge-agreement-service/container/src/test/java/com/linercore/platform/chargeagreement/container/security/ChargeSubjectAssertionVerifierTest.java",
    "services/charge-agreement-service/dataaccess/src/test/java/com/linercore/platform/chargeagreement/dataaccess/jdbc/JdbcW2AgreementRepositoryPostgresTest.java",
    "services/charge-agreement-service/messaging/src/test/java/com/linercore/platform/chargeagreement/messaging/KafkaAgreementEventPublisherSerdeTest.java",
    "contracts/pact/booking-charge-pricing-fixtures.json"
  ]) {
    if (!existsSync(path.join(root, required))) failures.push(`missing preservation oracle: ${required}`);
  }

  const receiptRepository = text(root,
    "services/charge-agreement-service/dataaccess/src/main/java/com/linercore/platform/chargeagreement/dataaccess/jdbc/JdbcPricingRequestRepository.java");
  const caseRepository = text(root,
    "services/charge-agreement-service/dataaccess/src/main/java/com/linercore/platform/chargeagreement/dataaccess/jdbc/JdbcManualPricingCaseRepository.java");
  requireText(receiptRepository, "readReceipt", failures, "terminal receipt decode");
  requireText(receiptRepository, "legacy terminal receipt lacks exact W2 replay evidence",
    failures, "legacy receipt fail-closed marker");
  requireText(receiptRepository, "PricingReceiptUnavailableException", failures, "incomplete legacy fail-closed");
  requireText(caseRepository, "legacyEvidence", failures, "legacy case decode");

  for (const route of fixture.u01RateBffRoutes) {
    if (!existsSync(path.join(root, route))) failures.push(`missing U01/U02 route: ${route}`);
  }
  const policies = text(root, "apps/charge-agreements/lib/bff/policies.ts");
  requireText(policies, 'assertionMode: "SUBJECT_ASSERTION_V1"', failures, "U02 assertion");
  requireText(policies, "/api/manual-pricing-cases", failures, "U04 manual provider route");
  const applicationLocal = text(root,
    "services/charge-agreement-service/container/src/main/resources/application-local.yaml");
  requireText(applicationLocal,
    "enabled: ${CHARGE_AGREEMENT_OUTBOX_RELAY_ENABLED:false}", failures, "disabled U03 relay");

  const bookingFixture = text(root, "contracts/pact/booking-charge-pricing-fixtures.json");
  const terminalMatrix = text(root, "contracts/examples/pricing-u04-terminal-matrix.json");
  for (const marker of ["provider", "consumer", "agreement-success", "tariff-success",
    "no-rate", "ambiguous-agreement-authority", "ambiguous-base-rate",
    "ambiguous-surcharge-rate", "ambiguous-local-rate", "idempotency-conflict",
    "pricing-in-progress", "contracts/examples/pricing-u04-terminal-matrix.json"]) {
    requireText(bookingFixture, marker, failures, `Booking fixture ${marker}`);
  }
  for (const marker of [
    "AGREEMENT", "TARIFF", "NO_RATE", "AMBIGUOUS_AGREEMENT_AUTHORITY",
    "AMBIGUOUS_BASE_RATE", "AMBIGUOUS_SURCHARGE_RATE", "AMBIGUOUS_LOCAL_RATE",
    "IDEMPOTENCY_CONFLICT", "PRICING_IN_PROGRESS"
  ]) {
    requireText(terminalMatrix, marker, failures, `terminal matrix ${marker}`);
  }

  const deployment = text(root,
    "aidlc/spaces/default/intents/260721-charge-tariff-agreements/construction/U04-pricing-provider-manual-cases/infrastructure-design/deployment-architecture.md");
  if (!normalize(deployment).includes(normalize(INCOMPATIBLE_U04_ROWS_SQL))) {
    failures.push("exact incompatible_u04_rows rollback predicate changed");
  }

  const compose = text(root, "compose.yaml");
  const waveEnv = text(root, "infrastructure/env/wave-a.env.example");
  const pricingIdentityFilter = text(root,
    "services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/PricingServiceIdentityFilter.java");
  for (const [source, marker, label] of [
    [applicationLocal, "maximum-pool-size: ${CHARGE_DATASOURCE_MAX_POOL_SIZE:10}", "Hikari pool bound"],
    [applicationLocal, "connection-timeout: ${CHARGE_DATASOURCE_CONNECTION_TIMEOUT_MS:2000}", "Hikari wait bound"],
    [applicationLocal, "service-token: ${CHARGE_PRICING_SERVICE_TOKEN:}", "blank-default pricing token"],
    [pricingIdentityFilter,
      'this.expectedServiceToken = required(expectedServiceToken, "pricing service token");',
      "pricing identity fail-closed"],
    [compose, "CHARGE_PRICING_SERVICE_ID: ${CHARGE_PRICING_SERVICE_ID:-booking-service}", "local pricing service id"],
    [compose, "CHARGE_PRICING_SERVICE_TOKEN: ${CHARGE_PRICING_SERVICE_TOKEN:-pricing_booking_local_token}", "local pricing service token"],
    [compose, '- "${NGINX_HOST_PORT:-8088}:80"', "manager-compatible base port"],
    [waveEnv, "NGINX_HOST_PORT=127.0.0.1:18088", "isolated Wave A port"],
    [waveEnv, "CHARGE_PRICING_SERVICE_ID=booking-service", "Wave A pricing service id"],
    [waveEnv, "CHARGE_PRICING_SERVICE_TOKEN=pricing_booking_wave_a_local_token", "Wave A pricing service token"]
  ]) {
    requireText(source, marker, failures, label);
  }
  const chargeBlock = serviceBlock(compose, "charge-agreement-service", "booking-service");
  requireText(chargeBlock, "JAVA_TOOL_OPTIONS: -XX:InitialRAMPercentage=20 -XX:MaxRAMPercentage=55",
    failures, "charge JVM memory percentage");
  requireText(chargeBlock, "memory: 384M", failures, "charge container memory");
  const chargeAppBlock = serviceBlock(compose, "apps-charge-agreements", "apps-booking");
  requireText(chargeAppBlock, "NODE_OPTIONS: --max-old-space-size=160",
    failures, "charge UI Node memory");
  requireText(chargeAppBlock, "memory: 256M", failures, "charge UI container memory");
  const postgresBlock = serviceBlock(compose, "postgres", "keycloak");
  requireText(postgresBlock, "memory: 256M", failures, "PostgreSQL container memory");
  const u04Runtime = [
    chargeBlock,
    chargeAppBlock,
    waveEnv.split(/\r?\n/).filter((line) =>
      /^(CHARGE_|NGINX_HOST_PORT|LINERCORE_COMPOSE_PROJECT)/.test(line)).join("\n")
  ].join("\n");
  if (/(?:^|[^0-9])8088(?:[^0-9]|$)/.test(u04Runtime)) {
    failures.push("U04 runtime targets manager port 8088");
  }
  if (/linercore-shared-platform|linercore-manager/i.test(u04Runtime)) {
    failures.push("U04 runtime targets manager Compose project");
  }
  return failures;
}

function serviceBlock(compose, startName, endName) {
  const start = compose.indexOf(`  ${startName}:`);
  const end = compose.indexOf(`\n  ${endName}:`, start);
  return compose.slice(start, end < 0 ? compose.length : end);
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function requireText(source, expected, failures, label) {
  if (!source.includes(expected)) failures.push(`missing ${label}: ${expected}`);
}

function text(root, relative) {
  return readFileSync(path.join(root, relative), "utf8");
}

function json(root, relative) {
  return JSON.parse(text(root, relative));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const failures = verifyU04PricingPreservation();
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("U04 pricing source preservation: PASS");
}
