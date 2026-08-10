import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encodeSessionCookie, SESSION_COOKIE_NAME } from "../packages/auth/src/index.ts";

const REQUIRED_BASE_URL = "http://127.0.0.1:18088";
const PERMISSIONS = Object.freeze([
  "booking:read", "booking:create", "booking:request-pricing", "booking:amend", "booking:reconfirm",
  "reference-data:read", "reference-data:create",
  "charge-agreement:read", "charge-agreements:read", "charge-agreements:create",
  "charge-agreements:update", "charge-agreements:approve", "charge-agreements:create-successor",
  "charge-agreements:suspend", "charge-agreements:expire",
  "charge-rates:read", "charge-rates:create", "charge-rates:update", "charge-rates:approve",
  "charge-rates:create-successor", "charge-manual-cases:read",
]);

export function buildU06StorageState(env = process.env, now = new Date()) {
  if (!["local", "test"].includes(env.RUNTIME_PROFILE ?? "")) throw new Error("U06 storage state is restricted to local/test runtime profiles");
  if ((env.U06_BASE_URL ?? REQUIRED_BASE_URL) !== REQUIRED_BASE_URL) throw new Error(`U06 storage state requires ${REQUIRED_BASE_URL}`);
  const subjectId = env.U06_SIGNED_SESSION_SUBJECT ?? "local.booking.user";
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const session = {
    sessionId: randomUUID(), subjectId, subjectType: "user", displayName: subjectId,
    email: `${subjectId}@example.test`, roles: ["booking-desk", "reference-admin", "pricing"],
    permissions: [...PERMISSIONS], issuedAt: now.toISOString(), expiresAt: expiresAt.toISOString(),
    policyVersion: "u06-local-acceptance-2026-08-02",
  };
  const cookie = encodeSessionCookie(session, env.AUTH_SESSION_SECRET ?? waveASessionSecret());
  return { cookies: [{ name: SESSION_COOKIE_NAME, value: cookie, domain: "127.0.0.1", path: "/",
    expires: Math.floor(expiresAt.getTime() / 1000), httpOnly: true, secure: false, sameSite: "Lax" }], origins: [] };
}

function main() {
  const output = valueAfter(process.argv, "--output");
  if (!output) throw new Error("Usage: node scripts/u06-storage-state.mjs --output .u06-auth/<state>.json");
  const absolute = path.resolve(output); const allowed = path.resolve(".u06-auth");
  if (!absolute.startsWith(`${allowed}${path.sep}`)) throw new Error("U06 storage state output must be under .u06-auth");
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(buildU06StorageState(), null, 2)}\n`, { flag: "wx", mode: 0o600 });
  process.stdout.write(`${path.relative(process.cwd(), absolute).replaceAll("\\", "/")}\n`);
}

function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }

function waveASessionSecret() {
  const envFile = readFileSync(path.resolve("infrastructure", "env", "wave-a.env.example"), "utf8");
  const line = envFile.split(/\r?\n/).find((candidate) => candidate.startsWith("AUTH_SESSION_SECRET="));
  const value = line?.slice("AUTH_SESSION_SECRET=".length).trim();
  if (!value) throw new Error("Wave A session signing secret unavailable");
  return value;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
