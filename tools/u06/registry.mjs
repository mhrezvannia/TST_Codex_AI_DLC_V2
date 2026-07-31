import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const EXPECTED_CATEGORY_CARDINALITY = Object.freeze({
  PRESERVATION: 5, SECURITY: 6, COMMERCIAL: 13, BROWSER_STRUCTURAL: 40,
  BROWSER_STATE: 33, DESIGN_DEPENDENCY: 3, OBSERVABILITY: 6, QUALITY: 10, AUDIT: 4,
});

export const OWNED_ROUTES = Object.freeze(["/charge-agreements", "/charge-agreements/new",
  "/charge-agreements/[agreementId]", "/charge-agreements/[agreementId]/edit",
  "/charge-agreements/rates", "/charge-agreements/rates/new", "/charge-agreements/rates/[rateId]",
  "/charge-agreements/rates/[rateId]?mode=edit", "/charge-agreements/manual-pricing", "/booking/[id]"]);
export const EDGE_REGRESSION_ROUTES = Object.freeze(["/", "/auth", "/reference-data", "/booking", "/bookings"]);

const SHA256 = /^[a-f0-9]{64}$/;
const DESTINATION = /^results\/[a-z0-9-]+\/[a-z0-9-]+\.json$/;
const PATH_KEYS = new Set(["path", "artifactPath", "artifactPaths", "outputPath", "destination"]);
export const EXPECTED_MEMBER_KEYS_DIGEST = "173bd6f9e381c235bc49a7ee78545c9083d0ddd4093ea1e4064fc8a785fcbde1";
export const EXPECTED_MEMBERS_DIGEST = "50146424f9206aad188d0c3bf486fa58fc36293392f38b2d002f0fcc0d21ab38";

export function readRegistry(fileUrl) {
  return JSON.parse(readFileSync(fileUrl, "utf8"));
}

export function validateRegistry(registry) {
  if (registry?.schemaVersion !== 1 || !Array.isArray(registry.members)) fail("unsupported registry schema");
  const expectedTotal = Object.values(EXPECTED_CATEGORY_CARDINALITY).reduce((a, b) => a + b, 0);
  if (registry.members.length !== expectedTotal) fail(`registry must contain exactly ${expectedTotal} members`);
  if (JSON.stringify(registry.expectedCategoryCardinality) !== JSON.stringify(EXPECTED_CATEGORY_CARDINALITY)) fail("category cardinality contract mismatch");
  exactArray(registry.ownedRoutes, OWNED_ROUTES, "owned routes");
  exactArray(registry.edgeRegressionRoutes, EDGE_REGRESSION_ROUTES, "edge regression routes");

  const keys = new Set();
  const ids = new Set();
  const counts = {};
  for (const member of registry.members) {
    if (!member || typeof member.key !== "string" || member.key !== `${member.category}:${member.id}`) fail("invalid member key");
    if (keys.has(member.key)) fail(`duplicate registry key ${member.key}`);
    if (ids.has(member.id)) fail(`duplicate registry id ${member.id}`);
    keys.add(member.key); ids.add(member.id);
    counts[member.category] = (counts[member.category] ?? 0) + 1;
    if (!DESTINATION.test(member.destination) || member.destination.includes("..")) fail(`invalid generated destination for ${member.key}`);
    if (!Array.isArray(member.artifactKinds) || member.artifactKinds.length === 0 || new Set(member.artifactKinds).size !== member.artifactKinds.length) fail(`invalid artifact kinds for ${member.key}`);
    if (!Array.isArray(member.dependsOn) || !Array.isArray(member.legalSkippedAfter)) fail(`invalid dependency lists for ${member.key}`);
    if (member.legalSkippedAfter.some((dependency) => !member.dependsOn.includes(dependency))) fail(`illegal SKIPPED link for ${member.key}`);
  }
  for (const [category, expected] of Object.entries(EXPECTED_CATEGORY_CARDINALITY)) {
    if (counts[category] !== expected) fail(`wrong ${category} cardinality`);
  }
  for (const member of registry.members) for (const dependency of member.dependsOn) {
    if (!keys.has(dependency)) fail(`dangling dependency ${dependency}`);
    if (dependency === member.key) fail(`self dependency ${member.key}`);
  }
  const keyDigest = digest(registry.members.map((member) => member.key));
  const memberDigest = digest(registry.members);
  if (keyDigest !== EXPECTED_MEMBER_KEYS_DIGEST || memberDigest !== EXPECTED_MEMBERS_DIGEST) fail("reviewed registry member identity/digest mismatch");
  assertAcyclicReviewedOrder(registry.members);
  return registry;
}

export function validateResults(registry, results) {
  validateRegistry(registry);
  if (!Array.isArray(results)) fail("results must be an array");
  const expected = new Map(registry.members.map((member) => [member.key, member]));
  const actual = new Map();
  for (const result of results) {
    rejectCallerPaths(result);
    if (!expected.has(result?.key)) fail(`unknown result ${result?.key ?? "<missing>"}`);
    if (actual.has(result.key)) fail(`duplicate result ${result.key}`);
    if (!registry.resultStatuses.includes(result.status)) fail(`incomplete terminal result ${result.key}`);
    if (!Array.isArray(result.artifacts)) fail(`missing artifacts for ${result.key}`);
    const member = expected.get(result.key);
    for (const kind of result.status === "PASS" ? member.artifactKinds : []) {
      const artifact = result.artifacts.find((item) => item.kind === kind);
      if (!artifact || !SHA256.test(artifact.sha256) || !Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0) fail(`invalid ${kind} artifact for ${result.key}`);
    }
    if (result.status === "PASS" && member.correlationRequired && (!result.scenario || !result.correlationId)) fail(`missing scenario/correlation for ${result.key}`);
    if (result.status === "BLOCKED" && !result.blockerId) fail(`BLOCKED without blocker for ${result.key}`);
    if (result.status === "PASS" && result.blockerId) fail(`PASS with blocker for ${result.key}`);
    actual.set(result.key, result);
  }
  for (const key of expected.keys()) if (!actual.has(key)) fail(`missing result ${key}`);
  for (const [key, result] of actual) if (result.status === "SKIPPED") {
    const member = expected.get(key);
    if (!member.legalSkippedAfter.includes(result.skippedBecause)) fail(`illegal SKIPPED result ${key}`);
    if (!resolvesToTerminal(actual, result.skippedBecause)) fail(`SKIPPED dependency is not terminal ${key}`);
  }
  return results;
}

function resolvesToTerminal(actual, key, seen = new Set()) {
  if (seen.has(key)) return false; seen.add(key);
  const result = actual.get(key); if (!result) return false;
  if (["FAIL", "BLOCKED"].includes(result.status)) return true;
  return result.status === "SKIPPED" && resolvesToTerminal(actual, result.skippedBecause, seen);
}

function assertAcyclicReviewedOrder(members) {
  const index = new Map(members.map((member, position) => [member.key, position]));
  const visiting = new Set(); const visited = new Set();
  const visit = (key) => {
    if (visiting.has(key)) fail(`dependency cycle at ${key}`);
    if (visited.has(key)) return;
    visiting.add(key);
    const member = members[index.get(key)];
    for (const dependency of member.dependsOn) {
      if (index.get(dependency) >= index.get(key)) fail(`ambiguous topological order ${dependency} -> ${key}`);
      visit(dependency);
    }
    visiting.delete(key); visited.add(key);
  };
  for (const member of members) visit(member.key);
}

function digest(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }

function rejectCallerPaths(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (PATH_KEYS.has(key) || /(?:^|_)(?:path|paths)$/i.test(key)) fail(`caller-supplied path field ${key}`);
    rejectCallerPaths(child);
  }
}

function exactArray(actual, expected, label) {
  if (!Array.isArray(actual) || JSON.stringify(actual) !== JSON.stringify(expected)) fail(`${label} mismatch`);
}

function fail(message) { throw new Error(message); }
