import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import registry from "../tests/u06/acceptance-registry.json" with { type: "json" };
import { PRESERVATION_IDS, validateClosedMatrix } from "../tools/u06/live-gates.mjs";

const root = path.resolve(".");
const node = process.execPath;
const browserProof = command(node, ["scripts/u06-observe-browser.mjs"]);
const definitions = [
  {
    id: "W0-01",
    files: ["artifacts/w0-01-live/assertions.json"],
    run: () => process.platform === "win32"
      ? command(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "mvn -f services/pom.xml -pl platform-messaging test"])
      : command("mvn", ["-f", "services/pom.xml", "-pl", "platform-messaging", "test"]),
    assert: () => Object.values(json("artifacts/w0-01-live/assertions.json")).every((value) => value === true),
    assertion: "platform messaging tests pass and all immutable live eventing assertions remain true",
  },
  {
    id: "W0-02",
    files: ["artifacts/w0-02-live/live-proof-summary.json"],
    run: () => command(node, ["scripts/seed-local.mjs", "--dry-run", "--seed-file", "infrastructure/seeds/shared-platform-mvp-defaults.json"]),
    assert: () => {
      const proof = json("artifacts/w0-02-live/live-proof-summary.json");
      return proof.verification?.maven === "BUILD SUCCESS" && proof.verification?.referenceUiTypecheck === "PASS"
        && proof.verification?.aidlcAuditExit === 0 && proof.verification?.erpFidelityAuditExit === 0;
    },
    assertion: "current seed validation succeeds and the immutable reference-data proof remains complete",
  },
  {
    id: "W1-01",
    files: ["artifacts/w1-01-live/w1-real-pass-20260720-verified/manifest.json",
      "artifacts/w1-01-live/w1-test-acceptance-waiver-20260717/acceptance-waiver.md"],
    run: () => command(node, ["scripts/u05-booking-preservation.mjs"]),
    assert: () => json("artifacts/w1-01-live/w1-real-pass-20260720-verified/manifest.json").status === "PASSED"
      && allPass("artifacts/u06/observations/commercial.json"),
    assertion: "Booking immutable migrations/seams and the current 13-scenario pricing spine pass; the original waiver is separately protected",
  },
  {
    id: "W2-01",
    files: ["artifacts/w2-01-live/app-shell-auth/manifest.json"],
    run: () => mergeCommands(command(node, ["scripts/w2-01-live-acceptance.mjs", "--validate", "--output-root", "artifacts/w2-01-live/app-shell-auth"]), browserProof),
    assert: () => browserProof.status === 0 && json("artifacts/u06/observations/sign-out.json").status === "PASS",
    assertion: "historical package validates and current authenticated shell, compatibility, and sign-out observations pass",
  },
  {
    id: "W2-02",
    files: ["artifacts/w2-02-live/runs/20260730074058-9adef85fd5de-32c59c26/manifest.json"],
    run: () => mergeCommands(
      command(node, [".yarn/releases/yarn-4.5.3.cjs", "workspace", "@erp/ui", "test"]),
      command(node, [".yarn/releases/yarn-4.5.3.cjs", "workspace", "@erp/app-shell", "test"]),
      command(node, [".yarn/releases/yarn-4.5.3.cjs", "workspace", "@erp/app-booking", "test"]),
      browserProof,
    ),
    assert: () => browserProof.status === 0,
    assertion: "current design-system focused suite and all 76 responsive/accessibility browser cells pass",
  },
];

const members = registry.members.filter((member) => member.category === "PRESERVATION");
const evidence = new Map();
for (const definition of definitions) {
  const executed = definition.run();
  let assertionPassed = false;
  let assertionError;
  try { assertionPassed = definition.assert(); } catch (error) { assertionError = error.message; }
  evidence.set(definition.id, { executed, assertionPassed, assertionError, hashes: definition.files.map(protectedHash), assertion: definition.assertion });
}

const results = members.map((member) => {
  const id = member.key.split(":")[1];
  const item = evidence.get(id);
  const observation = { id, status: item?.executed.status === 0 && item.assertionPassed ? "PASS" : "FAIL" };
  return { key: member.key, status: observation.status, observation, artifactPayloads: {
    "command-log": { id, command: item.executed.command, exitCode: item.executed.status, output: bounded(item.executed.output) },
    "protected-hash": { id, artifacts: item.hashes },
    "assertion-json": { id, assertion: item.assertion, passed: item.assertionPassed, error: item.assertionError ?? null },
  } };
});
const observations = results.map((result) => result.observation);
if (validateClosedMatrix(PRESERVATION_IDS, observations) !== "PASS") {
  throw new Error(`preservation matrix failed: ${JSON.stringify(results.map(({ key, status, artifactPayloads }) => ({ key, status, evidence: artifactPayloads["assertion-json"], command: artifactPayloads["command-log"] })))}`);
}
const envelope = { schemaVersion: 1, stage: "preservation", observedAt: new Date().toISOString(), results };
const output = path.resolve("artifacts/u06/observations/preservation.json");
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ status: "PASS", observations }, null, 2)}\n`);

function command(executable, args) {
  const result = spawnSync(executable, args, { cwd: root, encoding: "utf8", windowsHide: true, timeout: 600_000 });
  return { command: [executable, ...args].join(" "), status: result.status ?? 1, output: `${result.stdout ?? ""}\n${result.stderr ?? result.error?.message ?? ""}` };
}
function json(relative) { return JSON.parse(readFileSync(path.resolve(relative), "utf8").replace(/^\uFEFF/, "")); }
function allPass(relative) { return allPassObject(json(relative)); }
function allPassObject(value) { return Array.isArray(value.results) && value.results.length > 0 && value.results.every((item) => item.status === "PASS"); }
function mergeCommands(...items) {
  return { command: items.map((item) => item.command).join(" && "), status: items.every((item) => item.status === 0) ? 0 : 1,
    output: items.map((item) => `$ ${item.command}\n${item.output}`).join("\n") };
}
function protectedHash(relative) { return { path: relative.replaceAll("\\", "/"), sha256: createHash("sha256").update(readFileSync(path.resolve(relative))).digest("hex") }; }
function bounded(value) { return String(value).replace(/(authorization|cookie|token|password)=?\S*/gi, "$1=<redacted>").slice(-12_000); }
