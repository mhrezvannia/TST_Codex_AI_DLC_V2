import { loadChargeBffConfig } from "./config";

const valid = {
  NODE_ENV: "production",
  AUTH_SESSION_SECRET: "session-secret-production-value",
  CHARGE_BFF_ASSERTION_SECRET: "assertion-secret-production-value",
  CHARGE_BFF_ASSERTION_KID: "prod-v1",
  CHARGE_AGREEMENT_SERVICE_URL: "https://charge.internal",
  REFERENCE_DATA_SERVICE_URL: "https://reference.internal",
  CHARGE_PUBLIC_ORIGINS: "https://console.example",
  CHARGE_SERVICE_TOKEN: "charge-service-token-value",
  REFERENCE_DATA_BFF_TOKEN: "reference-service-token-value"
};

describe("Charge BFF configuration", () => {
  it("loads the exact production bounds", () => {
    const result = loadChargeBffConfig(valid);
    expect(result.ready).toBe(true);
    if (result.ready) expect(result.config).toMatchObject({
      protectedPermits: 20, referencePermits: 10, requestBodyBytes: 32768
    });
  });

  it.each([
    ["missing secrets", { ...valid, AUTH_SESSION_SECRET: "" }],
    ["equal secrets", { ...valid, AUTH_SESSION_SECRET: valid.CHARGE_BFF_ASSERTION_SECRET }],
    ["path-bearing origin", { ...valid, CHARGE_AGREEMENT_SERVICE_URL: "https://charge.internal/api" }],
    ["wildcard public origin", { ...valid, CHARGE_PUBLIC_ORIGINS: "*" }],
    ["changed permit bound", { ...valid, CHARGE_BFF_PROTECTED_PERMITS: "21" }],
    ["enabled bypass", { ...valid, AUTH_BYPASS: "true" }]
  ])("fails closed for %s", (_name, env) => {
    expect(loadChargeBffConfig(env)).toEqual({
      ready: false, code: "CHARGE_CONFIGURATION_INVALID"
    });
  });
});
