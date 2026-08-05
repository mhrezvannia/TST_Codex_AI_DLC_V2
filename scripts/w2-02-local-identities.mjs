import { createHash } from "node:crypto";
import { homedir, userInfo } from "node:os";
import { resolve } from "node:path";

export const REQUIRED_LIVE_FIXTURE_KEYS = Object.freeze([
  "W2_02_CUSTOMER_ID",
  "W2_02_LOAD_UNLOCODE",
  "W2_02_DISCHARGE_UNLOCODE",
  "W2_02_VOYAGE_ID",
  "W2_02_EQUIPMENT_TYPE",
  "W2_02_EQUIPMENT_ID",
  "W2_02_COMMODITY_CODE"
]);

const digest = (values) => createHash("sha256").update(JSON.stringify(values)).digest("hex");

export function requireLocalIdentities(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error("Trace sanitization requires a non-empty local-identity list");
  const identities = [...new Set(value.map((item) => typeof item === "string" ? item.trim() : "").filter((item) => item.length >= 3))].sort();
  if (identities.length !== value.length) throw new Error("Local identities must be unique, exact strings of at least three characters");
  return { identities, count: identities.length, configurationDigest: digest(identities) };
}

export function deriveLocalIdentityConfiguration(env, { workspaceRoot, runId, workspaceDigest, storageStatePath }) {
  const missing = REQUIRED_LIVE_FIXTURE_KEYS.filter((key) => !env[key]?.trim());
  if (missing.length) throw new Error(`Missing mandatory W2-02 live fixture identities: ${missing.join(", ")}`);
  const username = userInfo().username || env.USERNAME || env.USER;
  const rawValues = [
    resolve(workspaceRoot),
    resolve(homedir()),
    username,
    runId,
    workspaceDigest,
    resolve(storageStatePath),
    ...REQUIRED_LIVE_FIXTURE_KEYS.map((key) => env[key])
  ];
  const values = [...new Set(rawValues.flatMap((value) => typeof value === "string" && /[\\/]/.test(value) ? [value, value.replaceAll("\\", "/")] : [value]))];
  return requireLocalIdentities(values);
}
