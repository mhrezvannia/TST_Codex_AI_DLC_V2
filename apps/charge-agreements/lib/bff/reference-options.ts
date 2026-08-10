import { readBoundedJson } from "./bounded-stream";
import { chargeConfigurationReadiness } from "./config";
import { resolveCorrelationId } from "./correlation";
import { chargeErrorResponse } from "./errors";
import { FairSemaphore, FairSemaphoreCapacityError, type PermitLease } from "./fair-semaphore";
import { linkAbortSignal } from "./lifecycle";
import { authenticatedSubjectFromRequest, hasCapability } from "./session";

const referencePool = new FairSemaphore(10);
const SETS = Object.freeze({
  "charge-code": "charge-code",
  currency: "currency",
  customer: "party-customer",
  "trade-lane": "trade-lane",
  location: "location",
  equipment: "equipment-type"
} as const);

export async function proxyReferenceOptions(request: Request): Promise<Response> {
  const correlationId = resolveCorrelationId(request.headers.get("x-correlation-id"));
  const readiness = chargeConfigurationReadiness();
  if (!readiness.ready) {
    return chargeErrorResponse(503, "CHARGE_CONFIGURATION_INVALID",
      "Reference selectors are not ready", correlationId);
  }
  const subject = authenticatedSubjectFromRequest(request);
  if (!subject) {
    return chargeErrorResponse(401, "CHARGE_AUTH_REQUIRED", "Authentication is required", correlationId);
  }
  const url = new URL(request.url);
  const allowed = new Set(["kind", "q", "domain"]);
  for (const key of new Set(url.searchParams.keys())) {
    if (!allowed.has(key) || url.searchParams.getAll(key).length !== 1) {
      return chargeErrorResponse(400, "REFERENCE_QUERY_INVALID",
        "Reference selector query is invalid", correlationId);
    }
  }
  const domain = url.searchParams.get("domain");
  const resource = domain === "rates" ? "charge-rates"
    : domain === "agreements" ? "charge-agreements" : null;
  if (!resource || !hasCapability(subject, { resource, action: "read" })) {
    return chargeErrorResponse(403, "CHARGE_ACCESS_DENIED",
      "Reference options are not permitted", correlationId);
  }
  const kind = url.searchParams.get("kind");
  if (!kind || !(kind in SETS)) {
    return chargeErrorResponse(400, "REFERENCE_KIND_INVALID",
      "Reference selector kind is invalid", correlationId);
  }
  const search = (url.searchParams.get("q") ?? "").trim();
  if (search.length > 128 || /[\u0000-\u001f\u007f]/.test(search)) {
    return chargeErrorResponse(400, "REFERENCE_QUERY_INVALID",
      "Reference selector query is invalid", correlationId);
  }
  const controller = new AbortController();
  const unlinkRequest = linkAbortSignal(request.signal, controller);
  const timeout = setTimeout(() => controller.abort(), readiness.config.referenceDeadlineMs);
  let lease: PermitLease | null;
  try {
    lease = await referencePool.acquire(readiness.config.permitWaitMs, controller.signal);
  } catch (error) {
    unlinkRequest();
    clearTimeout(timeout);
    if (error instanceof FairSemaphoreCapacityError) {
      return chargeErrorResponse(503, "REFERENCE_CAPACITY_EXHAUSTED",
        "Reference selector capacity is busy", correlationId);
    }
    throw error;
  }
  if (!lease) {
    unlinkRequest();
    clearTimeout(timeout);
    return chargeErrorResponse(503, "REFERENCE_CAPACITY_EXHAUSTED",
      "Reference selector capacity is busy", correlationId);
  }
  try {
    const set = SETS[kind as keyof typeof SETS];
    const response = await fetch(
      `${readiness.config.referenceOrigin}/reference-sets/${set}/records?includeInactive=false&page=0&size=50`,
      {
        headers: {
          accept: "application/json",
          "x-correlation-id": correlationId,
          "x-linercore-service-id": readiness.config.referenceServiceId,
          "x-linercore-service-token": readiness.config.referenceServiceToken
        },
        cache: "no-store",
        redirect: "manual",
        signal: controller.signal
      }
    );
    if (!response.ok || response.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
      return chargeErrorResponse(503, "REFERENCE_SERVICE_UNAVAILABLE",
        "Reference options are unavailable", correlationId);
    }
    const payload = await readBoundedJson(
      response.body,
      readiness.config.referenceResponseBytes,
      response.headers.get("content-length"),
      controller.signal
    );
    const records = payload && typeof payload === "object" && Array.isArray(
      (payload as Record<string, unknown>).records
    ) ? (payload as { records: unknown[] }).records : null;
    if (!records) {
      return chargeErrorResponse(503, "REFERENCE_RESPONSE_INVALID",
        "Reference options are unavailable", correlationId);
    }
    const needle = search.toLocaleLowerCase();
    const options = records.flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const record = item as Record<string, unknown>;
      const id = scalar(record.id);
      const label = typeof record.displayName === "string" ? record.displayName.trim() : "";
      const code = scalar(record.code);
      const status = typeof record.status === "string" ? record.status : "ACTIVE";
      if (!id || !label || label.length > 256 || status !== "ACTIVE"
        || (needle && !`${code} ${label}`.toLocaleLowerCase().includes(needle))) return [];
      return [{ id, label: code ? `${code} — ${label}` : label }];
    }).slice(0, 50);
    return Response.json({ options }, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-correlation-id": correlationId
      }
    });
  } catch {
    return chargeErrorResponse(503, "REFERENCE_SERVICE_UNAVAILABLE",
      "Reference options are unavailable", correlationId);
  } finally {
    unlinkRequest();
    clearTimeout(timeout);
    controller.abort();
    lease.release();
  }
}

function scalar(value: unknown): string {
  if (typeof value === "string") return value.trim().slice(0, 128);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const candidate = (value as Record<string, unknown>).value;
    return typeof candidate === "string" ? candidate.trim().slice(0, 128) : "";
  }
  return "";
}

export const referenceSelectorPoolForTests = referencePool;
