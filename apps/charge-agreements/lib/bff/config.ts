import {
  CHARGE_BASE_PATH,
  type ChargeBffConfig,
  type ChargeConfigurationReadiness
} from "./types";

const LOCAL_PROFILES = new Set(["local", "development", "dev", "test"]);
const INTEGER = /^\d+$/;
const KID = /^[A-Za-z0-9_-]{1,32}$/;
let cached: ChargeConfigurationReadiness | undefined;

export function chargeConfigurationReadiness(
  env: Readonly<Record<string, string | undefined>> = process.env
): ChargeConfigurationReadiness {
  if (env === process.env && cached) return cached;
  const result = loadChargeBffConfig(env);
  if (env === process.env) cached = result;
  return result;
}

export function resetChargeConfigurationForTests(): void {
  cached = undefined;
}

export function loadChargeBffConfig(
  env: Readonly<Record<string, string | undefined>>
): ChargeConfigurationReadiness {
  try {
    const profile = (env.AUTH_RUNTIME_PROFILE ?? env.APP_ENV ?? env.NODE_ENV ?? "development")
      .trim().toLowerCase();
    const local = LOCAL_PROFILES.has(profile);
    rejectBypass(env);
    const sessionSecret = requiredSecret(env.AUTH_SESSION_SECRET, local
      ? "linercore-local-session-secret" : undefined);
    const assertionSecret = requiredSecret(env.CHARGE_BFF_ASSERTION_SECRET, local
      ? "linercore-local-assertion-secret-change-me" : undefined);
    if (sessionSecret === assertionSecret) throw new Error("session/assertion secrets must differ");

    const config: ChargeBffConfig = Object.freeze({
      basePath: exactBasePath(env.CHARGE_BASE_PATH),
      chargeOrigin: fixedServiceOrigin(
        env.CHARGE_AGREEMENT_SERVICE_URL ?? (local ? "http://charge-agreement-service:8084" : undefined),
        "CHARGE_AGREEMENT_SERVICE_URL"
      ),
      referenceOrigin: fixedServiceOrigin(
        env.REFERENCE_DATA_SERVICE_URL ?? (local ? "http://reference-data-service:8083" : undefined),
        "REFERENCE_DATA_SERVICE_URL"
      ),
      publicOrigins: Object.freeze(new Set(parsePublicOrigins(
        env.CHARGE_PUBLIC_ORIGINS ?? (local ? "http://127.0.0.1:18088" : undefined)
      ))),
      chargeServiceToken: requiredSecret(env.CHARGE_SERVICE_TOKEN, local
        ? "charge_bff_local_token" : undefined),
      referenceServiceToken: requiredSecret(
        env.REFERENCE_DATA_BFF_TOKEN ?? env.REFERENCE_DATA_CHARGE_TOKEN,
        local ? "reference_data_charge_local_token" : undefined
      ),
      referenceServiceId: boundedText(
        env.REFERENCE_DATA_BFF_SERVICE_ID ?? "charge-agreements-bff",
        1,
        64
      ),
      assertionSecret,
      assertionKid: parseKid(env.CHARGE_BFF_ASSERTION_KID ?? (local ? "w2-03-local-v1" : undefined)),
      protectedPermits: exactInteger(env.CHARGE_BFF_PROTECTED_PERMITS, 20, 20),
      referencePermits: exactInteger(env.CHARGE_BFF_REFERENCE_PERMITS, 10, 10),
      permitWaitMs: exactInteger(env.CHARGE_BFF_PERMIT_WAIT_MS, 100, 100),
      chargeDeadlineMs: exactInteger(env.CHARGE_BFF_DEADLINE_MS, 2500, 2500),
      referenceDeadlineMs: exactInteger(env.CHARGE_REFERENCE_DEADLINE_MS, 2000, 2000),
      egressDeadlineMs: exactInteger(env.CHARGE_BFF_EGRESS_DEADLINE_MS, 5000, 5000),
      requestBodyBytes: exactInteger(env.CHARGE_BFF_REQUEST_BODY_BYTES, 32 * 1024, 32 * 1024),
      chargeResponseBytes: exactInteger(env.CHARGE_BFF_RESPONSE_BYTES, 512 * 1024, 512 * 1024),
      referenceResponseBytes: exactInteger(env.CHARGE_REFERENCE_RESPONSE_BYTES, 128 * 1024, 128 * 1024)
    });
    return Object.freeze({ ready: true, config });
  } catch {
    return Object.freeze({ ready: false, code: "CHARGE_CONFIGURATION_INVALID" });
  }
}

function exactBasePath(value: string | undefined): typeof CHARGE_BASE_PATH {
  if (value !== undefined && value !== CHARGE_BASE_PATH) throw new Error("invalid base path");
  return CHARGE_BASE_PATH;
}

function fixedServiceOrigin(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is required`);
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)
    || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${name} must be a fixed origin`);
  }
  return url.origin;
}

function parsePublicOrigins(value: string | undefined): string[] {
  if (!value) throw new Error("CHARGE_PUBLIC_ORIGINS is required");
  const origins = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (origins.length === 0 || origins.length > 8) throw new Error("invalid public origin count");
  return origins.map((candidate) => {
    const url = new URL(candidate);
    const localHttp = url.protocol === "http:"
      && ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
    if (!(url.protocol === "https:" || localHttp)
      || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      throw new Error("invalid public origin");
    }
    return url.origin;
  });
}

function requiredSecret(value: string | undefined, fallback?: string): string {
  const selected = value?.trim() || fallback;
  if (!selected || selected.length < 16 || selected.length > 512) throw new Error("invalid secret");
  return selected;
}

function parseKid(value: string | undefined): string {
  if (!value || !KID.test(value)) throw new Error("invalid assertion kid");
  return value;
}

function exactInteger(value: string | undefined, fallback: number, expected: number): number {
  const selected = value ?? String(fallback);
  if (!INTEGER.test(selected) || Number(selected) !== expected) throw new Error("invalid bounded setting");
  return expected;
}

function boundedText(value: string, minimum: number, maximum: number): string {
  const selected = value.trim();
  if (selected.length < minimum || selected.length > maximum) throw new Error("invalid text");
  return selected;
}

function rejectBypass(env: Readonly<Record<string, string | undefined>>): void {
  for (const [key, value] of Object.entries(env)) {
    if (/(BYPASS|DISABLE_AUTH|ALLOW_INSECURE)/i.test(key) && /^(1|true|yes)$/i.test(value ?? "")) {
      throw new Error("forbidden bypass");
    }
  }
}
