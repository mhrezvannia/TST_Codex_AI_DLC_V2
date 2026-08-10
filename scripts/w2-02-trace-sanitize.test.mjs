import assert from "node:assert/strict";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { redactTraceText, sanitizeTraceArchive, traceTextIsSafe } from "./w2-02-trace-sanitize.mjs";
import { deriveLocalIdentityConfiguration } from "./w2-02-local-identities.mjs";
const absent = async (path) => access(path).then(() => false, () => true);

test("redacts real header, auth, query/form, body and local identity forms", () => {
  const raw = [
    "Cookie: session=super-secret", "Set-Cookie: sid=super-secret", "Authorization: Basic dXNlcjpwYXNz", "client_secret=super-secret&access_token=abc",
    JSON.stringify({ type: "resource-snapshot", request: { url: "http://x/path?client_secret=secret", headers: [{ name: "Authorization", value: "Bearer abc.def" }, { name: "Cookie", value: "sid=secret" }], postData: "password=secret" }, actor: "local-user@example.test" })
  ].join("\n");
  const clean = redactTraceText(raw, ["local-user@example.test"]); assert.equal(traceTextIsSafe(clean, ["local-user@example.test"]), true);
  for (const secret of ["super-secret", "dXNlcjpwYXNz", "abc.def", "password=secret", "local-user@example.test"]) assert.equal(clean.includes(secret), false);
});

test("sanitizes, drops resources, reopens the trace model and removes raw input", async () => {
  const root = join(tmpdir(), `w2-02-trace-ok-${process.pid}-${Date.now()}`); const input = join(root, "raw.zip"); const output = join(root, "promoted.zip"); const report = join(root, "report.json"); await mkdir(root, { recursive: true });
  try {
    const trace = [JSON.stringify({ type: "context-options", browserName: "chromium", workspace: "D:/work/local-user" }), JSON.stringify({ type: "before", apiName: "page.goto", params: { url: "http://x/?client_secret=secret" } })].join("\n") + "\n";
    const network = JSON.stringify({ type: "resource-snapshot", snapshot: { request: { headers: [{ name: "Set-Cookie", value: "sid=secret" }], postData: "password=secret" } } }) + "\n";
    await writeFile(input, zipSync({ "0-trace.trace": strToU8(trace), "0-trace.network": strToU8(network), "resources/secret-body": strToU8("client_secret=super-secret"), "screenshot.png": new Uint8Array([1, 2, 3]) }));
    const identities = ["D:/work/local-user", "local-user@example.test"];
    const result = await sanitizeTraceArchive(input, output, report, { localIdentities: identities }); assert.equal(result.closureStatus, "PASS"); assert.equal(result.droppedResourceEntries, 1); assert.equal(result.localIdentityCount, 2); assert.match(result.localIdentityConfigurationDigest, /^[a-f0-9]{64}$/); assert.match(result.traceOpenValidation, /^PASS:/); assert.equal(await absent(input), true);
    const promoted = unzipSync(await readFile(output)); assert.equal("resources/secret-body" in promoted, false); const allText = Object.entries(promoted).filter(([name]) => !name.endsWith(".png")).map(([, bytes]) => strFromU8(bytes)).join("\n"); assert.equal(traceTextIsSafe(allText, identities), true); assert.equal(allText.includes("password=secret"), false); assert.equal(allText.includes("D:/work/local-user"), false);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("unclassified binary or malformed trace fails closed and removes both archives", async () => {
  const root = join(tmpdir(), `w2-02-trace-fail-${process.pid}-${Date.now()}`); const input = join(root, "raw.zip"); const output = join(root, "promoted.zip"); const report = join(root, "report.json"); await mkdir(root, { recursive: true });
  try {
    await writeFile(input, zipSync({ "0-trace.trace": strToU8('{"type":"context-options"}\n'), "0-trace.network": strToU8('{"type":"resource-snapshot"}\n'), "unknown.bin": new Uint8Array([0, 1, 2]) })); await writeFile(output, "staged");
    await assert.rejects(() => sanitizeTraceArchive(input, output, report, { localIdentities: ["local-user"] }), /archives were removed/); assert.equal(await absent(input), true); assert.equal(await absent(output), true); const failure = JSON.parse(await readFile(report, "utf8")); assert.equal(failure.closureStatus, "FAILED");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("an empty or duplicate local-identity configuration cannot produce PASS", async () => {
  const root = join(tmpdir(), `w2-02-trace-identities-${process.pid}-${Date.now()}`); const input = join(root, "raw.zip"); const output = join(root, "promoted.zip"); const report = join(root, "report.json"); await mkdir(root, { recursive: true });
  try {
    const archive = zipSync({ "0-trace.trace": strToU8('{"type":"context-options"}\n'), "0-trace.network": strToU8('{"type":"resource-snapshot"}\n') });
    await writeFile(input, archive); await assert.rejects(() => sanitizeTraceArchive(input, output, report, { localIdentities: [] }), /archives were removed/);
    await writeFile(input, archive); await assert.rejects(() => sanitizeTraceArchive(input, output, report, { localIdentities: ["same-user", "same-user"] }), /archives were removed/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("runner identity derivation requires every live fixture plus workspace, home, user, run, and storage facts", () => {
  const env = { W2_02_CUSTOMER_ID: "customer-1", W2_02_LOAD_UNLOCODE: "NLRTM", W2_02_DISCHARGE_UNLOCODE: "SGSIN", W2_02_VOYAGE_ID: "voyage-1", W2_02_EQUIPMENT_TYPE: "22G1", W2_02_EQUIPMENT_ID: "MSCU1234567", W2_02_COMMODITY_CODE: "commodity-1" };
  const configuration = deriveLocalIdentityConfiguration(env, { workspaceRoot: "D:/work/repo", runId: "run-1", workspaceDigest: "d".repeat(64), storageStatePath: "D:/work/state.json" });
  assert.ok(configuration.count >= 13); assert.match(configuration.configurationDigest, /^[a-f0-9]{64}$/); assert.ok(configuration.identities.includes("customer-1")); assert.ok(configuration.identities.includes("D:/work/state.json") || configuration.identities.includes("D:\\work\\state.json"));
  const missing = { ...env }; delete missing.W2_02_CUSTOMER_ID; assert.throws(() => deriveLocalIdentityConfiguration(missing, { workspaceRoot: "D:/work/repo", runId: "run-1", workspaceDigest: "d".repeat(64), storageStatePath: "D:/work/state.json" }), /Missing mandatory/);
});
