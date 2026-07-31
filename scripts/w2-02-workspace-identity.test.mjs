import assert from "node:assert/strict";
import test from "node:test";
import { captureWorkspaceIdentity, digestWorkspaceParts } from "./w2-02-workspace-identity.mjs";

test("captures baseline plus dirty tracked/untracked source identity deterministically", async () => {
  const runner = (_command, args, options) => {
    if (args[0] === "rev-parse") return { status: 0, stdout: "c2f13dd\n" };
    if (args[0] === "merge-base") return { status: 0, stdout: "" };
    if (args[0] === "diff") return { status: 0, stdout: options.encoding === null ? Buffer.from("dirty tracked diff") : "dirty tracked diff" };
    if (args[0] === "ls-files") return { status: 0, stdout: options.encoding === null ? Buffer.alloc(0) : "" };
    throw new Error("unexpected git command");
  };
  const first = await captureWorkspaceIdentity(process.cwd(), runner); const second = await captureWorkspaceIdentity(process.cwd(), runner);
  assert.equal(first.baselineCommit, "c2f13dd"); assert.equal(first.workspaceDigest, second.workspaceDigest); assert.match(first.trackedDiffSha256, /^[a-f0-9]{64}$/); assert.notEqual(first.trackedDiffSha256, "0".repeat(64));
});

test("any tracked diff or untracked source change alters the workspace digest", () => {
  const value = { baselineCommit: "c2f13dd", headCommit: "abc", trackedDiffSha256: "a".repeat(64), untracked: [{ path: "a.ts", sha256: "b".repeat(64) }] };
  assert.notEqual(digestWorkspaceParts(value), digestWorkspaceParts({ ...value, trackedDiffSha256: "c".repeat(64) }));
  assert.notEqual(digestWorkspaceParts(value), digestWorkspaceParts({ ...value, untracked: [{ path: "a.ts", sha256: "d".repeat(64) }] }));
});
