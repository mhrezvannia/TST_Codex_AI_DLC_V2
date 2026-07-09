import test from "node:test";
import assert from "node:assert/strict";
import { classifyStep, runLocalReadiness } from "./local-readiness.mjs";
import { buildRuntimePlan, composeCommandFor, loadRuntimeProfiles, validateLocalEnvExample, validateRuntimeProfileMetadata } from "./local-runtime.mjs";

test("classifies blocked prerequisite output separately from failures", () => {
  const step = { id: "prerequisites", command: "x", blockedWhen: ["\"status\": \"blocked\""] };
  const result = classifyStep(step, { status: 1, stdout: "{\"status\": \"blocked\"}", stderr: "" });

  assert.equal(result.status, "blocked");
});

test("readiness aggregate reports blocked when only blocked checks fail", () => {
  const evidence = runLocalReadiness({
    steps: [
      { id: "a", command: "pass" },
      { id: "b", command: "blocked", blockedWhen: ["fetch failed"] }
    ],
    runner: (command) => command === "pass"
      ? { status: 0, stdout: "ok", stderr: "" }
      : { status: 1, stdout: "fetch failed", stderr: "" }
  });

  assert.equal(evidence.status, "blocked");
  assert.deepEqual(evidence.summary, { passed: 1, blocked: 1, failed: 0 });
  assert.equal(evidence.readinessState, "blocked");
});

test("readiness aggregate reports failed for non-blocked failures", () => {
  const evidence = runLocalReadiness({
    steps: [{ id: "a", command: "fail" }],
    runner: () => ({ status: 1, stdout: "assertion failed", stderr: "" })
  });

  assert.equal(evidence.status, "failed");
});

test("runtime metadata exposes all required profiles", () => {
  const metadata = loadRuntimeProfiles();
  const profiles = metadata.profiles.map((profile) => profile.name).sort();

  assert.deepEqual(profiles, ["app", "core", "devtools", "full", "observability"]);
});

test("full runtime plan includes app, core, devtool, and observability services", () => {
  const plan = buildRuntimePlan("full");

  assert.equal(plan.readinessState, "evidence_ready");
  assert.ok(plan.services.includes("postgres"));
  assert.ok(plan.services.includes("identity-service"));
  assert.ok(plan.services.includes("contract-devtools"));
  assert.ok(plan.services.includes("grafana"));
  assert.ok(plan.serviceIdentities.some((identity) => identity.clientId === "linercore-identity-service"));
});

test("compose command generation is profile-aware and non-destructive by default", () => {
  assert.deepEqual(composeCommandFor("start", "core"), ["docker", "compose", "--profile", "core", "up", "-d", "--build"]);
  assert.deepEqual(composeCommandFor("health", "app"), ["node", "scripts/local-readiness.mjs", "--profile", "app"]);
});

test("local env example is present and secret-safe", () => {
  const validation = validateLocalEnvExample();

  assert.equal(validation.valid, true, validation.failures.join("\n"));
});

test("runtime metadata exposes local service identities", () => {
  const metadata = loadRuntimeProfiles();
  const validation = validateRuntimeProfileMetadata(metadata);

  assert.equal(validation.valid, true, validation.failures.join("\n"));
  assert.ok(metadata.serviceIdentities.some((identity) => identity.serviceName === "identity-service"));
  assert.ok(metadata.serviceIdentities.every((identity) => identity.issuer.includes("/realms/linercore-local")));
});

test("readiness evidence includes selected profile service statuses", () => {
  const evidence = runLocalReadiness({
    profile: "core",
    steps: [{ id: "a", command: "pass" }],
    runner: () => ({ status: 0, stdout: "ok", stderr: "" })
  });

  assert.equal(evidence.profile, "core");
  assert.equal(evidence.readinessState, "infrastructure_ready");
  assert.equal(evidence.serviceStatuses.some((service) => service.serviceName === "postgres" && service.status === "evidence_ready"), true);
});
