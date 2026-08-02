import { randomUUID } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { encodeSessionCookie, SESSION_COOKIE_NAME } from "../../packages/auth/src/index.ts";

const EDGE = "http://127.0.0.1:18088";
const PROBES = Object.freeze([
  { name: "auth-session", path: "/auth/api/auth/session", session: true },
  { name: "booking-bff", path: "/api/bookings" },
  { name: "reference-data-bff", path: "/reference-data/api/permissions/reference-data" },
  { name: "charge-agreements-bff", path: "/charge-agreements/api/agreements", subject: "local.pricing.analyst" },
]);

export async function observeAuthenticatedReadiness({ root, storageStatePath, subject, fetchImpl = fetch, now = () => new Date(),
  sessionCookieForSubject = (target) => localAcceptanceCookie(root, target, now()) }) {
  const cookie = readSignedCookie(root, storageStatePath, now());
  const services = [];
  for (const probe of PROBES) {
    const activeSubject = probe.subject ?? subject;
    const activeCookie = probe.subject ? sessionCookieForSubject(activeSubject) : cookie;
    const cookieHeader = `${activeCookie.name}=${activeCookie.value}`;
    const url = `${EDGE}${probe.path}`; const correlationId = `u06-readiness-${crypto.randomUUID()}`;
    try {
      const response = await fetchImpl(url, { redirect: "manual", signal: AbortSignal.timeout(10_000),
        headers: { cookie: cookieHeader, "x-correlation-id": correlationId } });
      let authenticated = response.status >= 200 && response.status < 300;
      if (probe.session && authenticated) {
        const body = await response.json();
        authenticated = body.isAuthenticated === true && [body.subject, body.subjectId].includes(activeSubject);
      }
      services.push({ name: probe.name, url, status: response.status, ready: response.status >= 200 && response.status < 300,
        authenticated, subject: activeSubject, correlationId });
    } catch (error) {
      services.push({ name: probe.name, url, status: 0, ready: false, authenticated: false,
        subject: activeSubject, correlationId, error: error instanceof Error ? error.message : String(error) });
    }
  }
  const passed = services.every((service) => service.ready && service.authenticated);
  return { schemaVersion: 1, stage: "readiness", observedAt: now().toISOString(), proof: {
    status: passed ? "PASS" : "FAIL", signedAuthenticated: passed, subject, edgeOrigin: EDGE, services,
  } };
}

function localAcceptanceCookie(root, subjectId, now) {
  const envFile = readFileSync(path.join(root, "infrastructure", "env", "wave-a.env.example"), "utf8");
  const line = envFile.split(/\r?\n/).find((candidate) => candidate.startsWith("AUTH_SESSION_SECRET="));
  const secret = line?.slice("AUTH_SESSION_SECRET=".length).trim();
  if (!secret) throw new Error("Wave A session signing secret unavailable");
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const session = { sessionId: randomUUID(), subjectId, subjectType: "user", displayName: subjectId,
    email: `${subjectId}@example.test`, roles: ["pricing"], permissions: [
      "charge-agreement:read", "charge-agreements:read", "charge-agreements:create", "charge-agreements:update",
      "charge-agreements:approve", "charge-agreements:create-successor", "charge-agreements:suspend", "charge-agreements:expire",
      "charge-rates:read", "charge-rates:create", "charge-rates:update", "charge-rates:approve", "charge-rates:create-successor",
      "charge-manual-cases:read",
    ], issuedAt: now.toISOString(), expiresAt: expiresAt.toISOString(), policyVersion: "u06-local-acceptance-2026-08-02" };
  return { name: SESSION_COOKIE_NAME, value: encodeSessionCookie(session, secret) };
}

export function readSignedCookie(root, relativePath, now) {
  if (!relativePath) throw new Error("signed storage state path unavailable");
  const absolute = path.resolve(root, relativePath); const stat = lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error("signed storage state identity/size rejected");
  const real = realpathSync.native(absolute); const allowed = path.resolve(root, ".u06-auth");
  if (!real.toLocaleLowerCase("en-US").startsWith(`${allowed.toLocaleLowerCase("en-US")}${path.sep}`)) throw new Error("signed storage state containment rejected");
  const state = JSON.parse(readFileSync(real, "utf8"));
  const cookie = state.cookies?.find((item) => item.name === SESSION_COOKIE_NAME && item.domain === "127.0.0.1" && item.httpOnly === true);
  if (!cookie?.value || !Number.isFinite(cookie.expires) || cookie.expires * 1000 <= now.getTime()) throw new Error("fresh signed session cookie unavailable");
  return cookie;
}
