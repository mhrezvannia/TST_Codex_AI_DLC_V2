import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "artifacts", "u06", "codegen-boundary.json");

const protectedInputs = [
  "aidlc/spaces/default/intents/260714-booking-quote-cash/inception/application-design/decisions.md",
  "aidlc/spaces/default/intents/260714-booking-quote-cash/operation/performance-validation/load-test-results.md",
  "docs/u04-pricing-provider-u06-handoff.md",
  "docs/u05-booking-consumption-u06-handoff.md",
  "artifacts/u04/u06-handoff.json",
  "artifacts/u05/u06-handoff.json",
];

const priorUnitSummaries = ["U01-rate-authority", "U02-charge-domain-routing-bff",
  "U03-agreement-authority", "U04-pricing-provider-manual-cases",
  "U05-booking-consumption-repricing"].map((unit) =>
  `aidlc/spaces/default/intents/260721-charge-tariff-agreements/construction/${unit}/code-generation/code-summary.md`);

const allowlist = [
  "artifacts/u06/**",
  "docs/u06-operator-guide.md",
  "scripts/u06-*.mjs",
  "tests/u06/**",
  "tools/aidlc-evidence-fs.mjs",
  "tools/u06/**",
  "aidlc/spaces/default/intents/260721-charge-tariff-agreements/construction/U06-isolated-acceptance-preservation/code-generation/code-generation-plan.md",
  "aidlc/spaces/default/intents/260721-charge-tariff-agreements/construction/U06-isolated-acceptance-preservation/code-generation/code-summary.md",
];

function hashFile(relativePath) {
  const absolute = path.join(root, relativePath);
  const bytes = readFileSync(absolute);
  return {
    path: relativePath.replaceAll("\\", "/"),
    bytes: statSync(absolute).size,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

let statusText = process.env.U06_GIT_STATUS;
if (process.argv.includes("--status-stdin")) {
  statusText = readFileSync(0, "utf8");
}
if (statusText === undefined) {
  try {
    statusText = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (error) {
    throw new Error("git status unavailable; pass the exact output through U06_GIT_STATUS", { cause: error });
  }
}
const dirtyWorktree = statusText.split(/\r?\n/).filter(Boolean);

const record = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  scope: "U06 non-deployable evidence and test harness only",
  manager: {
    composeProject: "linercore-shared-platform",
    edgeUrl: "http://127.0.0.1:8088",
    access: "read-only fingerprint and default demo:guard only",
  },
  waveA: {
    composeProject: "linercore-wave-a",
    edgeUrl: "http://127.0.0.1:18088",
    mutationSeam: "node scripts/wave-a-compose.mjs",
  },
  forbiddenOwnership: [
    "production commercial behavior", "deployable services", "Charge/Booking authority",
    "packages/ui", "shared shell/navigation/tokens/palette", "manager project/8088",
    "other intents",
  ],
  changedPathAllowlist: allowlist,
  protectedInputs: protectedInputs.filter((item) => {
    try { statSync(path.join(root, item)); return true; } catch { return false; }
  }).map(hashFile),
  priorUnitSummaries: priorUnitSummaries.map(hashFile),
  historicalW1: {
    status: "BLOCKED/WAIVED; never rewritten as PASS",
    waiverId: "WAIVER-W1-01-001",
    decisionPath: protectedInputs[0],
    laterProofMustRemainSeparate: true,
  },
  dirtyWorktree,
};

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
console.log(path.relative(root, output));
