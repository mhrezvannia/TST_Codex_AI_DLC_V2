import assert from "node:assert/strict";
import { test } from "node:test";
import { EDGE_REGRESSION_ROUTES, EXPECTED_CATEGORY_CARDINALITY, OWNED_ROUTES, readRegistry, validateRegistry, validateResults } from "../../tools/u06/registry.mjs";

const registryUrl = new URL("./acceptance-registry.json", import.meta.url);
const registry = readRegistry(registryUrl);
const digest = "a".repeat(64);

function validResults(source = registry) {
  return source.members.map((member) => ({
    key: member.key,
    status: "PASS",
    scenario: member.correlationRequired ? (member.scenario ?? member.id) : undefined,
    correlationId: member.correlationRequired ? `corr-${member.id}` : undefined,
    artifacts: member.artifactKinds.map((kind) => ({ kind, sha256: digest, bytes: 1 })),
  }));
}

test("registry is the exact reviewed 120-member closed set", () => {
  assert.equal(validateRegistry(registry), registry);
  assert.equal(registry.members.length, 120);
  assert.deepEqual(registry.expectedCategoryCardinality, EXPECTED_CATEGORY_CARDINALITY);
  assert.deepEqual(registry.ownedRoutes, OWNED_ROUTES);
  assert.deepEqual(registry.edgeRegressionRoutes, EDGE_REGRESSION_ROUTES);
});

test("rejects unknown, duplicate, missing, and incomplete results", () => {
  const results = validResults();
  assert.throws(() => validateResults(registry, [...results, { ...results[0], key: "QUALITY:UNKNOWN" }]), /unknown/);
  assert.throws(() => validateResults(registry, [...results, results[0]]), /duplicate/);
  assert.throws(() => validateResults(registry, results.slice(1)), /missing result/);
  assert.throws(() => validateResults(registry, results.map((r, index) => index ? r : { ...r, status: "RUNNING" })), /incomplete terminal/);
});

test("rejects wrong cardinality, dangling links, illegal skipped, and caller paths", () => {
  const wrongCount = structuredClone(registry); wrongCount.members.pop();
  assert.throws(() => validateRegistry(wrongCount), /exactly 120/);
  const dangling = structuredClone(registry); dangling.members[5].dependsOn = ["QUALITY:DOES_NOT_EXIST"];
  dangling.members[5].legalSkippedAfter = ["QUALITY:DOES_NOT_EXIST"];
  assert.throws(() => validateRegistry(dangling), /dangling/);
  const results = validResults();
  results[5] = { ...results[5], status: "SKIPPED", skippedBecause: "PRESERVATION:W0-01" };
  assert.throws(() => validateResults(registry, results), /not terminal/);
  const paths = validResults(); paths[0].outputPath = "caller/chosen.json";
  assert.throws(() => validateResults(registry, paths), /caller-supplied path/);
});

test("legal skipped requires the declared earlier FAIL or BLOCKED result", () => {
  const results = validResults();
  results[0] = { ...results[0], status: "BLOCKED", blockerId: "B-Docker" };
  results[5] = { ...results[5], status: "SKIPPED", skippedBecause: "PRESERVATION:W0-01" };
  assert.doesNotThrow(() => validateResults(registry, results));
});

test("reviewed member identities/digest and topological order are immutable", () => {
  const renamed = structuredClone(registry); renamed.members[0].id = "RENAMED"; renamed.members[0].key = "PRESERVATION:RENAMED";
  assert.throws(() => validateRegistry(renamed), /identity\/digest|dangling/);
  const cycle = structuredClone(registry); cycle.members[0].dependsOn = [cycle.members[1].key]; cycle.members[0].legalSkippedAfter = [cycle.members[1].key];
  cycle.members[1].dependsOn = [cycle.members[0].key]; cycle.members[1].legalSkippedAfter = [cycle.members[0].key];
  assert.throws(() => validateRegistry(cycle), /identity\/digest|cycle|topological/);
  const reordered = structuredClone(registry); [reordered.members[0], reordered.members[1]] = [reordered.members[1], reordered.members[0]];
  assert.throws(() => validateRegistry(reordered), /identity\/digest|topological/);
});
