import { SESSION_COOKIE_NAME } from "@erp/auth";
import { createLocalSession, decodeCookie, encodeCookie, isAuthBypassEnabled, readCookie, safeSessionSummary, setCookieHeader } from "./auth-server";

test("encodes and decodes session cookies", () => {
  const session = createLocalSession("user-1");
  expect(decodeCookie(encodeCookie(session))).toMatchObject({ subjectId: "user-1" });
});

test("reads safe session summary from cookie", () => {
  const session = createLocalSession("user-1");
  const cookie = setCookieHeader(SESSION_COOKIE_NAME, encodeCookie(session), 3600);
  const request = new Request("http://localhost/api/auth/session", { headers: { cookie } });

  expect(safeSessionSummary(request)).toMatchObject({
    isAuthenticated: true,
    subjectId: "user-1"
  });
});

test("reads named cookie value", () => {
  expect(readCookie("a=1; b=2", "b")).toBe("2");
});

test("auth bypass returns local session without a cookie", () => {
  process.env.AUTH_BYPASS = "true";
  process.env.APP_ENV = "local";
  const request = new Request("http://localhost/api/auth/session");

  expect(isAuthBypassEnabled()).toBe(true);
  expect(safeSessionSummary(request)).toMatchObject({
    isAuthenticated: true,
    subjectId: "local-user"
  });

  delete process.env.AUTH_BYPASS;
  delete process.env.APP_ENV;
});

test("auth bypass is ignored outside local runtime profile", () => {
  process.env.AUTH_BYPASS = "true";
  process.env.APP_ENV = "staging";
  const request = new Request("http://localhost/api/auth/session");

  expect(isAuthBypassEnabled()).toBe(false);
  expect(safeSessionSummary(request)).toMatchObject({
    isAuthenticated: false
  });

  delete process.env.AUTH_BYPASS;
  delete process.env.APP_ENV;
});
