import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyContractProviders } from "./verify-contract-providers.mjs";

test("verifies offline provider contract coverage", async () => {
  const result = await verifyContractProviders();

  assert.equal(result.valid, true, result.failures.join("\n"));
  assert.equal(result.checks.some((check) => check.name.includes("/internal/identity/authorize") && check.status === "ok"), true);
  assert.equal(result.checks.some((check) => check.name.includes("/api/pricing/quote") && check.status === "ok"), true);
  assert.equal(result.checks.some((check) => check.name.includes("booking-events.yaml declares booking.confirmed") && check.status === "ok"), true);
  assert.equal(result.checks.some((check) => check.name === "live provider verification" && check.status === "skipped"), true);
  assert.equal(result.healthSnapshot.overallStatus, "green");
});

test("verifies required booking and movement Avro fields", async () => {
  const result = await verifyContractProviders();

  assert.equal(result.valid, true, result.failures.join("\n"));
  assert.equal(result.checks.some((check) => check.name.includes("event-booking-confirmed booking.confirmed field idempotencyKey") && check.status === "ok"), true);
  assert.equal(result.checks.some((check) => check.name.includes("event-container-movement-status containermovement.status field sequenceNumber") && check.status === "ok"), true);
});

test("verifies HTTP Pact and message-pact fixtures", async () => {
  const result = await verifyContractProviders();

  assert.equal(result.valid, true, result.failures.join("\n"));
  assert.equal(result.checks.some((check) => check.name.includes("booking-charge-pricing-fixtures.json response status") && check.status === "ok"), true);
  assert.equal(result.checks.some((check) => check.name.includes("booking-confirmed-message-fixtures.json payload example exists") && check.status === "ok"), true);
  assert.equal(result.checks.some((check) => check.name.includes("container-movement-status-message-fixtures.json payload example exists") && check.status === "ok"), true);
});

test("verification fails when required OpenAPI path is missing", async () => {
  await usingFixture(async (root) => {
    const path = join(root, "contracts/openapi/charge-agreements.yaml");
    const contents = readFileSync(path, "utf8").replace("/api/pricing/quote", "/api/pricing/estimate");
    writeFileSync(path, contents);

    const result = await verifyContractProviders({ root });

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /missing provider path/);
  });
});

test("verification fails when a required Avro field is missing", async () => {
  await usingFixture(async (root) => {
    const path = join(root, "contracts/avro/containermovement.status.avsc");
    const schema = JSON.parse(readFileSync(path, "utf8"));
    schema.fields = schema.fields.filter((field) => field.name !== "sequenceNumber");
    writeFileSync(path, `${JSON.stringify(schema, null, 2)}\n`);

    const result = await verifyContractProviders({ root });

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /missing required Avro field/);
  });
});

test("verification fails when message-pact payload example is missing", async () => {
  await usingFixture(async (root) => {
    const path = join(root, "contracts/pact/booking-confirmed-message-fixtures.json");
    const fixture = JSON.parse(readFileSync(path, "utf8"));
    fixture.payloadExample = "contracts/examples/missing-booking-confirmed.json";
    writeFileSync(path, `${JSON.stringify(fixture, null, 2)}\n`);

    const result = await verifyContractProviders({ root });

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /missing payload example/);
  });
});

test("CLI writes evidence file", async () => {
  await usingFixture((root) => {
    const evidenceFile = join(root, "artifacts/contracts-verification.json");
    execFileSync(process.execPath, [join(process.cwd(), "scripts/verify-contract-providers.mjs"), "--evidence-file", evidenceFile], {
      cwd: root,
      stdio: "pipe"
    });
    const evidence = JSON.parse(readFileSync(evidenceFile, "utf8"));

    assert.equal(evidence.status, "ok");
    assert.equal(evidence.healthSnapshot.overallStatus, "green");
  });
});

test("live provider verification reports service failures", async () => {
  const result = await verifyContractProviders({
    live: true,
    identityServiceUrl: "http://127.0.0.1:1",
    referenceDataServiceUrl: "http://127.0.0.1:1"
  });

  assert.equal(result.valid, false);
  assert.equal(result.failures.some((failure) => failure.includes("identity roles")), true);
  assert.equal(result.failures.some((failure) => failure.includes("reference sets")), true);
});

async function usingFixture(callback) {
  const root = mkdtempSync(join(tmpdir(), "contract-verify-"));
  try {
    cpSync("contracts", join(root, "contracts"), { recursive: true });
    await callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
