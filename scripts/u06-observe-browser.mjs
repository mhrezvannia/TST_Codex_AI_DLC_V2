import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import registry from "../tests/u06/acceptance-registry.json" with { type: "json" };
import { createBuiltInDriver, runBrowserEvidence } from "../tools/u06/browser-adapter.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runId = `browser-diagnostic-${Date.now()}`;
const built = await createBuiltInDriver({ root, env: process.env, runId });
try {
  const result = await runBrowserEvidence({
    registry,
    driver: built.driver,
    publishArtifacts: async ({ cell, observed, trace }) => {
      const values = {
        screenshot: observed.screenshot,
        "assertion-json": observed.assertionJson,
        "axe-report": observed.axeReport,
        "sanitized-trace": Buffer.from(JSON.stringify(trace.entries)),
      };
      const member = registry.members.find((candidate) => candidate.key === cell.key);
      return { refs: member.artifactKinds.map((kind) => ({
        kind,
        sha256: createHash("sha256").update(values[kind]).digest("hex"),
        bytes: values[kind].length,
      })), records: [] };
    },
  });
  const failed = result.results.filter((cell) => cell.status !== "PASS");
  process.stdout.write(`${JSON.stringify({ status: result.status, passed: result.results.length - failed.length,
    failed: failed.map(({ key, status, summary }) => ({ key, status, summary })) }, null, 2)}\n`);
  process.exitCode = result.status === "PASS" ? 0 : 1;
} finally {
  await built.close();
}
