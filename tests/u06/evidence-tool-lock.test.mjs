import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { verifyEvidenceToolLock } from "../../tools/u06/evidence-tool-lock.mjs";

test("approved installed Koffi package and native binary match the lock", () => {
  const result = verifyEvidenceToolLock();
  assert.equal(result.lock.package.version, "2.14.1");
  assert.match(result.nativePath, /koffi\.node$/);
});

test("missing or mismatched native helper is BLOCKED without fallback", () => {
  const root = mkdtempSync(path.join(tmpdir(), "u06-lock-"));
  const source = path.resolve("tools/u06/evidence-tool-lock.json");
  writeFileSync(path.join(root, "evidence-tool-lock.json"), readFileSync(source));
  mkdirSync(path.join(root, "node_modules/koffi"), { recursive: true });
  writeFileSync(path.join(root, "node_modules/koffi/package.json"), '{"name":"koffi","version":"2.14.1"}');
  assert.throws(() => verifyEvidenceToolLock({ toolRoot: root }), (error) => error.status === "BLOCKED");
  mkdirSync(path.join(root, "node_modules/koffi/build/koffi/win32_x64"), { recursive: true });
  writeFileSync(path.join(root, "node_modules/koffi/build/koffi/win32_x64/koffi.node"), "wrong");
  assert.throws(() => verifyEvidenceToolLock({ toolRoot: root }), /digest mismatch/);
});
