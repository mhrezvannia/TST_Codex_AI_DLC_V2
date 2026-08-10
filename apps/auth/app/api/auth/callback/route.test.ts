import { describe, expect, test } from "vitest";
import { OIDC_TRANSACTION_COOKIE_NAME } from "@erp/auth";
import { GET } from "./route";

describe("OIDC callback recovery", () => {
  test("routes a missing or expired transaction back to the sign-in handoff", async () => {
    const response = await GET(new Request("http://127.0.0.1:8088/auth/api/auth/callback"));

    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toBe(
      "http://127.0.0.1:8088/auth/sign-in?status=expired"
    );
    expect(response.headers.get("Set-Cookie")).toContain(`${OIDC_TRANSACTION_COOKIE_NAME}=`);
  });

  test("maps identity-provider cancellation to a recoverable business state", async () => {
    const response = await GET(
      new Request("http://127.0.0.1:8088/auth/api/auth/callback?error=access_denied")
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toBe(
      "http://127.0.0.1:8088/auth/sign-in?status=cancelled"
    );
  });

  test("maps an identity-provider outage to the unavailable state", async () => {
    const response = await GET(
      new Request(
        "http://127.0.0.1:8088/auth/api/auth/callback?error=temporarily_unavailable"
      )
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toBe(
      "http://127.0.0.1:8088/auth/sign-in?status=unavailable"
    );
  });
});
