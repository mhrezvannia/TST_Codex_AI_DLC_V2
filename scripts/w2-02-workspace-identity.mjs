import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const WAVE_A_BASELINE_COMMIT = "c2f13dd";
const EXCLUDED = ["artifacts/w2-02-live/", ".w2-02-traces/", ".yarn/cache/", ".yarn/global/"];
const hash = (value) => createHash("sha256").update(value).digest("hex");
const git = (root, args, encoding = "utf8", runner = spawnSync) => {
  const result = runner("git", args, { cwd: root, encoding, windowsHide: true, maxBuffer: 100 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed`);
  return result.stdout;
};

export function digestWorkspaceParts(value) {
  return hash(JSON.stringify({ baselineCommit: value.baselineCommit, headCommit: value.headCommit, trackedDiffSha256: value.trackedDiffSha256, untracked: value.untracked }));
}

export async function captureWorkspaceIdentity(root = process.cwd(), runner = spawnSync) {
  const workspace = resolve(root);
  const headCommit = git(workspace, ["rev-parse", "HEAD"], "utf8", runner).trim();
  const ancestor = runner("git", ["merge-base", "--is-ancestor", WAVE_A_BASELINE_COMMIT, "HEAD"], { cwd: workspace, windowsHide: true });
  if (ancestor.status !== 0) throw new Error(`Required Wave A baseline ${WAVE_A_BASELINE_COMMIT} is not an ancestor of HEAD`);
  const trackedDiff = git(workspace, ["diff", "--binary", "--no-ext-diff", "HEAD", "--", ".", ":(exclude)artifacts/w2-02-live/**", ":(exclude).w2-02-traces/**"], null, runner);
  const names = git(workspace, ["ls-files", "--others", "--exclude-standard", "-z"], null, runner).toString("utf8").split("\0").filter(Boolean)
    .map((path) => path.replaceAll("\\", "/")).filter((path) => !EXCLUDED.some((prefix) => path.startsWith(prefix))).sort();
  const untracked = [];
  for (const path of names) untracked.push({ path, sha256: hash(await readFile(resolve(workspace, path))) });
  const value = { schemaVersion: 1, baselineCommit: WAVE_A_BASELINE_COMMIT, headCommit, trackedDiffSha256: hash(trackedDiff), untracked };
  return { ...value, workspaceDigest: digestWorkspaceParts(value) };
}

export function assertWorkspaceIdentity(expected, actual) {
  if (!expected || !actual || expected.workspaceDigest !== actual.workspaceDigest || expected.headCommit !== actual.headCommit || expected.baselineCommit !== actual.baselineCommit) throw new Error("Workspace source identity changed during or after acceptance");
  return actual;
}
