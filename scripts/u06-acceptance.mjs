import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createDefaultAdapters, runU06Acceptance } from "../tools/u06/acceptance-runner.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(readFileSync(path.join(root, "tests/u06/acceptance-registry.json"), "utf8"));
const dryRun = process.argv.includes("--dry-run");
const adapters = createDefaultAdapters({ root });
if (dryRun) {
  for (const id of ["live-startup", "migration-charge", "migration-booking", "restore-charge", "restore-booking", "commercial", "browser",
    "performance", "security", "observability", "preservation", "quality", "audits", "teardown"]) {
    adapters[id] = () => ({ id, status: "BLOCKED", blockerId: `B-dry-run-${id}`, summary: "dry-run forbids live mutation/observation" });
  }
}

const result = await runU06Acceptance({ root, registry, adapters });
console.log(JSON.stringify({ ...result, dryRun }, null, 2));
process.exitCode = result.status === "PASSED" ? 0 : result.status === "BLOCKED" ? 2 : 1;
