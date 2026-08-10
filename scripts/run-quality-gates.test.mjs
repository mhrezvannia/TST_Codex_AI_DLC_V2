import test from "node:test";
import assert from "node:assert/strict";
import { aggregate, classifyChangedPaths, runPolicyChecks, selectGates } from "./run-quality-gates.mjs";

test("classifies changed paths into gate scopes", () => {
  const scopes = classifyChangedPaths([
    "services/reference-data-service/domain-core/src/main/java/Foo.java",
    "apps/reference-data/app/page.tsx",
    "apps/auth/app/api/auth/sign-out/route.ts",
    "apps/booking/app/bookings/page.tsx",
    "apps/shell/app/booking/page.tsx",
    "packages/auth/src/session.ts",
    "packages/shared-types/src/booking.ts",
    "contracts/openapi/reference-data-service.yaml",
    "infrastructure/seeds/shared-platform-mvp-defaults.json",
    "scripts/w2-01-live-acceptance.mjs"
  ]);

  assert.deepEqual(scopes, ["apps/auth", "apps/booking", "apps/reference-data", "apps/shell", "contracts", "packages", "packages/auth", "packages/shared-types", "seeds", "services", "w2-01-live", "workspace"]);
});

test("selects workspace gates plus affected gates", () => {
  const gates = selectGates(["workspace", "contracts"]);

  assert.ok(gates.some((gate) => gate.id === "policy-package-manager"));
  assert.ok(gates.some((gate) => gate.id === "contracts-validate"));
  assert.equal(gates.some((gate) => gate.id === "frontend-reference-data-test"), false);
});

test("selects W2-01 shell and live gates for affected scopes", () => {
  const gates = selectGates(["workspace", "apps/shell", "packages/auth", "packages/shared-types", "w2-01-live"]);
  const gateIds = gates.map((gate) => gate.id);

  assert.ok(gateIds.includes("frontend-shell-test"));
  assert.ok(gateIds.includes("package-auth-test"));
  assert.ok(gateIds.includes("package-shared-types-test"));
  assert.ok(gateIds.includes("w2-01-live-acceptance"));
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
