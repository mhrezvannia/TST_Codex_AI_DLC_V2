import { normalizeChargeResponse } from "./response-normalizer";

describe("provider response normalization", () => {
  it("returns bounded JSON and replaces provider correlation", async () => {
    const response = await normalizeChargeResponse(
      Response.json({ id: "a1" }, { headers: { "x-correlation-id": "provider" } }),
      "browser-correlation", 1024
    );
    expect(response.headers.get("x-correlation-id")).toBe("browser-correlation");
    expect(await response.json()).toEqual({ id: "a1" });
  });

  it("accepts versioned application JSON media types", async () => {
    const response = await normalizeChargeResponse(new Response(JSON.stringify({ id: "agreement-1" }), {
      headers: { "content-type": "application/vnd.linercore.charge-agreement.v2+json; charset=utf-8" }
    }), "browser-correlation", 1024);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "agreement-1" });
  });

  it("preserves only allowlisted safe errors", async () => {
    const response = await normalizeChargeResponse(Response.json({
      code: "VERSION_CONFLICT", message: "Refresh", retryAfterSeconds: 2
    }, { status: 409 }), "corr-1", 1024);
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      code: "VERSION_CONFLICT", correlationId: "corr-1", retryAfterSeconds: 2
    });
  });

  it.each([
    new Response("<html>secret</html>", { status: 500 }),
    new Response(JSON.stringify({ token: "secret" }), {
      status: 500, headers: { "content-type": "application/json" }
    })
  ])("replaces malformed provider errors", async (provider) => {
    const response = await normalizeChargeResponse(provider, "corr-2", 1024);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});
