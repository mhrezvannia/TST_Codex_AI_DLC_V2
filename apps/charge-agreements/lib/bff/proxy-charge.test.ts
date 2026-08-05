// @vitest-environment node

import { encodeSessionCookie, SESSION_COOKIE_NAME, type AuthSession } from "@erp/auth";
import { resetChargeConfigurationForTests } from "./config";
import { resetChargeLifecycleForTests } from "./lifecycle";
import { AGREEMENT_POLICIES } from "./policies";
import { protectedForwardingPoolForTests, proxyCharge } from "./proxy-charge";

const session: AuthSession = {
  sessionId: "cancel-session",
  subjectId: "charge-user",
  subjectType: "user",
  displayName: "Charge User",
  roles: [],
  permissions: ["charge-agreements:read", "charge-agreements:create"],
  issuedAt: "2026-07-01T00:00:00Z",
  expiresAt: "2099-07-01T00:00:00Z",
  policyVersion: "v1"
};

describe("Charge proxy cancellation ownership", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AUTH_SESSION_SECRET", "test-cancellation-session-secret");
    resetChargeConfigurationForTests();
    resetChargeLifecycleForTests();
    expect(protectedForwardingPoolForTests.active).toBe(0);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetChargeConfigurationForTests();
    resetChargeLifecycleForTests();
  });

  it("cancels a pending request-body read and releases its permit", async () => {
    const browser = new AbortController();
    let bodyCancelled = false;
    let bodyStarted = false;
    const body = new ReadableStream<Uint8Array>({
      pull: () => {
        bodyStarted = true;
        return new Promise<void>(() => undefined);
      },
      cancel: () => { bodyCancelled = true; }
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://local/charge-agreements/api/agreements", {
      method: "POST",
      headers: mutationHeaders(),
      body,
      signal: browser.signal,
      duplex: "half"
    } as RequestInit & { duplex: "half" });

    const pending = proxyCharge(request, AGREEMENT_POLICIES.create);
    await vi.waitFor(() => expect(bodyStarted).toBe(true));
    browser.abort("browser disconnected");
    const response = await pending;

    expect(response.status).toBe(503);
    expect(bodyCancelled).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(protectedForwardingPoolForTests.active).toBe(0);
  });

  it("aborts stalled upstream work at the total policy deadline", async () => {
    let upstreamSignal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn((_url: string, init?: RequestInit) => {
      upstreamSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        upstreamSignal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")), { once: true });
      });
    }));
    const deadlinePolicy = Object.freeze({
      ...AGREEMENT_POLICIES.list,
      routeId: "agreements.list.deadline-test",
      timeoutMs: 5
    });

    const response = await proxyCharge(new Request(
      "http://local/charge-agreements/api/agreements",
      { headers: authenticatedHeaders() }
    ), deadlinePolicy);

    expect(response.status).toBe(503);
    expect(upstreamSignal?.aborted).toBe(true);
    expect(protectedForwardingPoolForTests.active).toBe(0);
  });

  it("propagates browser abort upstream and releases its permit", async () => {
    const browser = new AbortController();
    let upstreamSignal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn((_url: string, init?: RequestInit) => {
      upstreamSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        upstreamSignal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")), { once: true });
      });
    }));
    const request = new Request("http://local/charge-agreements/api/agreements", {
      headers: authenticatedHeaders(),
      signal: browser.signal
    });

    const pending = proxyCharge(request, AGREEMENT_POLICIES.list);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    browser.abort("browser disconnected");
    const response = await pending;

    expect(response.status).toBe(503);
    expect(upstreamSignal?.aborted).toBe(true);
    expect(protectedForwardingPoolForTests.active).toBe(0);
  });
});

function authenticatedHeaders(): Headers {
  return new Headers({
    cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(
      session, "test-cancellation-session-secret"
    )}`,
    "x-correlation-id": "corr-cancel"
  });
}

function mutationHeaders(): Headers {
  const headers = authenticatedHeaders();
  headers.set("origin", "http://127.0.0.1:18088");
  headers.set("content-type", "application/json");
  headers.set("x-linercore-client-request-id", "018f52c0-3c2e-7abc-8def-0123456789ab");
  return headers;
}
