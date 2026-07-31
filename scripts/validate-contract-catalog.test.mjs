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

test("catalog synchronizes the additive U04 provider, consumer, Pact, and terminal matrix", () => {
  const result = validateContractCatalog();
  const api = result.catalog.contracts.find((contract) => contract.contractId === "api-charge-agreement-service");
  const pact = result.catalog.contracts.find((contract) => contract.contractId === "pact-booking-charge-pricing");

  assert.equal(result.valid, true, result.failures.join("\n"));
  assert.equal(api.version, "1.1.0");
  assert.equal(pact.version, "1.1.0");
  assert.equal(api.sourceService, pact.sourceService);
  assert.equal(api.consumerService, pact.consumerService);
  assert.ok(api.examples.includes("contracts/examples/pricing-u04-terminal-matrix.json"));
});

test("U04 matrix rejects partial enrichment and string money", () => {
  usingFixture((root) => {
    const path = join(root, "contracts/examples/pricing-u04-terminal-matrix.json");
    const matrix = JSON.parse(readFileSync(path, "utf8"));
    const success = matrix.scenarios.find((scenario) => scenario.scenarioId === "agreement-success");
    delete success.response.charges[0].sourceRateVersionId;
    success.response.charges[1].unitRate = "20.01";
    writeFileSync(path, `${JSON.stringify(matrix, null, 2)}\n`);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /all-or-none enriched line fields/);
    assert.match(result.failures.join("\n"), /amount\/unitRate\/quantity must be JSON numbers/);
  });
});

test("U04 matrix rejects terminal status, reason, and retry drift", () => {
  usingFixture((root) => {
    const matrixPath = join(root, "contracts/examples/pricing-u04-terminal-matrix.json");
    const fixturePath = join(root, "contracts/pact/booking-charge-pricing-fixtures.json");
    const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    matrix.scenarios.find((scenario) => scenario.scenarioId === "no-rate").status = 422;
    matrix.scenarios.find((scenario) => scenario.scenarioId === "ambiguous-base-rate").response.reasonCode = "NO_RATE";
    matrix.scenarios.find((scenario) => scenario.scenarioId === "pricing-in-progress").expectedHeaders["Retry-After"] = "3";
    fixture.interactions.find((interaction) => interaction.scenarioId === "pricing-in-progress").expectedHeaders["Retry-After"] = "3";
    writeFileSync(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`);
    writeFileSync(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /no-rate.status must be 404/);
    assert.match(result.failures.join("\n"), /ambiguous-base-rate.reasonCode must be AMBIGUOUS_BASE_RATE/);
    assert.match(result.failures.join("\n"), /Retry-After: 1/);
  });
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
    const data = schema.fields.find((field) => field.name === "data").type;
    data.fields = data.fields.filter((field) => field.name !== "bookingId");
    writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

    const result = validateContractCatalog(root);

    assert.equal(result.valid, false);
    assert.match(result.failures.join("\n"), /booking.confirmed schema missing field data.bookingId/);
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

test("validation permits runtimes delivered by later vertical intents", () => {
  usingFixture((root) => {
    mkdirSync(join(root, "services/container-movement-service"), { recursive: true });
    mkdirSync(join(root, "apps/booking"), { recursive: true });

    const result = validateContractCatalog(root);

    assert.equal(result.valid, true, result.failures.join("\n"));
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
