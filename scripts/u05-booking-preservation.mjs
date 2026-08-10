import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const INCOMPATIBLE_U05_ROWS_SQL = `SELECT
  (SELECT count(*) FROM booking_records
   WHERE snapshot_version >= 2
     AND snapshot::jsonb ?| ARRAY[
       'pricingAmendmentSeq',
       'pricingInputFingerprint',
       'pricingStatus',
       'currentPricingRequestId',
       'currentPriceAmendmentSeq',
       'currentPriceInputFingerprint',
       'pricingFailureEvidence'
     ])
  +
  (SELECT count(*) FROM booking_idempotency
   WHERE operation = 'PRICE' OR idempotency_key LIKE 'P|%')
  + (SELECT count(*) FROM booking_pricing_snapshots)
AS incompatible_u05_rows;`;

export function evaluateU05Preservation(repositoryRoot = root) {
  const failures = [];
  const baseline = json(repositoryRoot, "artifacts/u05/booking-preservation-baseline.json");
  const migrationDir = path.join(repositoryRoot,
    "services/booking-service/dataaccess/src/main/resources/db/migration");
  const migrations = readdirSync(migrationDir).filter((name) => /^V\d+__.*\.sql$/.test(name)).sort();
  if (JSON.stringify(migrations) !== JSON.stringify([
    "V1__booking_baseline.sql", "V2__booking_w1.sql", "V3__booking_pricing_snapshots.sql",
    "V4__immutable_booking_pricing_snapshots.sql"
  ])) failures.push("Booking Flyway catalog must be exactly V1-V4");
  for (const name of ["V1__booking_baseline.sql", "V2__booking_w1.sql"]) {
    const relative = `services/booking-service/dataaccess/src/main/resources/db/migration/${name}`;
    const expected = baseline?.baselineHashes?.[relative];
    if (!expected) failures.push(`baseline hash missing: ${name}`);
    else if (shaHistoricalText(path.join(migrationDir, name)) !== expected) failures.push(`immutable migration changed: ${name}`);
  }
  for (const required of [
    "services/booking-service/dataaccess/src/main/resources/db/migration/V3__booking_pricing_snapshots.sql",
    "services/booking-service/dataaccess/src/main/resources/db/migration/V4__immutable_booking_pricing_snapshots.sql",
    "services/booking-service/dataaccess/src/main/java/com/linercore/platform/booking/dataaccess/jdbc/BookingSnapshotCodec.java",
    "services/booking-service/dataaccess/src/test/java/com/linercore/platform/booking/dataaccess/jdbc/BookingSnapshotCodecTest.java",
    "services/booking-service/container/src/main/java/com/linercore/platform/booking/container/integration/HttpChargePricingClient.java",
    "apps/booking/app/api/bookings/[bookingId]/price/route.ts",
    "contracts/openapi/booking-pricing.v1.yaml",
    "contracts/pact/booking-bff-pricing-fixtures.json"
  ]) if (!existsSync(path.join(repositoryRoot, required))) failures.push(`missing U05 preservation seam: ${required}`);
  const client = text(repositoryRoot,
    "services/booking-service/container/src/main/java/com/linercore/platform/booking/container/integration/HttpChargePricingClient.java");
  for (const marker of ["X-LinerCore-Service-Id", "X-LinerCore-Service-Token", "X-Correlation-Id"]) {
    if (!client.includes(marker)) failures.push(`missing trusted client marker: ${marker}`);
  }
  if (client.includes("X-LinerCore-Actor-Id")) failures.push("legacy actor identity must not be sent to Charge");
  const deployment = text(repositoryRoot,
    "aidlc/spaces/default/intents/260721-charge-tariff-agreements/construction/U05-booking-consumption-repricing/infrastructure-design/deployment-architecture.md");
  if (!normalize(deployment).includes(normalize(INCOMPATIBLE_U05_ROWS_SQL))) {
    failures.push("exact incompatible_u05_rows predicate changed");
  }
  const compose = text(repositoryRoot, "compose.yaml");
  const waveEnv = text(repositoryRoot, "infrastructure/env/wave-a.env.example");
  if (!compose.includes("BOOKING_CHARGE_SERVICE_TOKEN")) failures.push("local trusted pricing token seam missing");
  if (!waveEnv.includes("NGINX_HOST_PORT=127.0.0.1:18088")) failures.push("Wave A port 18088 changed");
  if (serviceBlock(compose, "booking-service", "container-movement-service").includes("8088")) {
    failures.push("Booking service block targets manager port 8088");
  }
  return failures;
}

function serviceBlock(source, startName, endName) {
  const start = source.indexOf(`  ${startName}:`);
  const end = source.indexOf(`\n  ${endName}:`, start);
  return source.slice(start, end < 0 ? source.length : end);
}
// The U05 baseline was captured from a Windows checkout. Normalize text to its
// historical CRLF representation so the immutable-content check is portable.
function shaHistoricalText(file) {
  const historical = readFileSync(file, "utf8").replace(/^\uFEFF/, "").replace(/\r\n?|\n/g, "\r\n");
  return createHash("sha256").update(historical, "utf8").digest("hex");
}
function text(repositoryRoot, relative) { return readFileSync(path.join(repositoryRoot, relative), "utf8"); }
function json(repositoryRoot, relative) { return JSON.parse(text(repositoryRoot, relative)); }
function normalize(value) { return value.replace(/\s+/g, " ").trim(); }

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const failures = evaluateU05Preservation();
  if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
  console.log("U05 Booking preservation: PASS");
}
