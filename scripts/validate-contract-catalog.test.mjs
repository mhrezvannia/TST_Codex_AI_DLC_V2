import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  REQUIRED_CONTRACT_IDS,
  REQUIRED_EVENT_SCHEMAS,
  REQUIRED_EVENTS,
  validateContractCatalog
} from "./validate-contract-catalog.mjs";

test("contract catalog validates first-release executable coverage", () => {
  const result = validateContractCatalog();

  assert.equal(result.valid, true, result.failures.join("\n"));
  assert.equal(result.catalog.contracts.length, REQUIRED_CONTRACT_IDS.length);
  assert.equal(result.healthSnapshot.overallStatus, "green");
});

test("catalog includes every required reference-data event type", () => {
  const result = validateContractCatalog();
  const eventContract = result.catalog.contracts.find((contract) => contract.contractId === "event-reference-data-changed");

  assert.deepEqual(eventContract.eventTypes.sort(), [...REQUIRED_EVENTS].sort());
});

test("catalog includes booking and container movement event schemas", () => {
  const result = validateContractCatalog();

  for (const [contractId, expected] of Object.entries(REQUIRED_EVENT_SCHEMAS)) {
    const eventContract = result.catalog.contracts.find((contract) => contract.contractId === contractId);
    assert.ok(eventContract, `${contractId} must exist`);
    assert.deepEqual(eventContract.eventTypes.sort(), [...expected.eventTypes].sort());
  }
});

test("validation fails when required metadata is missing", () => {
  usingFixture((root) => {
    const catalog = readCatalog(root);
    delete catalog.contracts[0].compatibilityMode;
    writeCatalog(root, catalog);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /compatibilityMode is required/);
  });
});

test("validation fails on invalid semantic version", () => {
  usingFixture((root) => {
    const catalog = readCatalog(root);
    catalog.contracts[0].version = "v1";
    writeCatalog(root, catalog);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /version must be semantic version/);
  });
});

test("validation fails on invalid compatibility state", () => {
  usingFixture((root) => {
    const catalog = readCatalog(root);
    catalog.contracts[0].compatibilityStatus = "green";
    writeCatalog(root, catalog);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /compatibilityStatus is invalid/);
  });
});

test("validation fails when a required seam artifact is missing", () => {
  usingFixture((root) => {
    rmSync(join(root, "contracts/pact/booking-charge-pricing-fixtures.json"));

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /pact-booking-charge-pricing artifact missing/);
  });
});

test("validation fails on invalid JSON fixture", () => {
  usingFixture((root) => {
    writeFileSync(join(root, "contracts/pact/booking-charge-pricing-fixtures.json"), "{");

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /invalid JSON artifact/);
  });
});

test("validation fails when required event schema fields are missing", () => {
  usingFixture((root) => {
    const schemaPath = join(root, "contracts/avro/booking.confirmed.avsc");
    const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
    schema.fields = schema.fields.filter((field) => field.name !== "idempotencyKey");
    writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /booking.confirmed schema missing field idempotencyKey/);
  });
});

test("markdown-only contracts cannot satisfy readiness", () => {
  usingFixture((root) => {
    const catalog = readCatalog(root);
    catalog.contracts[0].kind = "markdown";
    catalog.contracts[0].lifecycleStatus = "draft_document";
    writeCatalog(root, catalog);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /not executable readiness evidence/);
  });
});

test("validation writes a red health snapshot for blocking failures", () => {
  usingFixture((root) => {
    const catalog = readCatalog(root);
    catalog.contracts[0].compatibilityStatus = "green";
    writeCatalog(root, catalog);

    const result = validateContractCatalog(root, { healthFile: "artifacts/contracts-health.json" });
    const health = JSON.parse(readFileSync(join(root, "artifacts/contracts-health.json"), "utf8"));

    assert.equal(result.valid, false);
    assert.equal(health.overallStatus, "red");
    assert.ok(health.blockingFailures.length > 0);
  });
});

test("validation blocks still out-of-scope downstream runtime creation", () => {
  usingFixture((root) => {
    mkdirSync(join(root, "services/container-movement-service"), { recursive: true });

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /downstream runtime out of scope: services\/container-movement-service/);
  });
});

function usingFixture(callback) {
  const root = mkdtempSync(join(tmpdir(), "contract-catalog-"));
  try {
    cpSync("contracts", join(root, "contracts"), { recursive: true });
    callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function readCatalog(root) {
  return JSON.parse(readFileSync(join(root, "contracts/catalog/contract-catalog.json"), "utf8"));
}

function writeCatalog(root, catalog) {
  writeFileSync(join(root, "contracts/catalog/contract-catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
}
