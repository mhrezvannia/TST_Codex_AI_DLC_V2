import { createHash } from "node:crypto";

const HASH = /^[a-f0-9]{64}$/;
const timestamp = (value, label) => {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} timestamp is invalid`);
  return parsed;
};

export const hashBrowserGuard = (guard) => createHash("sha256").update(JSON.stringify(guard)).digest("hex");

export function createBrowserPermit({ guard, runId, workspaceDigest, authorizedAt = new Date().toISOString() }) {
  const guardFinished = timestamp(guard?.finishedAt, "Pre-browser guard finish");
  if (timestamp(authorizedAt, "Browser permit") < guardFinished) throw new Error("Browser permit predates pre-browser guard completion");
  return {
    schemaVersion: 1,
    producer: "playwright-global-setup",
    status: "PERMITTED",
    runId,
    workspaceDigest,
    guardFinishedAt: guard.finishedAt,
    guardSha256: hashBrowserGuard(guard),
    authorizedAt
  };
}

export function validateBrowserPermit(permit, guard, { runId, workspaceDigest } = {}) {
  if (permit?.schemaVersion !== 1 || permit?.producer !== "playwright-global-setup" || permit?.status !== "PERMITTED" || permit?.runId !== runId || permit?.workspaceDigest !== workspaceDigest || permit?.guardFinishedAt !== guard?.finishedAt || !HASH.test(permit?.guardSha256 ?? "") || permit.guardSha256 !== hashBrowserGuard(guard)) throw new Error("Browser permit is foreign or not bound to the completed pre-browser guard");
  if (timestamp(permit.authorizedAt, "Browser permit") < timestamp(guard.finishedAt, "Pre-browser guard finish")) throw new Error("Browser permit predates pre-browser guard completion");
  return permit;
}

export function validateBrowserCaseChronology({ browserDirect, preBrowserGuard, browserPermit, cases, cleanup, postGuard }) {
  const processStarted = timestamp(browserDirect?.startedAt, "Browser process start");
  const processFinished = timestamp(browserDirect?.finishedAt, "Browser process finish");
  const guardStarted = timestamp(preBrowserGuard?.startedAt, "Pre-browser guard start");
  const guardFinished = timestamp(preBrowserGuard?.finishedAt, "Pre-browser guard finish");
  const permitted = timestamp(browserPermit?.authorizedAt, "Browser permit");
  if (processStarted > guardStarted || guardStarted > guardFinished || guardFinished > permitted || permitted > processFinished) throw new Error("Browser process/global-setup permit chronology is invalid");
  if (!Array.isArray(cases) || cases.length === 0) throw new Error("Browser chronology requires case records");
  for (const entry of cases) {
    const started = timestamp(entry?.startedAt, `Case ${entry?.id ?? "unknown"} start`);
    const action = timestamp(entry?.actionAt, `Case ${entry?.id ?? "unknown"} action`);
    const captured = timestamp(entry?.capturedAt, `Case ${entry?.id ?? "unknown"} capture`);
    if (started < guardFinished || started < permitted || action < started || captured < action || captured > processFinished) throw new Error(`Case chronology is invalid: ${entry?.id ?? "unknown"}`);
  }
  if (timestamp(cleanup?.startedAt, "Cleanup start") < processFinished || timestamp(postGuard?.startedAt, "Post-guard start") < timestamp(cleanup?.finishedAt, "Cleanup finish")) throw new Error("Browser/cleanup/post-guard chronology is invalid");
  return true;
}
