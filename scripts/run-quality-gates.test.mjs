import test from "node:test";
import assert from "node:assert/strict";
import { aggregate, classifyChangedPaths, runPolicyChecks, selectGates } from "./run-quality-gates.mjs";

test("classifies changed paths into gate scopes", () => {
  const scopes = classifyChangedPaths([
    "services/reference-data-service/domain-core/src/main/java/Foo.java",
    "apps/reference-data/app/page.tsx",
    "contracts/openapi/reference-data-service.yaml",
    "infrastructure/seeds/shared-platform-mvp-defaults.json"
  ]);

  assert.deepEqual(scopes, ["apps/reference-data", "contracts", "seeds", "services", "workspace"]);
});

test("selects workspace gates plus affected gates", () => {
  const gates = selectGates(["workspace", "contracts"]);

  assert.ok(gates.some((gate) => gate.id === "policy-package-manager"));
  assert.ok(gates.some((gate) => gate.id === "contracts-validate"));
  assert.equal(gates.some((gate) => gate.id === "frontend-reference-data-test"), false);
});

test("aggregation fails when required gate fails", () => {
  const result = aggregate([
    { gateId: "a", required: true, status: "passed" },
    { gateId: "b", required: true, status: "failed" },
    { gateId: "c", required: false, status: "failed" }
  ]);

  assert.deepEqual(result, { status: "failed", failedRequired: ["b"] });
});

test("local policy checks pass current workspace", () => {
  assert.deepEqual(runPolicyChecks(), []);
});
