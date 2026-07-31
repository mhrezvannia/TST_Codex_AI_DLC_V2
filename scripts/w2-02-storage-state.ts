import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { SESSION_COOKIE_NAME, encodeSessionCookie } from "../packages/auth/src/index.ts";
import { createLocalSession } from "../apps/auth/lib/auth-server.ts";

const REQUIRED_BASE_URL = "http://127.0.0.1:18088";

export function buildLocalBookingStorageState(env: NodeJS.ProcessEnv, now = new Date()) {
  if (!['local', 'test'].includes(env.RUNTIME_PROFILE ?? '')) {
    throw new Error("W2-02 storage state is restricted to local/test runtime profiles");
  }
  const baseURL = env.W2_02_BASE_URL ?? REQUIRED_BASE_URL;
  if (baseURL !== REQUIRED_BASE_URL) throw new Error(`W2-02 storage state requires ${REQUIRED_BASE_URL}`);
  const session = createLocalSession("local.booking.user");
  if (Date.parse(session.expiresAt) <= now.getTime()) throw new Error("Generated local session is already expired");
  const cookie = encodeSessionCookie(session, env.AUTH_SESSION_SECRET ?? "linercore-local-session-secret");
  return {
    cookies: [{
      name: SESSION_COOKIE_NAME,
      value: cookie,
      domain: "127.0.0.1",
      path: "/",
      expires: Math.floor(Date.parse(session.expiresAt) / 1000),
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const
    }],
    origins: []
  };
}

async function main() {
  const outputFlag = process.argv.indexOf("--output");
  const output = outputFlag >= 0 ? process.argv[outputFlag + 1] : undefined;
  if (!output) throw new Error("Usage: bun scripts/w2-02-storage-state.ts --output <ignored-state.json>");
  const absolute = resolve(output);
  const allowedRoot = resolve(".w2-02-auth");
  if (!(absolute === allowedRoot || absolute.startsWith(`${allowedRoot}\\`) || absolute.startsWith(`${allowedRoot}/`))) {
    throw new Error("Storage state output must be under .w2-02-auth");
  }
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(buildLocalBookingStorageState(process.env), null, 2)}\n`, { flag: "wx", mode: 0o600 });
  process.stdout.write(`${absolute}\n`);
}

if (import.meta.main) await main();
