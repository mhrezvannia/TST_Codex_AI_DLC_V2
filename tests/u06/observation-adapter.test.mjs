import assert from "node:assert/strict";
import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import registry from "./acceptance-registry.json" with { type: "json" };
import { createObservationAdapter } from "../../tools/u06/observation-adapter.mjs";

const digest = "a".repeat(64);

test("default observation adapter reaches PASS from closed machine evidence and writer publication", () => {
  const root = path.resolve(`artifacts/u06/observation-pass-${process.pid}-${Date.now()}`);
  const members = registry.members.filter((member) => member.category === "PRESERVATION");
  writeJson(path.join(root, "artifacts/u06/observations/preservation.json"), {
    schemaVersion: 1,
    stage: "preservation",
    observedAt: "2026-07-30T00:00:00.000Z",
    results: members.map((member) => ({
      key: member.key,
      status: "PASS",
      observation: { id: member.id, status: "PASS" },
      artifactPayloads: Object.fromEntries(member.artifactKinds.map((kind) => [kind, { observed: true, kind }])),
    })),
  });
  const issued = [];
  const publication = { publishCell: ({ registryKey, payloads }) => {
    issued.push(registryKey);
    const refs = Object.keys(payloads).map((kind) => ({ kind, sha256: digest, bytes: 1 }));
    return { refs, records: refs.map((ref) => ({ registryKey, ...ref })) };
  } };
  const result = createObservationAdapter("preservation", { root })({ registry, publication });
  assert.equal(result.status, "PASS");
  assert.equal(result.registryResults.length, 5);
  assert.deepEqual(issued, members.map((member) => member.key));
});

test("observation adapters BLOCK absent capabilities and reject partial or reordered evidence", () => {
  const root = path.resolve(`artifacts/u06/observation-fail-${process.pid}-${Date.now()}`);
  const publication = { publishCell: () => { throw new Error("must not publish malformed evidence"); } };
  const absent = createObservationAdapter("security", { root })({ registry, publication });
  assert.equal(absent.status, "BLOCKED");
  assert.match(absent.summary, /observation capability unavailable/);
  writeJson(path.join(root, "artifacts/u06/observations/security.json"), {
    schemaVersion: 1,
    stage: "security",
    observedAt: "2026-07-30T00:00:00.000Z",
    results: registry.members.filter((member) => member.category === "SECURITY").slice(1).map((member) => ({
      key: member.key, status: "PASS", observation: { id: member.id, status: "PASS" }, artifactPayloads: {},
    })),
  });
  assert.throws(() => createObservationAdapter("security", { root })({ registry, publication }), /order\/cardinality/);
});

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const bytes = Buffer.from(JSON.stringify(value));
  const fd = openSync(filePath, "wx", 0o600);
  try { writeSync(fd, bytes); } finally { closeSync(fd); }
}
