import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { requireLocalIdentities } from "./w2-02-local-identities.mjs";

const JSONL_ENTRY = /\.(?:trace|network)$/i;
const TEXT_ENTRY = /\.(?:trace|network|stacks|json|jsonl|txt|html|css|js)$/i;
const IMAGE_ENTRY = /\.(?:png|jpe?g|webp)$/i;
const RESOURCE_ENTRY = /(^|\/)resources?\//i;
const SENSITIVE_KEY = /(^|[_-])(authorization|proxy[_-]?authorization|cookie|set[_-]?cookie|access[_-]?token|refresh[_-]?token|id[_-]?token|client[_-]?secret|password|credential|session(?:id|token)?|api[_-]?key)($|[_-])/i;
const BODY_KEY = /(^|[_-])(postData|requestBody|responseBody|resourceContent|formData|multipart|body)($|[_-])/i;
const AUTH = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+\/-]+=*/gi;
const HEADER = /\b(Authorization|Proxy-Authorization|Cookie|Set-Cookie)\s*:\s*[^\r\n]+/gi;
const ASSIGNMENT = /\b(access_token|refresh_token|id_token|client_secret|password|session(?:id|token)?|api[_-]?key)=([^&\s"';]+)/gi;
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function redactString(value, identities) {
  let clean = value.replace(AUTH, "$1 [REDACTED]").replace(HEADER, "$1: [REDACTED]").replace(ASSIGNMENT, "$1=[REDACTED]");
  try { const url = new URL(clean); for (const key of [...url.searchParams.keys()]) if (SENSITIVE_KEY.test(key)) url.searchParams.set(key, "[REDACTED]"); clean = url.toString(); } catch {}
  for (const identity of identities) clean = clean.replace(new RegExp(escapePattern(identity), "gi"), "[LOCAL_IDENTITY_REDACTED]");
  return clean;
}

function sanitizeValue(value, identities, parentKey = "") {
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, identities, parentKey));
  if (value && typeof value === "object") {
    if (typeof value.name === "string" && SENSITIVE_KEY.test(value.name) && "value" in value) return { ...value, value: "[REDACTED]" };
    const clean = {};
    for (const [key, item] of Object.entries(value)) {
      if (BODY_KEY.test(key)) { clean[key] = "[REMOVED]"; continue; }
      if (SENSITIVE_KEY.test(key)) { clean[key] = "[REDACTED]"; continue; }
      clean[key] = sanitizeValue(item, identities, key);
    }
    return clean;
  }
  return typeof value === "string" ? redactString(value, identities) : value;
}

export function redactTraceText(source, identities) {
  identities = requireLocalIdentities(identities).identities;
  const lines = source.split(/\r?\n/); const output = [];
  for (const line of lines) {
    if (!line) { output.push(line); continue; }
    try { output.push(JSON.stringify(sanitizeValue(JSON.parse(line), identities))); }
    catch { output.push(redactString(line, identities)); }
  }
  return output.join("\n");
}

export function traceTextIsSafe(source, identities) {
  identities = requireLocalIdentities(identities).identities;
  if (redactTraceText(source, identities) !== source) return false;
  if (identities.some((identity) => identity && source.includes(identity))) return false;
  for (const line of source.split(/\r?\n/).filter(Boolean)) {
    try { const parsed = JSON.parse(line); const serialized = JSON.stringify(parsed); if (/"(?:postData|requestBody|responseBody|resourceContent|formData|multipart)"\s*:\s*"(?!\[REMOVED\])/.test(serialized) || /"(?:authorization|cookie|set-cookie|client_secret|password|sessionToken)"\s*:\s*"(?!\[REDACTED\])/.test(serialized)) return false; } catch {}
  }
  return true;
}

function sanitizeEntries(entries, identities) {
  const cleanEntries = {}; let traceEntries = 0; let droppedResources = 0; let modelEvents = 0;
  for (const [name, bytes] of Object.entries(entries)) {
    if (RESOURCE_ENTRY.test(name)) { droppedResources += 1; continue; }
    if (IMAGE_ENTRY.test(name)) { cleanEntries[name] = bytes; continue; }
    if (!TEXT_ENTRY.test(name)) throw new Error(`UNCLASSIFIED_ARCHIVE_ENTRY:${name}`);
    const clean = redactTraceText(strFromU8(bytes), identities);
    if (!traceTextIsSafe(clean, identities)) throw new Error("REDACTION_INCOMPLETE");
    if (JSONL_ENTRY.test(name)) {
      for (const line of clean.split(/\r?\n/).filter(Boolean)) { const event = JSON.parse(line); if (name.endsWith(".trace") && typeof event.type === "string") modelEvents += 1; }
      traceEntries += 1;
    }
    cleanEntries[name] = strToU8(clean);
  }
  if (traceEntries < 2 || modelEvents === 0) throw new Error("TRACE_MODEL_INCOMPLETE");
  return { cleanEntries, droppedResources, modelEvents };
}

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function failure(reportPath) { const report = { sanitizer: "w2-02-trace-sanitize/v3", closureStatus: "FAILED", failureCode: "TRACE_SANITIZATION_FAILED", rawInputRemoved: true, promotedRemoved: true, secretMaterial: "EXCLUDED" }; await mkdir(dirname(resolve(reportPath)), { recursive: true }); await writeFile(resolve(reportPath), JSON.stringify(report, null, 2) + "\n"); }

export async function sanitizeTraceArchive(inputPath, outputPath, reportPath, options = {}) {
  const input = resolve(inputPath); const output = resolve(outputPath);
  try {
    const identityConfiguration = requireLocalIdentities(options.localIdentities);
    const identities = identityConfiguration.identities;
    if (input === output) throw new Error("RAW_PROMOTION_PATH_COLLISION");
    const rawBytes = await readFile(input); const first = sanitizeEntries(unzipSync(rawBytes), identities); const promotedBytes = Buffer.from(zipSync(first.cleanEntries, { level: 6 }));
    await mkdir(dirname(output), { recursive: true }); await writeFile(output, promotedBytes);
    const reopened = sanitizeEntries(unzipSync(await readFile(output)), identities);
    const report = { sanitizer: "w2-02-trace-sanitize/v3", closureStatus: "PASS", inputHash: hash(rawBytes), promotedHash: hash(promotedBytes), secondScan: "PASS", traceOpenValidation: `PASS: reopened ${reopened.modelEvents} trace model events and ${Object.keys(reopened.cleanEntries).length} classified entries`, droppedResourceEntries: first.droppedResources, localIdentityScan: "PASS", localIdentityCount: identityConfiguration.count, localIdentityConfigurationDigest: identityConfiguration.configurationDigest, rawInputRemoved: true };
    await rm(input, { force: true }); await mkdir(dirname(resolve(reportPath)), { recursive: true }); await writeFile(resolve(reportPath), JSON.stringify(report, null, 2) + "\n"); return report;
  } catch { await Promise.all([rm(input, { force: true }), rm(output, { force: true })]); await failure(reportPath); throw new Error("Trace sanitization failed; raw/staged and promoted archives were removed"); }
}
