import { ensureCorrelationId, isSafeCorrelationId, maskSensitiveFields, structuredLog } from "./index";

test("uses an existing correlation id", () => {
  expect(ensureCorrelationId("corr-12345678")).toBe("corr-12345678");
});

test("generates a correlation id when absent", () => {
  expect(ensureCorrelationId(undefined)).toHaveLength(36);
});

test("rejects malformed correlation ids", () => {
  expect(isSafeCorrelationId("bad id with spaces")).toBe(false);
  expect(isSafeCorrelationId("corr-12345678")).toBe(true);
});

test("masks sensitive structured log fields", () => {
  expect(maskSensitiveFields({ token: "abc", customerId: "cust-1", passwordValue: "pw" })).toEqual({
    token: "[redacted]",
    customerId: "cust-1",
    passwordValue: "[redacted]"
  });
});

test("creates structured log records", () => {
  const log = structuredLog({
    level: "info",
    service: "apps-reference-data",
    environment: "local",
    operation: "list-reference-records",
    correlationId: "corr-12345678",
    message: "listed records",
    result: "success",
    fields: { authorization: "Bearer secret", recordId: "currency-usd" }
  });

  expect(log).toMatchObject({
    level: "info",
    service: "apps-reference-data",
    correlationId: "corr-12345678",
    result: "success",
    fields: { authorization: "[redacted]", recordId: "currency-usd" }
  });
});
