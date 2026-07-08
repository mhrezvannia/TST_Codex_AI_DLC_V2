import test from "node:test";
import assert from "node:assert/strict";
import { verifyContractProviders } from "./verify-contract-providers.mjs";

test("verifies offline provider contract coverage", async () => {
  const result = await verifyContractProviders();

  assert.equal(result.valid, true, result.failures.join("\n"));
  assert.equal(result.checks.some((check) => check.name.includes("/internal/identity/authorize") && check.status === "ok"), true);
  assert.equal(result.checks.some((check) => check.name === "live provider verification" && check.status === "skipped"), true);
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
