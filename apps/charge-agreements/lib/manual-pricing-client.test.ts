import { getManualCase, listManualCases, ManualPricingClientError } from "./manual-pricing-client";

describe("manual pricing client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("canonicalizes list paging and accepts only the safe list model", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [safeCase("case-1")],
      total: 1,
      page: 2,
      size: 25
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const page = await listManualCases(new URLSearchParams(
      "page=3&reasonCode=NO_RATE&unknown=drop&size=100"
    ));

    expect(page.items[0]?.caseId).toBe("case-1");
    expect(String(fetchMock.mock.calls[0]?.[0]))
      .toContain("status=OPEN&reasonCode=NO_RATE&page=2&size=25");
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("unknown");
  });

  it("encodes detail identifiers and rejects disclosed money or workflow fields", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(safeCase("case / 1")), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...safeCase("case-unsafe"), total: 0, assignment: "analyst-1"
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await getManualCase("case / 1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("case%20%2F%201");
    await expect(getManualCase("case-unsafe")).rejects.toThrow();
  });

  it("normalizes list and detail failures without exposing provider payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: "MANUAL_CASE_FORBIDDEN",
      message: "Manual pricing case access denied",
      requestHash: "secret-hash",
      amount: 125
    }), { status: 403 })));

    const failure = await getManualCase("case-1").catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ManualPricingClientError);
    expect(failure).toMatchObject({ status: 403, message: "Manual pricing case access denied" });
    expect(JSON.stringify(failure)).not.toContain("secret-hash");
    expect(JSON.stringify(failure)).not.toContain("125");
  });
});

function safeCase(caseId: string) {
  return {
    caseId,
    pricingRequestId: "BK-1:0",
    reasonCode: "NO_RATE",
    status: "OPEN",
    bookingRef: "BK-1",
    amendmentSeq: 0,
    requestHash: "a".repeat(64),
    correlationId: "corr-1",
    openedAt: "2026-07-28T10:00:00Z",
    requestContext: null,
    legacyEvidence: false
  };
}
