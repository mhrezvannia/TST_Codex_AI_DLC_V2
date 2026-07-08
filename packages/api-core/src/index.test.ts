import { createErrorEnvelope, jsonHealth } from "./index";

test("creates health response", () => {
  expect(jsonHealth("test-service").status).toBe("UP");
});

test("creates standard error envelope", () => {
  const envelope = createErrorEnvelope({
    code: "TEST",
    message: "Test error",
    correlationId: "corr-1"
  });
  expect(envelope).toMatchObject({ code: "TEST", correlationId: "corr-1" });
});
