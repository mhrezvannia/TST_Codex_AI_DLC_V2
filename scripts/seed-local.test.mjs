import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  REQUIRED_REFERENCE_SETS,
  applySeedPack,
  buildReferenceMutationCommand,
  buildRoleAssignmentCommands,
  buildSeedRunSummary,
  fingerprintRecord,
  orderedReferenceRecords,
  validateSeedPack
} from "./seed-local.mjs";

const seedPack = JSON.parse(readFileSync("infrastructure/seeds/shared-platform-mvp-defaults.json", "utf8"));

test("default seed pack contains all required reference sets", () => {
  const result = validateSeedPack(seedPack);

  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(Object.keys(seedPack.referenceData.sets).sort(), [...REQUIRED_REFERENCE_SETS].sort());
  assert.equal(seedPack.referenceData.sets.VESSEL_VOYAGE.filter((record) => record.attributes.recordType === "VESSEL").length, 1);
  assert.equal(seedPack.referenceData.sets.VESSEL_VOYAGE.filter((record) => record.attributes.recordType === "VOYAGE").length, 2);
  assert.deepEqual(seedPack.referenceData.sets.EQUIPMENT_TYPE.map((record) => record.code).sort(), ["22G1", "42G1", "45G1"]);
});

test("validation fails when a required reference set is missing", () => {
  const incomplete = structuredClone(seedPack);
  delete incomplete.referenceData.sets.CURRENCY;

  const result = validateSeedPack(incomplete);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /CURRENCY/);
});

test("validation fails on duplicate natural key with incompatible immutable identity", () => {
  const duplicate = structuredClone(seedPack);
  duplicate.referenceData.sets.CURRENCY.push({
    id: "currency-usd-other",
    code: "USD",
    displayName: "US Dollar Duplicate",
    status: "ACTIVE",
    attributes: {}
  });

  const result = validateSeedPack(duplicate);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /duplicates natural key/);
});

test("rerun summary skips already-current records", () => {
  const existing = new Map();
  for (const record of orderedReferenceRecords(seedPack)) {
    existing.set(`${record.set}:${record.code}`, fingerprintRecord(seedPack.seedVersion, record));
  }

  const summary = buildSeedRunSummary(seedPack, existing, "corr-test");

  assert.equal(summary.created, 0);
  assert.equal(summary.updated, 0);
  assert.equal(summary.failed, 0);
  assert.equal(summary.skipped, orderedReferenceRecords(seedPack).length);
});

test("builds live API commands for reference records and role assignments", () => {
  const record = orderedReferenceRecords(seedPack).find((item) => item.set === "CURRENCY");

  assert.deepEqual(buildReferenceMutationCommand(record, "corr-test"), {
    set: "CURRENCY",
    code: "USD",
    displayName: "US Dollar",
    attributes: { minorUnit: "2", localOnly: "true" },
    actorSubjectId: "local.reference.admin",
    actorDisplayName: "Local Reference Admin",
    operation: "seed",
    reason: "local seed currency-usd",
    correlationId: "corr-test"
  });
  assert.equal(buildRoleAssignmentCommands(seedPack, "local.reference.admin", "corr-test").length, 3);
});

test("apply mode creates missing reference records through live API shape", async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    if (url.includes("/internal/identity/roles/assign")) {
      return Response.json({ result: "ALLOW" });
    }
    if (init.method === "GET") {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json({ id: { value: "created" }, version: 1 });
  };

  const summary = await applySeedPack(seedPack, {
    fetcher,
    identityServiceUrl: "http://identity.test",
    referenceDataServiceUrl: "http://reference.test",
    correlationId: "corr-test"
  });

  assert.equal(summary.failed, 0);
  assert.equal(summary.created, orderedReferenceRecords(seedPack).length);
  assert.equal(summary.identityAssignments.length, 3);
  assert.equal(calls.some((call) => call.url === "http://identity.test/internal/identity/roles/assign"), true);
  assert.equal(calls.some((call) => call.url.includes("http://reference.test/reference-sets/CURRENCY/records")), true);
});

test("apply mode is idempotent when live records already match", async () => {
  const calls = [];
  const recordsById = new Map(orderedReferenceRecords(seedPack).map((record) => [record.id, record]));
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    if (url.includes("/internal/identity/roles/assign")) {
      return Response.json({ result: "ALLOW" });
    }
    const id = decodeURIComponent(new URL(url).pathname.split("/").at(-1));
    const record = recordsById.get(id);
    return Response.json({
      id: { value: record.id },
      code: { value: record.code },
      displayName: record.displayName,
      status: record.status,
      version: 1,
      attributes: record.attributes
    });
  };

  const summary = await applySeedPack(seedPack, {
    fetcher,
    identityServiceUrl: "http://identity.test",
    referenceDataServiceUrl: "http://reference.test",
    correlationId: "corr-test"
  });

  assert.equal(summary.failed, 0);
  assert.equal(summary.skipped, orderedReferenceRecords(seedPack).length);
  assert.equal(calls.some((call) => call.init.method === "PUT"), false);
});
