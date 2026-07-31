import { loadChargeBffConfig } from "./config";
import { AGREEMENT_POLICIES } from "./policies";
import {
  canonicalQuery,
  RequestValidationError,
  safeIdentifier,
  validateBrowserRequest
} from "./request-validation";

const readiness = loadChargeBffConfig({});
if (!readiness.ready) throw new Error("local test configuration unavailable");
const config = readiness.config;

describe("browser request validation", () => {
  it("canonicalizes allowed single-value query fields", () => {
    expect(canonicalQuery(new URLSearchParams("q=%20abc%20&page=2"), ["q", "page"]).toString())
      .toBe("page=2&q=abc");
  });

  it.each(["q=a&q=b", "actor=evil", "q=%0A"])("rejects invalid query %s", (query) => {
    expect(() => canonicalQuery(new URLSearchParams(query), ["q"]))
      .toThrow(RequestValidationError);
  });

  it.each(["../secret", "%2Froot", "bad value", ""])("rejects unsafe identifier %s", (value) => {
    expect(() => safeIdentifier(value)).toThrowError("IDENTIFIER_INVALID");
  });

  it("rejects spoofed authority before reading a command", async () => {
    const request = new Request("http://local/charge-agreements/api/agreements", {
      method: "POST",
      headers: {
        origin: "http://127.0.0.1:18088",
        "content-type": "application/json",
        "x-linercore-subject": "attacker"
      },
      body: "{}"
    });
    await expect(validateBrowserRequest(request, AGREEMENT_POLICIES.create, config))
      .rejects.toMatchObject({ code: "AUTHORITY_HEADER_REJECTED" });
  });

  it("requires exact origin, media, UUID and closed body fields", async () => {
    const request = new Request("http://local/charge-agreements/api/agreements", {
      method: "POST",
      headers: {
        origin: "http://127.0.0.1:18088",
        "content-type": "application/json",
        "x-linercore-client-request-id": "018f52c0-3c2e-7abc-8def-0123456789ab"
      },
      body: JSON.stringify({ agreementNumber: "A-1", actor: "attacker" })
    });
    await expect(validateBrowserRequest(request, AGREEMENT_POLICIES.create, config))
      .rejects.toMatchObject({ code: "AUTHORITY_FIELD_REJECTED" });
  });
});
