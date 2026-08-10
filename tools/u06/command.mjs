import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";

export const COMMAND_LOG_CAP = 32 * 1024 * 1024;
const SECRET = /(?:token|secret|password|cookie|authorization|session|credential|api[-_]?key)/i;
const UNAVAILABLE = new Set(["ENOENT", "EACCES", "EPERM", "ENOSYS"]);

export function runBoundedCommand(spec, { execute = spawnSync, now = () => new Date(), monotonic = () => process.hrtime.bigint() } = {}) {
  validateSpec(spec);
  const startedAt = now().toISOString(); const start = monotonic();
  let result;
  try {
    const invocation = platformInvocation(spec.command, spec.args ?? []);
    result = execute(invocation.command, invocation.args, {
      cwd: spec.cwd, env: spec.env, encoding: "utf8", timeout: spec.timeoutMs,
      maxBuffer: spec.outputCapBytes ?? COMMAND_LOG_CAP, windowsHide: true,
    });
  } catch (error) { result = { error, status: null, stdout: "", stderr: "" }; }
  const end = monotonic(); const completedAt = now().toISOString();
  const errorCode = result.error?.code;
  const nestedCapabilityFailure = /(?:spawnSync|spawn)\s+[^\r\n]*(?:EPERM|EACCES|ENOENT|ENOSYS)|\b(?:EPERM|EACCES|ENOENT|ENOSYS)\b[^\r\n]*capabilit/i
    .test(`${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.message ?? ""}`);
  let status;
  let classification;
  if (UNAVAILABLE.has(errorCode) || errorCode === "ETIMEDOUT" || errorCode === "ENOBUFS" || nestedCapabilityFailure) { status = "BLOCKED"; classification = "CAPABILITY_UNAVAILABLE"; }
  else if (result.error || result.status !== 0) { status = "FAIL"; classification = "COMMAND_MISMATCH"; }
  else { status = "PASS"; classification = "OBSERVED_ZERO_EXIT"; }
  if (status === "PASS" && spec.assert) {
    try { if (spec.assert(result) !== true) throw new Error("semantic assertion returned false"); }
    catch (error) { status = "FAIL"; classification = "ASSERTION_MISMATCH"; result.assertionError = error; }
  }
  return {
    recordKind: "gate", schemaVersion: 1, recordId: spec.id, gateId: spec.id, phase: spec.phase,
    requirements: [...spec.requirements], command: redactArgv([spec.command, ...(spec.args ?? [])]),
    startedAt, completedAt, startMonotonicNs: start.toString(), endMonotonicNs: end.toString(),
    exitCode: Number.isInteger(result.status) ? result.status : null, status, classification,
    stdout: boundText(redactText(result.stdout), spec.outputCapBytes), stderr: boundText(redactText(result.stderr), spec.outputCapBytes),
    errorCode: errorCode ?? null, summary: boundText(redactText(result.assertionError?.message ?? result.error?.message
      ?? (status === "FAIL" ? commandFailureSummary(result) : classification)), Math.min(spec.outputCapBytes ?? COMMAND_LOG_CAP, 4_000)),
    blockerId: status === "BLOCKED" ? `B-${spec.id}` : undefined,
    probeHistory: [{ completedAt, exitCode: Number.isInteger(result.status) ? result.status : null, errorCode: errorCode ?? null, status }],
  };
}

function commandFailureSummary(result) {
  const output = `${result.stderr ?? ""}\n${result.stdout ?? ""}`.trim();
  return output ? output.slice(-4_000) : "COMMAND_MISMATCH";
}

function platformInvocation(command, args) {
  if (process.platform !== "win32" || command !== "npm") return { command, args };
  return {
    command: process.execPath,
    args: [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), ...args],
  };
}

export function makeSkippedResult(spec, terminal) {
  if (!terminal?.recordId || !["BLOCKED", "FAIL"].includes(terminal.status)) throw new Error("SKIPPED requires an earlier terminal record");
  return { recordKind: "gate", schemaVersion: 1, recordId: spec.id, gateId: spec.id, phase: spec.phase,
    requirements: [...spec.requirements], command: redactArgv([spec.command, ...(spec.args ?? [])]),
    startedAt: terminal.completedAt, completedAt: terminal.completedAt, startMonotonicNs: terminal.endMonotonicNs,
    endMonotonicNs: terminal.endMonotonicNs, exitCode: null, status: "SKIPPED", classification: "EARLIER_TERMINAL",
    skippedBecause: terminal.recordId, summary: `not executed after ${terminal.recordId}` };
}

export function redactArgv(argv) {
  return argv.map((value, index) => {
    const text = String(value);
    if (SECRET.test(text) || (index > 0 && SECRET.test(String(argv[index - 1])))) return "<redacted>";
    return text.replace(/(https?:\/\/[^:@/\s]+):[^@/\s]+@/g, "$1:<redacted>@");
  });
}

export function redactText(value) {
  const structured = redactEmbeddedJson(String(value ?? ""));
  return structured
    .replace(/((?:authorization|cookie|set-cookie|x-linercore-service-token|token|secret|password|session|credential|api[-_]?key)\s*[:=]\s*)(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?:bearer\s+)?[^\s,;\r\n]+)/gi, "$1<redacted>")
    .replace(/((?:\\?")(?:authorization|cookie|set-cookie|x-linercore-service-token|token|secret|password|session|credential|api[-_]?key)(?:\\?")\s*:\s*)(?:\\?"(?:\\.|[^"\\])*\\?"|[^,}\r\n]+)/gi, (_, prefix) => `${prefix}${prefix.includes("\\\"") ? "\\\"<redacted>\\\"" : "\"<redacted>\""}`)
    .replace(/(bearer\s+)[a-z0-9._~+\/-]+/gi, "$1<redacted>")
    .replace(/(https?:\/\/[^:@/\s]+):[^@/\s]+@/g, "$1:<redacted>@");
}

function redactEmbeddedJson(text) {
  const direct = redactParsedJson(text);
  if (direct !== null) return direct;
  let output = "";
  let cursor = 0;
  while (cursor < text.length) {
    const start = findJsonStart(text, cursor);
    if (start < 0) return output + text.slice(cursor);
    output += text.slice(cursor, start);
    const end = findJsonEnd(text, start);
    if (end < 0) return output + text.slice(start);
    const candidate = text.slice(start, end + 1);
    const redacted = redactParsedJson(candidate);
    if (redacted === null) {
      output += text[start];
      cursor = start + 1;
    } else {
      output += redacted;
      cursor = end + 1;
    }
  }
  return output;
}

function redactParsedJson(text) {
  try { return JSON.stringify(redactJsonValue(JSON.parse(text))); } catch { return null; }
}

function redactJsonValue(value, key = "") {
  if (SECRET.test(key)) return "<redacted>";
  if (Array.isArray(value)) return value.map((item) => redactJsonValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redactJsonValue(child, childKey)]));
  if (typeof value === "string") {
    const nested = redactParsedJson(value);
    return nested === null ? value.replace(/(bearer\s+)[a-z0-9._~+\/-]+/gi, "$1<redacted>") : nested;
  }
  return value;
}

function findJsonStart(text, offset) {
  const object = text.indexOf("{", offset);
  const array = text.indexOf("[", offset);
  return object < 0 ? array : array < 0 ? object : Math.min(object, array);
}

function findJsonEnd(text, start) {
  const stack = [text[start]]; let quoted = false; let escaped = false;
  for (let index = start + 1; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") quoted = false;
      continue;
    }
    if (character === "\"") quoted = true;
    else if (character === "{" || character === "[") stack.push(character);
    else if (character === "}" || character === "]") {
      const open = stack.pop();
      if ((open === "{" && character !== "}") || (open === "[" && character !== "]")) return -1;
      if (!stack.length) return index;
    }
  }
  return -1;
}

function validateSpec(spec) {
  if (!spec?.id || !spec.command || !Array.isArray(spec.requirements) || !Number.isSafeInteger(spec.timeoutMs) || spec.timeoutMs <= 0) throw new Error("invalid bounded command spec");
  if ((spec.outputCapBytes ?? COMMAND_LOG_CAP) > COMMAND_LOG_CAP) throw new Error("command output cap exceeds 32 MiB");
}
function boundText(value, cap = COMMAND_LOG_CAP) {
  const bytes = Buffer.from(String(value ?? ""), "utf8");
  if (bytes.length <= cap) return bytes.toString("utf8");
  let end = cap;
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) end--;
  return bytes.subarray(0, end).toString("utf8");
}
