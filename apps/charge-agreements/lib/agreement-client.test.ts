import { AgreementClientError, listAgreements } from "./agreement-client";

describe("Agreement client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("validates successful pages strictly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [], page: 0, size: 25, total: 0, hasMore: false, canCreate: true
    }), { status: 200, headers: { "content-type": "application/json" } })));
    await expect(listAgreements(new URLSearchParams("page=0&size=25"))).resolves.toMatchObject({ canCreate: true });
  });

  it("maps typed field errors without losing status or code", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: "AGREEMENT_REFERENCE_INVALID", message: "Invalid reference",
      fields: [{ field: "customerId", reason: "inactive" }], correlationId: "corr-1"
    }), { status: 422 })));
    const failure = await listAgreements(new URLSearchParams()).catch((reason) => reason);
    expect(failure).toBeInstanceOf(AgreementClientError);
    expect(failure).toMatchObject({ status: 422, code: "AGREEMENT_REFERENCE_INVALID", fields: { customerId: "inactive" } });
  });

  it("maps the canonical BFF path/code/message field shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: "AGREEMENT_REFERENCE_INVALID", message: "Invalid reference",
      fields: [{ path: "customerId", code: "REFERENCE_INACTIVE", message: "Select an active customer" }],
      correlationId: "corr-2"
    }), { status: 422 })));
    const failure = await listAgreements(new URLSearchParams()).catch((reason) => reason);
    expect(failure).toBeInstanceOf(AgreementClientError);
    expect(failure).toMatchObject({
      status: 422,
      code: "AGREEMENT_REFERENCE_INVALID",
      fields: { customerId: "Select an active customer" }
    });
  });

  it("rejects malformed successful payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await expect(listAgreements(new URLSearchParams())).rejects.toThrow();
  });
});
