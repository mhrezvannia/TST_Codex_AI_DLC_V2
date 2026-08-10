import { createHash } from "node:crypto";

export const ATTEMPT_SCHEMA_VERSION = 3;
export const ATTEMPT_REVISION = "formal-revision-1-correction-pass-5";
export const sha256Bytes = (value) => createHash("sha256").update(value).digest("hex");
export const sha256Record = (value) => sha256Bytes(Buffer.from(JSON.stringify(value)));
const HASH = /^[a-f0-9]{64}$/;

export function createStartedAttempt({ sequence, runId, rerunOf, startedAt, predecessor }) {
  const value = {
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    sequence,
    revision: ATTEMPT_REVISION,
    runId,
    rerunOf: rerunOf ?? null,
    reproducesRun: rerunOf ?? null,
    predecessor: predecessor ?? null,
    event: "STARTED",
    startedAt
  };
  return validateStartedAttempt(value);
}

export function validateStartedAttempt(value) {
  if (value?.schemaVersion !== ATTEMPT_SCHEMA_VERSION || value?.revision !== ATTEMPT_REVISION || value?.event !== "STARTED" || !Number.isInteger(value.sequence) || value.sequence < 1 || !/^[a-zA-Z0-9._-]+$/.test(value.runId ?? "") || !Number.isFinite(Date.parse(value.startedAt))) throw new Error("Started attempt record is invalid");
  if (value.reproducesRun !== value.rerunOf) throw new Error("Started attempt reproduction identity diverged");
  if (value.rerunOf === null) {
    if (value.predecessor !== null || value.sequence !== 1) throw new Error("First attempt cannot claim a predecessor");
  } else if (value.predecessor?.runId !== value.rerunOf || !HASH.test(value.predecessor?.terminalSha256 ?? "") || !Number.isInteger(value.predecessor?.sequence) || value.predecessor.sequence >= value.sequence || !["COMPLETED", "FAILED"].includes(value.predecessor?.status)) {
    throw new Error("Rerun predecessor is not hash-bound to a preserved terminal attempt");
  }
  return value;
}

export function validatePredecessorDigest(startedAttempt, terminalBytes) {
  validateStartedAttempt(startedAttempt);
  if (!startedAttempt.rerunOf || sha256Bytes(terminalBytes) !== startedAttempt.predecessor.terminalSha256) throw new Error("Rerun predecessor terminal digest is not preserved");
  return true;
}

export function createTerminalAttempt({ startedAttempt, startedRecordSha256, finishedAt, status, evidencePayloadSha256, diagnosticHash }) {
  validateStartedAttempt(startedAttempt);
  const value = {
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    sequence: startedAttempt.sequence,
    revision: startedAttempt.revision,
    runId: startedAttempt.runId,
    rerunOf: startedAttempt.rerunOf,
    reproducesRun: startedAttempt.reproducesRun,
    predecessor: startedAttempt.predecessor,
    event: status === "COMPLETED" ? "COMPLETED" : "FAILED",
    status,
    startedAt: startedAttempt.startedAt,
    finishedAt,
    startedRecordSha256,
    ...(status === "COMPLETED" ? { evidencePayloadSha256 } : { diagnosticHash })
  };
  return validateTerminalAttempt(value, startedAttempt);
}

export function validateTerminalAttempt(value, startedAttempt) {
  validateStartedAttempt(startedAttempt);
  if (value?.schemaVersion !== ATTEMPT_SCHEMA_VERSION || value.runId !== startedAttempt.runId || value.sequence !== startedAttempt.sequence || value.revision !== startedAttempt.revision || value.rerunOf !== startedAttempt.rerunOf || value.reproducesRun !== startedAttempt.reproducesRun || JSON.stringify(value.predecessor) !== JSON.stringify(startedAttempt.predecessor) || value.startedAt !== startedAttempt.startedAt || !HASH.test(value.startedRecordSha256 ?? "") || value.startedRecordSha256 !== sha256Record(startedAttempt)) throw new Error("Terminal attempt is not bound to its immutable start record");
  const start = Date.parse(value.startedAt); const finish = Date.parse(value.finishedAt); if (!Number.isFinite(finish) || finish < start) throw new Error("Terminal attempt chronology is invalid");
  if (value.status === "COMPLETED") {
    if (value.event !== "COMPLETED" || !HASH.test(value.evidencePayloadSha256 ?? "") || value.diagnosticHash !== undefined) throw new Error("Completed attempt is not bound to the evidence payload");
  } else if (value.status === "FAILED") {
    if (value.event !== "FAILED" || !HASH.test(value.diagnosticHash ?? "") || value.evidencePayloadSha256 !== undefined) throw new Error("Failed attempt lacks its safe diagnostic binding");
  } else throw new Error("Terminal attempt status is invalid");
  return value;
}

const errorText = (error) => (error instanceof Error ? error.message : String(error)).replace(/(?:Bearer|Basic)\s+[^\s"',]+/gi, "[REDACTED]").replace(/(?:token|secret|password)[=:]\s*[^\s"',]+/gi, "[REDACTED]");

export function validateIndexRecovery(value, startedAttempt, terminalAttempt) {
  validateTerminalAttempt(terminalAttempt, startedAttempt);
  if (value?.schemaVersion !== ATTEMPT_SCHEMA_VERSION || value.revision !== ATTEMPT_REVISION || value.event !== "INDEX_RECOVERY" || value.runId !== startedAttempt.runId || value.sequence !== startedAttempt.sequence || value.status !== terminalAttempt.status) throw new Error("Attempt index recovery identity is invalid");
  if (value.startedRecordSha256 !== sha256Record(startedAttempt) || value.terminalRecordSha256 !== sha256Record(terminalAttempt) || !["STARTED", "COMPLETED", "FAILED"].includes(value.failedEvent) || !HASH.test(value.indexErrorHash ?? "") || typeof value.indexError !== "string" || value.indexError.length === 0 || value.indexErrorHash !== sha256Bytes(Buffer.from(value.indexError)) || typeof value.terminalIndexed !== "boolean") throw new Error("Attempt index recovery digests are invalid");
  return value;
}

export async function persistTerminalAttempt({ startedAttempt, terminalPath, recoveryPath, writeRecord, writeRecoveryRecord = writeRecord, appendEvent, finishedAt, status, evidencePayloadSha256, diagnosticHash, priorIndexFailure = null, terminalAttempt = null, terminalAlreadyPersisted = false }) {
  const terminal = terminalAttempt ? validateTerminalAttempt(terminalAttempt, startedAttempt) : createTerminalAttempt({ startedAttempt, startedRecordSha256: sha256Record(startedAttempt), finishedAt, status, evidencePayloadSha256, diagnosticHash });
  if (terminalAlreadyPersisted) {
    if (!terminalAttempt) throw new Error("A pre-persisted terminal attempt must be supplied");
  } else await writeRecord(terminalPath, terminal);
  let terminalIndexed = false;
  let terminalIndexError = null;
  try { await appendEvent(terminal); terminalIndexed = true; }
  catch (error) { terminalIndexError = error; }
  const indexFailure = priorIndexFailure ?? (terminalIndexError ? { failedEvent: terminal.event, error: terminalIndexError } : null);
  if (!indexFailure) return { terminal, recovery: null, indexError: null, terminalIndexed };
  const errors = [indexFailure.error, ...(terminalIndexError && terminalIndexError !== indexFailure.error ? [terminalIndexError] : [])];
  const message = errors.map(errorText).join(" | terminal append: ");
  const recovery = validateIndexRecovery({
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    revision: ATTEMPT_REVISION,
    runId: startedAttempt.runId,
    sequence: startedAttempt.sequence,
    status: terminal.status,
    event: "INDEX_RECOVERY",
    failedEvent: indexFailure.failedEvent,
    startedRecordSha256: sha256Record(startedAttempt),
    terminalRecordSha256: sha256Record(terminal),
    indexError: message,
    indexErrorHash: sha256Bytes(Buffer.from(message)),
    terminalIndexed
  }, startedAttempt, terminal);
  await writeRecoveryRecord(recoveryPath, recovery);
  return { terminal, recovery, indexError: new Error("Attempt index append failed after immutable local terminal persistence", { cause: indexFailure.error }), terminalIndexed };
}

export async function persistStartedAttempt({ startedAttempt, startedPath, terminalPath, recoveryPath, writeRecord, writeRecoveryRecord = writeRecord, appendEvent, finishedAt = () => new Date().toISOString() }) {
  await writeRecord(startedPath, startedAttempt);
  try {
    await appendEvent(startedAttempt);
    return { started: startedAttempt, terminal: null, recovery: null, error: null };
  } catch (indexError) {
    const diagnosticHash = sha256Bytes(Buffer.from(indexError instanceof Error ? indexError.message : String(indexError)));
    const persisted = await persistTerminalAttempt({ startedAttempt, terminalPath, recoveryPath, writeRecord, writeRecoveryRecord, appendEvent, finishedAt: finishedAt(), status: "FAILED", diagnosticHash, priorIndexFailure: { failedEvent: "STARTED", error: indexError } });
    return { started: startedAttempt, terminal: persisted.terminal, recovery: persisted.recovery, error: new Error("Attempt index append failed after immutable STARTED persistence", { cause: indexError }) };
  }
}
