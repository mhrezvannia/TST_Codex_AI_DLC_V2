import { afterEach, describe, expect, test, vi } from "vitest";
import {
  isLocalAuthBypassEnabled,
  mutationCommand,
  normalizeReferenceRecord,
  resolveReferenceDataPermissions
} from "./service-clients";

describe("service clients", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.AUTH_BYPASS;
    delete process.env.APP_ENV;
    delete process.env.REFERENCE_DATA_AUTH_BYPASS;
  });

  test("enables auth bypass only for non-production local development", () => {
    process.env.AUTH_BYPASS = "true";
    process.env.APP_ENV = "local";
    expect(isLocalAuthBypassEnabled()).toBe(true);
  });

  test("returns write permissions when local auth bypass is enabled", async () => {
    process.env.REFERENCE_DATA_AUTH_BYPASS = "true";
    process.env.APP_ENV = "local";
    const result = await resolveReferenceDataPermissions(new Request("http://localhost/api"), "corr-test", "create");
    expect(result).toMatchObject({ ok: true, data: { canRead: true, canWrite: true, correlationId: "corr-test" } });
  });

  test("does not enable reference-data bypass in non-local runtime profiles", () => {
    process.env.REFERENCE_DATA_AUTH_BYPASS = "true";
    process.env.APP_ENV = "staging";
    expect(isLocalAuthBypassEnabled()).toBe(false);
  });

  test("normalizes backend value objects for BFF consumers", () => {
    expect(normalizeReferenceRecord({
      id: { value: "currency-usd" },
      set: "CURRENCY",
      code: { value: "USD" },
      displayName: "US Dollar",
      updatedBy: { displayName: "Reference Admin" },
      attributes: { relationship: "Minor unit: 2" }
    }, "CURRENCY", "corr-test")).toMatchObject({
      id: "currency-usd",
      code: "USD",
      classification: "Internal",
      relationship: "Minor unit: 2",
      correlationId: "corr-test"
    });
  });

  test("builds backend mutation command with actor and correlation metadata", () => {
    expect(mutationCommand({
      set: "CURRENCY",
      code: "EUR",
      displayName: "Euro",
      correlationId: "corr-test",
      operation: "create"
    })).toMatchObject({
      set: "CURRENCY",
      code: "EUR",
      displayName: "Euro",
      actorSubjectId: "local.reference.admin",
      operation: "create",
      correlationId: "corr-test"
    });
  });
});
