import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { buildU06StorageState } from "../../scripts/u06-storage-state.mjs";
import { observeAuthenticatedReadiness } from "../../tools/u06/readiness-observer.mjs";

test("U06 signed storage state is local-only and grants the reviewed acceptance roles", () => {
  assert.throws(() => buildU06StorageState({ RUNTIME_PROFILE: "production" }), /local\/test/);
  const state = buildU06StorageState({ RUNTIME_PROFILE: "test", U06_SIGNED_SESSION_SUBJECT: "u06.test" }, new Date("2026-08-02T00:00:00.000Z"));
  assert.equal(state.cookies.length, 1); assert.equal(state.cookies[0].name, "lc_session"); assert.equal(state.cookies[0].httpOnly, true);
});

test("readiness observer requires successful signed BFF probes", async () => {
  const root = path.resolve(`artifacts/u06/readiness-observer-${process.pid}-${Date.now()}`);
  const authRoot = path.join(root, ".u06-auth"); mkdirSync(authRoot, { recursive: true });
  const now = new Date("2026-08-02T00:00:00.000Z");
  writeFileSync(path.join(authRoot, "state.json"), JSON.stringify(buildU06StorageState({ RUNTIME_PROFILE: "test", U06_SIGNED_SESSION_SUBJECT: "u06.test" }, now)));
  const fetchImpl = async (url, options) => ({ status: 200, json: async () => ({ isAuthenticated: true, subjectId: "u06.test" }), url, options });
  const sessionCookieForSubject = () => ({ name: "lc_session", value: "alternate-signed-cookie" });
  const envelope = await observeAuthenticatedReadiness({ root, storageStatePath: ".u06-auth/state.json", subject: "u06.test", fetchImpl, now: () => now,
    sessionCookieForSubject });
  assert.equal(envelope.proof.status, "PASS"); assert.equal(envelope.proof.services.length, 4);
  const failed = await observeAuthenticatedReadiness({ root, storageStatePath: ".u06-auth/state.json", subject: "u06.test",
    fetchImpl: async () => ({ status: 401, json: async () => ({}) }), now: () => now, sessionCookieForSubject });
  assert.equal(failed.proof.status, "FAIL");
});
