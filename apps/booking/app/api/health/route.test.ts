import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("Booking health route", () => {
  it("returns a local success response without entering canonical UI redirects", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
