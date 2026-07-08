import test from "node:test";
import assert from "node:assert/strict";
import { REQUIRED_EVENTS, validateContractCatalog } from "./validate-contract-catalog.mjs";

test("contract catalog validates", () => {
  const result = validateContractCatalog();

  assert.equal(result.valid, true, result.failures.join("\n"));
  assert.equal(result.catalog.contracts.length, 3);
});

test("catalog includes every reference-data event type", () => {
  const result = validateContractCatalog();
  const eventContract = result.catalog.contracts.find((contract) => contract.contractId === "event-reference-data-changed");

  assert.deepEqual(eventContract.eventTypes.sort(), [...REQUIRED_EVENTS].sort());
});
