import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, writeSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import registry from "./acceptance-registry.json" with { type: "json" };
import { createMigrationAdapter, createRestoreAdapter, runU06Acceptance } from "../../tools/u06/acceptance-runner.mjs";
import { REQUIRED_TERMINAL_GATE_IDS } from "../../tools/u06/contracts.mjs";
import { MIGRATIONS } from "../../tools/u06/live-gates.mjs";
import { PublicationCapability } from "../../tools/u06/publication.mjs";

const categoryStage = { PRESERVATION: "preservation", SECURITY: "security", COMMERCIAL: "commercial", BROWSER_STRUCTURAL: "browser",
  BROWSER_STATE: "browser", DESIGN_DEPENDENCY: "browser", OBSERVABILITY: "observability", QUALITY: "quality", AUDIT: "audits" };

function greenAdapters() {
  const adapters = Object.fromEntries(REQUIRED_TERMINAL_GATE_IDS.slice(0, -2).map((id) => [id, async () => ({ status: "PASS" })]));
  adapters["evidence-writer"] = (state) => ({ status: "PASS",
    publication: new PublicationCapability({ writer: new TestWriter(path.join(state.runRoot, "evidence"), state.registry) }) });
  for (const stage of new Set(Object.values(categoryStage))) adapters[stage] = async (state) => {
    const members = state.registry.members.filter((member) => categoryStage[member.category] === stage); const results = []; const artifacts = [];
    for (const member of members) {
      const published = state.publication.publishCell({ registryKey: member.key, producingGate: stage,
        payloads: Object.fromEntries(member.artifactKinds.map((kind) => [kind, { key: member.key, kind, observed: true }])) });
      results.push({ recordId: member.key, key: member.key, status: "PASS", scenario: member.correlationRequired ? member.scenario ?? member.id : undefined,
        correlationId: member.correlationRequired ? `corr-${member.id}` : undefined, artifacts: published.refs });
      artifacts.push(...published.records);
    }
    return { status: "PASS", registryResults: results, artifacts };
  };
  return adapters;
}

class TestWriter {
  constructor(runRoot, registry) {
    this.runRoot = runRoot;
    this.members = new Map(registry.members.map((member) => [member.key, member]));
    mkdirSync(runRoot, { recursive: true });
  }
  commit(registryKey, value) {
    const member = this.members.get(registryKey);
    const bytes = Buffer.from(value);
    const destination = member.destination;
    const file = path.join(this.runRoot, destination);
    mkdirSync(path.dirname(file), { recursive: true });
    const fd = openSync(file, "wx", 0o600);
    try { writeSync(fd, bytes); fsyncSync(fd); } finally { closeSync(fd); }
    return { schemaVersion: 1, capability: "u06-writer-test-seam-v1", registryKey, relativePath: destination,
      sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length,
      nativeIdentity: { volumeSerial: 1, rootIndexHigh: 0, rootIndexLow: 1, parentIndexHigh: 0, parentIndexLow: 2,
        fileIndexHigh: 0, fileIndexLow: this.members.size + 3, links: 1 } };
  }
}

test("injectable runner executes the full lifecycle and only passes after closed artifacts and published manifest verify", async () => {
  const root = path.resolve(`artifacts/u06/runner-green-${process.pid}-${Date.now()}`); mkdirSync(root, { recursive: true });
  const result = await runU06Acceptance({ root, registry, adapters: greenAdapters(), runId: "20260729T000000.000Z-deadbeef",
    now: () => new Date("2026-07-29T00:00:00.000Z") });
  assert.equal(result.status, "PASSED"); assert.equal(result.results.length, REQUIRED_TERMINAL_GATE_IDS.length - 2);
  assert.equal(result.registryResults.length, 120); assert.ok(result.registryResults.every((cell) => cell.status === "PASS"));
  assert.equal(result.manifest.published, true); assert.equal(result.manifest.reopenedBytes, readFileSync(path.join(root, result.runRoot, result.manifest.immutable)).length);
});

test("capability exception is BLOCKED and every downstream lifecycle gate is linked SKIPPED", async () => {
  const root = path.resolve(`artifacts/u06/runner-blocked-${process.pid}-${Date.now()}`); mkdirSync(root, { recursive: true });
  const adapters = greenAdapters(); adapters["resource-preflight"] = () => { throw Object.assign(new Error("docker spawn EPERM"), { status: "BLOCKED" }); };
  const result = await runU06Acceptance({ root, registry, adapters, runId: "20260729T000001.000Z-deadbeef",
    now: () => new Date("2026-07-29T00:00:00.000Z") });
  assert.equal(result.status, "BLOCKED"); assert.equal(result.results[0].status, "BLOCKED");
  assert.ok(result.results.slice(1).every((gate) => gate.status === "SKIPPED" && gate.skippedBecause === "resource-preflight"));
  assert.equal(result.registryResults.length, 120); assert.equal(result.manifest.published, true);
});

test("migration and restore adapters execute exact owner-only catalogs and isolated targets", async () => {
  const seen = []; let migrationCall = 0;
  const catalog = { startingShape: "V4", databaseOid: 101, catalog: MIGRATIONS.BOOKING.map(([version], index) => ({ version, checksum: index + 1, success: true })),
    legacyFingerprint: "legacy-booking", inventedRateLinks: 0 };
  const executeMigration = (command, args) => {
    seen.push([command, ...args]); migrationCall++;
    const stdout = migrationCall === 5 ? JSON.stringify({ attempted: true, rejected: true, beforeHash: "same", afterHash: "same" }) : JSON.stringify(catalog);
    return { status: 0, stdout, stderr: "" };
  };
  assert.equal((await createMigrationAdapter("BOOKING", { execute: executeMigration, root: process.cwd() })({})).status, "PASS");
  assert.match(seen[0].join(" "), /linercore_booking/); assert.doesNotMatch(seen[0].join(" "), /linercore_pricing/);
  assert.match(seen[2].join(" "), /up -d --no-deps --wait booking-service/);
  seen.length = 0; let identityCall = 0;
  const executeRestore = (command, args) => {
    seen.push([command, ...args]);
    const joined = args.join(" ");
    if (joined.includes("json_build_object") && joined.includes("sourceOid")) {
      identityCall++;
      const targetExists = identityCall === 2;
      return { status: 0, stdout: JSON.stringify({ project: "linercore-wave-a", adminDatabase: "postgres", sourceOid: 101,
        targetExists, targetOid: targetExists ? 202 : null, otherTargetOid: 303,
        ownerMarker: targetExists ? "U06:CHARGE:20260729T000000.000Z-deadbeef" : null }), stderr: "" };
    }
    if (joined.includes("catalogHash")) return { status: 0, stdout: JSON.stringify({ catalogHash: "a".repeat(32) }), stderr: "" };
    return { status: 0, stdout: "ok", stderr: "" };
  };
  assert.equal((await createRestoreAdapter("CHARGE", { execute: executeRestore, root: process.cwd() })({ runId: "20260729T000000.000Z-deadbeef" })).status, "PASS");
  assert.ok(seen.every((argv) => argv[0] === "node" && argv[1] === "scripts/wave-a-compose.mjs"));
  assert.match(seen[1].join(" "), /pg_dump.*linercore_pricing/); assert.match(seen[3].join(" "), /pg_restore.*w203_restore_charge_/);
  assert.ok(seen.some((argv) => argv.join(" ").includes("dropdb")));
  assert.doesNotMatch(seen.flat().join(" "), /linercore-shared-platform|8088/);
});

test("post-start failure still runs every teardown and manager recovery gate", async () => {
  const root = path.resolve(`artifacts/u06/runner-finally-${process.pid}-${Date.now()}`); mkdirSync(root, { recursive: true });
  const adapters = greenAdapters(); const recoveryCalls = [];
  adapters.commercial = () => ({ status: "FAIL", summary: "adversarial commercial mismatch" });
  for (const id of ["teardown", "manager-post-guard", "manager-inventory-after", "manager-unchanged"]) {
    adapters[id] = () => { recoveryCalls.push(id); return { status: "PASS" }; };
  }
  const result = await runU06Acceptance({ root, registry, adapters, runId: "20260729T000002.000Z-deadbeef",
    now: () => new Date("2026-07-29T00:00:00.000Z") });
  assert.equal(result.status, "FAILED");
  assert.deepEqual(recoveryCalls, ["teardown", "manager-post-guard", "manager-inventory-after", "manager-unchanged"]);
  assert.ok(result.results.filter((item) => recoveryCalls.includes(item.id)).every((item) => item.status === "PASS"));
});

test("runner rejects raw adapter artifacts that were not issued by its writer capability", async () => {
  const root = path.resolve(`artifacts/u06/runner-raw-artifact-${process.pid}-${Date.now()}`); mkdirSync(root, { recursive: true });
  const adapters = greenAdapters();
  adapters.preservation = () => ({ status: "PASS", artifacts: [{
    recordKind: "artifact", schemaVersion: 1, recordId: "forged", artifactId: "forged",
    registryKey: "PRESERVATION:W0-01", kind: "command-log", relativePath: "results/preservation/w0-01.json",
    sha256: "a".repeat(64), bytes: 1, mediaType: "application/json", producingGate: "preservation", status: "PASS",
  }] });
  const result = await runU06Acceptance({ root, registry, adapters, runId: "20260729T000003.000Z-deadbeef",
    now: () => new Date("2026-07-29T00:00:00.000Z") });
  assert.equal(result.status, "FAILED");
  assert.match(result.results.find((item) => item.id === "preservation").summary, /outside writer publication capability/);
});

test("a failed startup that may have mutated Wave A still executes the full recovery lane", async () => {
  const root = path.resolve(`artifacts/u06/runner-startup-fail-${process.pid}-${Date.now()}`); mkdirSync(root, { recursive: true });
  const adapters = greenAdapters(); const recoveryCalls = [];
  adapters["live-startup"] = () => ({ status: "FAIL", waveAMutated: true, summary: "partial compose startup" });
  for (const id of ["teardown", "manager-post-guard", "manager-inventory-after", "manager-unchanged"]) {
    adapters[id] = () => { recoveryCalls.push(id); return { status: "PASS" }; };
  }
  const result = await runU06Acceptance({ root, registry, adapters, runId: "20260729T000004.000Z-deadbeef",
    now: () => new Date("2026-07-29T00:00:00.000Z") });
  assert.equal(result.status, "FAILED");
  assert.deepEqual(recoveryCalls, ["teardown", "manager-post-guard", "manager-inventory-after", "manager-unchanged"]);
});
