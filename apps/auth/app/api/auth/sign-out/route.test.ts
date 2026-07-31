import { describe, expect, test } from "vitest";
import { SESSION_COOKIE_NAME } from "@erp/auth";
import { POST } from "./route";

describe("Auth sign-out", () => {
  test("clears the application session and returns to the canonical Auth boundary", () => {
    const response = POST(
      new Request("http://apps-auth:3000/api/auth/sign-out", {
        headers: {
          "x-forwarded-host": "127.0.0.1:8088",
          "x-forwarded-proto": "http"
        },
        method: "POST"
      })
    );

    const location = new URL(response.headers.get("Location") as string);
    expect(response.status).toBe(303);
    expect(location.searchParams.get("client_id")).toBe("linercore-auth");
    expect(location.searchParams.get("post_logout_redirect_uri")).toBe(
      "http://127.0.0.1:8088/auth/signed-out"
    );
    expect(response.headers.get("Set-Cookie")).toContain(`${SESSION_COOKIE_NAME}=`);
  });
});
