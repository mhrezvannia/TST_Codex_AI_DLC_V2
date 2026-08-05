import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("shell sign-out adapter", () => {
  it("delegates browser POSTs to the existing auth-owned sign-out route", () => {
    const response = POST();

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("/auth/api/auth/sign-out");
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });
});
