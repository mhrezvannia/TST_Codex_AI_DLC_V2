import { encodeSessionCookie, SESSION_COOKIE_NAME, type AuthSession } from "@erp/auth";
import { GET as agreementDetail } from "./agreements/[agreementId]/route";
import { POST as agreementApprove } from "./agreements/[agreementId]/versions/[versionId]/approve/route";
import { GET as manualCaseDetail } from "./manual-cases/[caseId]/route";
import { resetChargeConfigurationForTests } from "../../lib/bff/config";

const session: AuthSession = {
  sessionId: "route-session",
  subjectId: "charge-user",
  subjectType: "user",
  displayName: "Charge User",
  roles: [],
  permissions: [
    "charge-agreements:read",
    "charge-agreements:approve",
    "charge-manual-cases:read"
  ],
  issuedAt: "2026-07-01T00:00:00Z",
  expiresAt: "2099-07-01T00:00:00Z",
  policyVersion: "v1"
};

describe("dynamic Charge route identifier boundary", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AUTH_SESSION_SECRET", "test-route-session-secret");
    resetChargeConfigurationForTests();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetChargeConfigurationForTests();
  });

  it.each([
    ["agreement detail", agreementDetail, "agreementId"],
    ["agreement action", agreementApprove, "agreementId"],
    ["manual case detail", manualCaseDetail, "caseId"]
  ])("returns a bounded typed 400 for malformed %s IDs", async (_name, handler, key) => {
    const response = await handler(request(), {
      params: Promise.resolve({ [key]: "%2Fprotected", versionId: "version-1" })
    } as never);

    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(await response.json()).toEqual({
      code: "IDENTIFIER_INVALID",
      message: "The route identifier is invalid",
      fields: [],
      correlationId: "corr-route"
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});

function request(): Request {
  return new Request("http://local/charge-agreements/api/route", {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(
        session, "test-route-session-secret"
      )}`,
      "x-correlation-id": "corr-route"
    }
  });
}
