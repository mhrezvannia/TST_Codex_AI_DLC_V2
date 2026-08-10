import { actorSubjectFromSession, sessionFromRequest } from "@erp/auth";

export type BookingStatus =
  | "DRAFT"
  | "VALIDATION_BLOCKED"
  | "VALIDATED"
  | "PRICING_PENDING"
  | "PRICED"
  | "MANUAL_PRICING"
  | "CONFIRMED"
  | "AMENDED"
  | "RECONFIRMED"
  | "EXCEPTION";

export type RoutingLeg = {
  legSequence: number;
  loadUnLocode: string;
  dischargeUnLocode: string;
  voyageId: string;
};

export type EquipmentAssignment = {
  equipmentTypeCode: string;
  quantity: number;
  equipmentId: string;
};

export type BookingView = {
  id: string;
  bookingNumber: string;
  revision: number;
  status: BookingStatus;
  customerId: string;
  routing: RoutingLeg[];
  equipment: EquipmentAssignment[];
  currency: string;
  cargoMode: string;
  reefer: boolean;
  dangerousGoods: boolean;
  legacyIncomplete: boolean;
  referenceValidation: {
    bookingRevision: number;
    referenceFingerprint: string;
    outcome: "VALID" | "BLOCKED";
    fieldResults: Array<{
      fieldPath: string;
      referenceSet: string;
      requestedValue: string;
      outcome: "ACTIVE" | "INACTIVE" | "NOT_FOUND" | "MISMATCH";
      recordId: string | null;
      recordCode: string | null;
      recordVersion: number | null;
      reasonCode: string;
    }>;
    checkedAt: string;
    correlationId: string;
  } | null;
  pricingSnapshot: {
    pricingRequestId: string;
    pricingQuoteId: string;
    status: string;
    quotedAmounts: Record<string, string>;
    quotedAt: string;
    correlationId: string;
  } | null;
  lifecycleEvents: Array<{ eventType: string; occurredAt: string }>;
  movementStatuses: Array<{
    bookingRef: string;
    containerRef: string;
    movementId: string | null;
    moveCode: string;
    eventClassifierCode: string;
    occurredDateTime: string;
    receivedDateTime: string;
    derivedStatus: string;
    emptyIndicatorCode: string;
    transshipment: boolean;
    location: {
      unLocationCode: string | null;
      facilityCode: string | null;
      facilityTypeCode: string | null;
    } | null;
    eventId: string;
    source: string;
    eventTime: string;
    dataSchemaVersion: number;
    correlationId: string;
    projectedAt: string;
  }>;
  attributes: Record<string, string>;
};

export type BookingPage = {
  items: BookingView[];
  returned: number;
  page: number;
  size: number;
};

export type BookingLoad<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; message: string };

const backendUrl = () => process.env.BOOKING_SERVICE_URL ?? "http://booking-service:8085";
const MAX_COMMAND_BODY_BYTES = 32 * 1024;

export async function loadBookings(query: URLSearchParams, actorSubjectId?: string | null): Promise<BookingLoad<BookingPage>> {
  return loadJson<BookingPage>(`/api/bookings?${query.toString()}`, actorSubjectId);
}

export async function loadBooking(id: string, actorSubjectId?: string | null): Promise<BookingLoad<BookingView>> {
  return loadJson<BookingView>(`/api/bookings/${encodeURIComponent(id)}`, actorSubjectId);
}

export function bookingReturnTo(params: { search?: string; status?: string; page?: string }) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page && params.page !== "0") query.set("page", params.page);
  const suffix = query.toString();
  return suffix ? `/bookings?${suffix}` : "/bookings";
}

export function safeBookingReturnTo(value?: string) {
  return value === "/bookings" || value?.startsWith("/bookings?") ? value : "/bookings";
}

export async function proxyBooking(request: Request, path: string, method: "GET" | "POST") {
  const correlationId = crypto.randomUUID();
  const session = sessionFromRequest(request);
  const actorSubjectId = actorSubjectFromSession(session);
  if (!session) {
    return safeError(401, "AUTH_REQUIRED", "Authentication is required for Booking", correlationId);
  }
  if (!actorSubjectId) {
    return safeError(403, "BOOKING_ACTOR_REQUIRED", "A signed-in Booking actor is required", correlationId);
  }
  const headers = serviceHeaders(correlationId, actorSubjectId, request.headers.get("idempotency-key"));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    let body: string | undefined;
    if (method === "POST") {
      const rejection = validateCommandRequest(request);
      if (rejection) return rejection;
      body = await request.text();
      if (new TextEncoder().encode(body).byteLength > MAX_COMMAND_BODY_BYTES) {
        return safeError(413, "BODY_TOO_LARGE", "Booking command body exceeds 32768 bytes", correlationId);
      }
      if (/\/(validate|price|confirm|amend|reconfirm)$/.test(path)) {
        try {
          body = JSON.stringify({ ...JSON.parse(body || "{}"), actorSubjectId, correlationId });
        } catch {
          return safeError(400, "JSON_INVALID", "Booking command body must be valid JSON", correlationId);
        }
      }
    }
    const response = await fetch(`${backendUrl()}${path}`, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const responseCorrelationId = typeof payload?.correlationId === "string" && payload.correlationId !== "local-correlation"
        ? payload.correlationId
        : correlationId;
      return Response.json({
        code: typeof payload?.code === "string" ? payload.code : "BOOKING_REQUEST_FAILED",
        message: typeof payload?.message === "string" ? payload.message : "Booking request failed",
        fields: Array.isArray(payload?.fields) ? payload.fields : [],
        correlationId: responseCorrelationId
      }, { status: response.status });
    }
    return Response.json(payload, { status: response.status });
  } catch {
    return safeError(503, "BOOKING_UNAVAILABLE", "Booking service is unavailable", correlationId);
  } finally {
    clearTimeout(timeout);
  }
}

export function serviceHeaders(correlationId: string, actorSubjectId?: string | null, idempotencyKey?: string | null) {
  const serviceToken = process.env.BOOKING_SERVICE_TOKEN;
  if (!serviceToken) throw new Error("BOOKING_SERVICE_TOKEN is required");
  const actor = actorSubjectId?.trim();
  if (!actor) throw new Error("Booking actor subject is required");
  const headers = new Headers({
    "content-type": "application/json",
    "x-correlation-id": correlationId,
    "x-linercore-actor-id": actor,
    "x-linercore-service-id": "booking-bff",
    "x-linercore-service-token": serviceToken
  });
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
  return headers;
}

export function validateCommandRequest(request: Request): Response | null {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim()
    ?? request.headers.get("host")
    ?? requestUrl.host;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim()
    ?? requestUrl.protocol.replace(":", "");
  let sameOrigin = false;
  try {
    const originUrl = new URL(origin ?? "invalid:");
    sameOrigin = originUrl.host === host && originUrl.protocol === `${protocol}:`;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return safeError(403, "ORIGIN_DENIED", "Cross-origin booking commands are denied", crypto.randomUUID());
  }
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return safeError(415, "JSON_REQUIRED", "Content-Type application/json is required", crypto.randomUUID());
  }
  const idempotencyKey = request.headers.get("idempotency-key") ?? "";
  if (!/^[!-~]{1,128}$/.test(idempotencyKey)) {
    return safeError(400, "IDEMPOTENCY_KEY_REQUIRED", "A valid Idempotency-Key is required", crypto.randomUUID());
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_COMMAND_BODY_BYTES) {
    return safeError(413, "BODY_TOO_LARGE", "Booking command body exceeds 32768 bytes", crypto.randomUUID());
  }
  return null;
}

function safeError(status: number, code: string, message: string, correlationId: string) {
  return Response.json({ code, message, correlationId }, { status });
}

async function loadJson<T>(path: string, actorSubjectId?: string | null): Promise<BookingLoad<T>> {
  const correlationId = crypto.randomUUID();
  if (!actorSubjectId?.trim()) {
    return { ok: false, status: 401, message: "A signed-in Booking actor is required" };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${backendUrl()}${path}`, {
      headers: serviceHeaders(correlationId, actorSubjectId),
      cache: "no-store",
      signal: controller.signal
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return { ok: false, status: response.status, message: payload?.message ?? "Booking request failed" };
    }
    return { ok: true, value: payload as T };
  } catch {
    return { ok: false, status: 503, message: "Booking service is unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
