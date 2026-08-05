import { describe, expect, test } from "bun:test";
import { buildLocalBookingStorageState } from "./w2-02-storage-state.ts";

describe("W2-02 local booking storage state", () => {
  test("creates one short-lived local booking session for the isolated Wave A edge", () => {
    const state = buildLocalBookingStorageState({ RUNTIME_PROFILE: "local", W2_02_BASE_URL: "http://127.0.0.1:18088" });
    expect(state.cookies).toHaveLength(1);
    expect(state.cookies[0]).toMatchObject({ name: "lc_session", domain: "127.0.0.1", httpOnly: true, secure: false });
    expect(state.cookies[0].value).not.toContain("local.booking.user");
  });

  test("rejects non-local profiles and protected or mismatched targets", () => {
    expect(() => buildLocalBookingStorageState({ RUNTIME_PROFILE: "production", W2_02_BASE_URL: "http://127.0.0.1:18088" })).toThrow(/local\/test/);
    expect(() => buildLocalBookingStorageState({ RUNTIME_PROFILE: "local", W2_02_BASE_URL: "http://127.0.0.1:8088" })).toThrow(/18088/);
  });
});
