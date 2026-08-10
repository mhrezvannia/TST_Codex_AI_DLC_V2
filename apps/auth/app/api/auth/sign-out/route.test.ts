import { describe, expect, test } from "vitest";
import { SESSION_COOKIE_NAME } from "@erp/auth";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

  test.each(["127.0.0.1:8088", "127.0.0.1:18088"])(
    "uses a post-logout redirect registered for the %s gateway",
    (forwardedHost) => {
      const response = POST(
        new Request("http://apps-auth:3000/api/auth/sign-out", {
          headers: {
            "x-forwarded-host": forwardedHost,
            "x-forwarded-proto": "http"
          },
          method: "POST"
        })
      );
      const logoutLocation = new URL(response.headers.get("Location") as string);
      const postLogoutRedirect = logoutLocation.searchParams.get("post_logout_redirect_uri");
      const repositoryRoot = process.cwd().replace(/[\\/]apps[\\/]auth$/, "");
      const realm = JSON.parse(
        readFileSync(resolve(repositoryRoot, "infrastructure/keycloak/linercore-local-realm.json"), "utf8")
      ) as {
        clients: Array<{
          clientId: string;
          attributes?: { "post.logout.redirect.uris"?: string };
        }>;
      };
      const authClient = realm.clients.find((client) => client.clientId === "linercore-auth");
      const registeredRedirects = authClient?.attributes?.["post.logout.redirect.uris"]?.split("##") ?? [];

      expect(postLogoutRedirect).toBe(`http://${forwardedHost}/auth/signed-out`);
      expect(registeredRedirects).toContain(postLogoutRedirect);
    }
  );
});
