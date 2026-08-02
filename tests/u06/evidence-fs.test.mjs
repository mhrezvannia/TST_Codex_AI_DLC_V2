import assert from "node:assert/strict";
import { existsSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { EvidenceWriter, assertStableIdentity, validateOpenedFileIdentity, validateRegistryDestination, verifyFinalArtifactBytes } from "../../tools/aidlc-evidence-fs.mjs";

const oneRegistry = { members: [{ key: "QUALITY:GIT_DIFF", destination: "results/quality/git-diff.json" }] };
let sequence = 0;
function runRoot(label) {
  const root = path.resolve(`artifacts/u06/fs-test-${label}-${process.pid}-${sequence++}/run`);
  mkdirSync(path.dirname(root), { recursive: true });
  return root;
}

test("registry destinations reject traversal, aliases, ADS, device, UNC, and case variants", () => {
  const invalid = ["../escape", "results/../escape.json", "C:/escape", "//server/share", "\\\\server\\share",
    "results/quality/file.json:ads", "CON", "results/Quality/file.json", "results/quality/file.JSON"];
  for (const value of invalid) assert.throws(() => validateRegistryDestination(value), /unsafe/);
  assert.equal(validateRegistryDestination("results/quality/git-diff.json"), "results/quality/git-diff.json");
});

test("opened identities reject hardlinks, symlinks, cross-volume, and parent swaps", () => {
  assert.throws(() => validateOpenedFileIdentity({ isFile: true, isSymbolicLink: false, nlink: 2, dev: 1 }, 1), /identity/);
  assert.throws(() => validateOpenedFileIdentity({ isFile: true, isSymbolicLink: true, nlink: 1, dev: 1 }, 1), /identity/);
  assert.throws(() => validateOpenedFileIdentity({ isFile: true, isSymbolicLink: false, nlink: 1, dev: 2 }, 1), /cross-volume/);
  assert.throws(() => assertStableIdentity({ volumeSerial: 1, indexHigh: 0, indexLow: 1 }, { volumeSerial: 1, indexHigh: 0, indexLow: 2 }), /changed/);
});

test("final reopen hash or byte mismatch is rejected", () => {
  assert.throws(() => verifyFinalArtifactBytes({ sha256: "0".repeat(64), bytes: 5 }, Buffer.from("hello")), /final artifact hash mismatch/);
  assert.throws(() => verifyFinalArtifactBytes({ sha256: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824", bytes: 4 }, Buffer.from("hello")), /final artifact hash mismatch/);
});

test("caller digest mismatch fails before native rename", () => {
  const writer = new EvidenceWriter({ runRoot: runRoot("digest"), registry: oneRegistry });
  assert.throws(() => writer.commit("QUALITY:GIT_DIFF", "hello", { expectedSha256: "0".repeat(64) }), /digest mismatch/);
});

test("existing destination collision never replaces bytes", () => {
  const root = runRoot("collision");
  const writer = new EvidenceWriter({ runRoot: root, registry: oneRegistry });
  const final = path.join(root, "results/quality/git-diff.json");
  writeFileSync(final, "protected");
  assert.throws(() => writer.commit("QUALITY:GIT_DIFF", "new"), /already exists/);
});

test("reparse/symlink run root is rejected when host permits creating one", (t) => {
  const base = path.dirname(runRoot("symlink"));
  mkdirSync(path.join(base, "real"), { recursive: true });
  try { symlinkSync(path.join(base, "real"), path.join(base, "link"), "junction"); }
  catch (error) { t.diagnostic(`junction capability unavailable: ${error.code}`); return; }
  assert.throws(() => new EvidenceWriter({ runRoot: path.join(base, "link"), registry: oneRegistry }), /unsafe|alias|exist/i);
});

test("native handle-relative rename commits safely", () => {
  const root = runRoot("native");
  const writer = new EvidenceWriter({ runRoot: root, registry: oneRegistry });
  const artifact = writer.commit("QUALITY:GIT_DIFF", "hello");
  assert.equal(artifact.sha256, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  assert.equal(existsSync(path.join(root, artifact.relativePath)), true);
});
