import { actorSubjectFromSession, sessionFromRequest } from "@erp/auth";
import { z } from "zod";

export const pricingOutcomeSchema = z.enum([
  "PRICED",
  "LEGACY_PRICED",
  "MANUAL_PRICING_REQUIRED",
  "DENIED",
  "MALFORMED",
  "VALIDATION_FAILED",
  "CONFLICT",
  "IN_PROGRESS",
  "TIMEOUT",
  "UNAVAILABLE",
  "CIRCUIT_OPEN",
  "BOOKING_CHANGED"
]);

const priceBrowserCommandSchema = z.object({}).strict();
const isoInstantSchema = z.string().datetime({ offset: true });
const moneySchema = z.number().nonnegative().finite();
const pricingLineSnapshotSchema = z.object({
  chargeCode: z.string().min(1),
  category: z.enum(["FREIGHT", "SURCHARGE", "LOCAL"]),
  rateCategory: z.enum(["BASE", "SURCHARGE", "LOCAL"]),
  basis: z.literal("PER_CONTAINER"),
  quantity: z.number().int().positive(),
  unitRate: moneySchema,
  amount: moneySchema,
  currency: z.literal("USD"),
  sourceRateVersionId: z.string().min(1)
}).strict();
export const typedPricingSnapshotSchema = z.object({
  schemaVersion: z.literal(2),
  pricingRequestId: z.string().min(1),
  bookingRef: z.string().min(1),
  amendmentSeq: z.number().int().nonnegative(),
  bookingRevision: z.number().int().nonnegative(),
  inputFingerprint: z.string().regex(/^[0-9a-f]{64}$/),
  requestedDepartureDate: z.string().date(),
  pricingBasis: z.enum(["AGREEMENT", "TARIFF"]),
  pricingRef: z.string().min(1),
  agreementVersionId: z.string().min(1).nullable(),
  lines: z.tuple([
    pricingLineSnapshotSchema.extend({ rateCategory: z.literal("BASE") }),
    pricingLineSnapshotSchema.extend({ rateCategory: z.literal("SURCHARGE") }),
    pricingLineSnapshotSchema.extend({ rateCategory: z.literal("LOCAL") })
  ]),
  applicableDndRuleTypes: z.array(z.string()),
  total: moneySchema,
  currency: z.literal("USD"),
  pricedAt: isoInstantSchema,
  correlationId: z.string().min(1),
  createdAt: isoInstantSchema
}).strict().superRefine((snapshot, context) => {
  if (snapshot.pricingBasis === "AGREEMENT" && !snapshot.agreementVersionId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["agreementVersionId"],
      message: "agreement pricing requires agreementVersionId" });
  }
  if (snapshot.pricingBasis === "TARIFF" && snapshot.agreementVersionId !== null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["agreementVersionId"],
      message: "tariff pricing cannot carry agreementVersionId" });
  }
  const lineTotal = snapshot.lines.reduce((total, line) => total + line.amount, 0);
  if (Math.abs(lineTotal - snapshot.total) > 0.000001) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["total"],
      message: "line amounts must match total" });
  }
});
export const legacyPricingSnapshotSchema = z.object({
  pricingRequestId: z.string().nullable(),
  pricingQuoteId: z.string().min(1),
  status: z.string().min(1),
  quotedAmounts: z.record(z.string()),
  receivedAt: isoInstantSchema,
  correlationId: z.string().min(1)
}).strict();
export const pricingSnapshotEnvelopeSchema = z.object({
  pricingRequestId: z.string().nullable(),
  pricingQuoteId: z.string().min(1),
  status: z.string().min(1),
  quotedAmounts: z.record(z.string()),
  receivedAt: isoInstantSchema,
  correlationId: z.string().min(1),
  typed: typedPricingSnapshotSchema.nullable(),
  legacy: legacyPricingSnapshotSchema.nullable()
}).strict().superRefine((snapshot, context) => {
  if ((snapshot.typed === null) === (snapshot.legacy === null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["typed"],
      message: "snapshot must contain exactly one typed or legacy representation" });
  }
});
export const pricingFailureEvidenceSchema = z.object({
  reasonCode: z.string().min(1),
  reasonMessage: z.string().min(1),
  pricingRequestId: z.string().nullable(),
  manualCaseId: z.string().nullable(),
  attempts: z.number().int().nonnegative(),
  circuitState: z.string().nullable(),
  nextProbeAt: isoInstantSchema.nullable(),
  correlationId: z.string().min(1),
  occurredAt: isoInstantSchema,
  amendmentSeq: z.number().int().nonnegative()
}).strict();
export const pricingCommandResponseSchema = z.object({
  result: z.object({
    outcome: pricingOutcomeSchema,
    pricingRequestId: z.string().nullable(),
    amendmentSeq: z.number().int().nonnegative(),
    inputFingerprint: z.string().regex(/^[0-9a-f]{64}$/),
    typedSnapshot: typedPricingSnapshotSchema.nullable(),
    legacySnapshot: pricingSnapshotEnvelopeSchema.nullable(),
    failureEvidence: pricingFailureEvidenceSchema.nullable(),
    retryAfterSeconds: z.number().int().min(0).max(30),
    correlationId: z.string().min(1)
  }).strict().superRefine((result, context) => {
    const evidenceCount = Number(result.typedSnapshot !== null)
      + Number(result.legacySnapshot !== null)
      + Number(result.failureEvidence !== null);
    if (evidenceCount > 1) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "result evidence is mutually exclusive" });
    }
    if (result.outcome === "PRICED" && result.typedSnapshot === null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["typedSnapshot"],
        message: "PRICED requires a typed snapshot" });
    }
    if (result.outcome === "LEGACY_PRICED" && result.legacySnapshot === null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["legacySnapshot"],
        message: "LEGACY_PRICED requires a legacy snapshot" });
    }
    if (!["PRICED", "LEGACY_PRICED", "IN_PROGRESS", "CONFLICT"].includes(result.outcome)
      && result.failureEvidence === null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["failureEvidence"],
        message: `${result.outcome} requires failure evidence` });
    }
  }),
  history: z.object({
    current: pricingSnapshotEnvelopeSchema.nullable(),
    prior: z.array(pricingSnapshotEnvelopeSchema).max(50),
    nextCursor: z.string().nullable()
  }).strict(),
  confirmationEligible: z.boolean()
}).strict().superRefine((response, context) => {
  const expectedEligibility = response.result.outcome === "PRICED"
    || response.result.outcome === "LEGACY_PRICED";
  if (response.confirmationEligible !== expectedEligibility) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmationEligible"],
      message: "confirmation eligibility must match the current pricing outcome" });
  }
});

export type PricingCommandResponse = z.infer<typeof pricingCommandResponseSchema>;
export type PricingOutcome = z.infer<typeof pricingOutcomeSchema>;
export type TypedPricingSnapshot = z.infer<typeof typedPricingSnapshotSchema>;
export type LegacyPricingSnapshot = z.infer<typeof legacyPricingSnapshotSchema>;
export type PricingSnapshotEnvelope = z.infer<typeof pricingSnapshotEnvelopeSchema>;
export type PricingFailureEvidence = z.infer<typeof pricingFailureEvidenceSchema>;

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
    pricingRequestId: string | null;
    pricingQuoteId: string;
    status: string;
    quotedAmounts: Record<string, string>;
    quotedAt: string;
    correlationId: string;
    typed: TypedPricingSnapshot | null;
    legacy: LegacyPricingSnapshot | null;
  } | null;
  pricingHistory?: {
    current: PricingSnapshotEnvelope | null;
    prior: PricingSnapshotEnvelope[];
    nextCursor: string | null;
  } | null;
  lifecycleEvents: Array<{
    eventType: string;
    occurredAt: string;
    status?: string;
    revision?: number;
    actorSubjectId?: string;
    correlationId?: string;
  }>;
  pricingStatus?: PricingOutcome | "UNPRICED" | "REPRICE_REQUIRED";
  confirmationEligible?: boolean;
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
  | {
      ok: false;
      status: number;
      code: BookingFailureCode;
      title: string;
      message: string;
      retryable: boolean;
      supportReference: string;
      occurredAt: string;
    };

export type BookingFailureCode =
  | "AUTH_REQUIRED"
  | "BOOKING_ACCESS_DENIED"
  | "BOOKING_NOT_FOUND"
  | "BOOKING_UNAVAILABLE"
  | "BOOKING_READ_FAILED";

export type ReferenceOption = {
  id: string;
  code: string;
  displayName: string;
  version: number;
  attributes: Record<string, string>;
};

export type BookingReferenceCatalog = {
  customers: ReferenceOption[];
  locations: ReferenceOption[];
  voyages: ReferenceOption[];
  equipment: ReferenceOption[];
};

const backendUrl = () => process.env.BOOKING_SERVICE_URL ?? "http://booking-service:8085";
const MAX_COMMAND_BODY_BYTES = 32 * 1024;
const BOOKING_READ_TIMEOUT_MS = 5000;
const BOOKING_READ_ATTEMPTS = 2;
const BOOKING_PRICE_PERMISSION = "booking:request-pricing";
const SAFE_CORRELATION = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export async function loadBookings(query: URLSearchParams, actorSubjectId?: string | null): Promise<BookingLoad<BookingPage>> {
  return loadJson<BookingPage>(`/api/bookings?${query.toString()}`, actorSubjectId);
}

export async function loadBooking(id: string, actorSubjectId?: string | null): Promise<BookingLoad<BookingView>> {
  return loadJson<BookingView>(`/api/bookings/${encodeURIComponent(id)}`, actorSubjectId);
}

export function bookingReturnTo(params: { search?: string; status?: string; page?: string; size?: string }) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page && params.page !== "0") query.set("page", params.page);
  if (params.size && params.size !== "25") query.set("size", params.size);
  const suffix = query.toString();
  return suffix ? `/bookings?${suffix}` : "/bookings";
}

export function safeBookingReturnTo(value?: string) {
  if (!value || value.length > 1024 || !value.startsWith("/")) return "/bookings";
  try {
    const destination = new URL(value, "https://linercore.local");
    if (destination.origin !== "https://linercore.local" || destination.pathname !== "/bookings") {
      return "/bookings";
    }
    const allowed = new Set(["search", "status", "page", "size"]);
    for (const key of destination.searchParams.keys()) {
      if (!allowed.has(key) || destination.searchParams.getAll(key).length !== 1) return "/bookings";
    }
    return bookingReturnTo({
      search: boundedQueryValue(destination.searchParams.get("search"), 120),
      status: boundedQueryValue(destination.searchParams.get("status"), 32),
      page: integerQueryValue(destination.searchParams.get("page"), 0, 10_000),
      size: integerQueryValue(destination.searchParams.get("size"), 10, 100)
    });
  } catch {
    return "/bookings";
  }
}

export function isValidBookingId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function loadBookingReferenceCatalog(
  actorSubjectId?: string | null
): Promise<BookingLoad<BookingReferenceCatalog>> {
  const entries = await Promise.all([
    loadJson<ReferenceOption[]>("/api/reference-options?set=PARTY_CUSTOMER", actorSubjectId),
    loadJson<ReferenceOption[]>("/api/reference-options?set=LOCATION", actorSubjectId),
    loadJson<ReferenceOption[]>("/api/reference-options?set=VESSEL_VOYAGE", actorSubjectId),
    loadJson<ReferenceOption[]>("/api/reference-options?set=EQUIPMENT_TYPE", actorSubjectId)
  ]);
  const failure = entries.find((entry) => !entry.ok);
  if (failure && !failure.ok) return failure;
  return {
    ok: true,
    value: {
      customers: entries[0].ok ? entries[0].value : [],
      locations: entries[1].ok ? entries[1].value : [],
      voyages: entries[2].ok ? entries[2].value : [],
      equipment: entries[3].ok ? entries[3].value : []
    }
  };
}

export function loadReferenceOptions(
  set: "PARTY_CUSTOMER" | "LOCATION" | "VESSEL_VOYAGE" | "EQUIPMENT_TYPE",
  actorSubjectId?: string | null
) {
  return loadJson<ReferenceOption[]>(`/api/reference-options?set=${set}`, actorSubjectId);
}

export async function proxyBooking(request: Request, path: string, method: "GET" | "POST") {
  const correlationId = correlationFromRequest(request);
  const session = sessionFromRequest(request);
  const actorSubjectId = actorSubjectFromSession(session);
  if (!session) {
    return safeError(401, "AUTH_REQUIRED", "Authentication is required for Booking", correlationId);
  }
  if (!actorSubjectId) {
    return safeError(403, "BOOKING_ACTOR_REQUIRED", "A signed-in Booking actor is required", correlationId);
  }
  if (/\/price$/.test(path) && !session.permissions.includes(BOOKING_PRICE_PERMISSION)) {
    return safeError(403, "BOOKING_PRICE_FORBIDDEN", "Booking pricing is not permitted", correlationId);
  }
  const controller = new AbortController();
  const cancelBackend = () => controller.abort(request.signal.reason);
  request.signal.addEventListener("abort", cancelBackend, { once: true });
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
          const parsedBody: unknown = JSON.parse(body || "{}");
          if (/\/price$/.test(path)) {
            const parsed = priceBrowserCommandSchema.safeParse(parsedBody);
            if (!parsed.success) {
              return safeError(400, "PRICE_COMMAND_INVALID", "Price command contains unsupported fields", correlationId);
            }
            body = JSON.stringify({
              idempotencyKey: request.headers.get("idempotency-key"),
              actorSubjectId,
              correlationId
            });
          } else {
            body = JSON.stringify({ ...(parsedBody as Record<string, unknown>), actorSubjectId, correlationId });
          }
        } catch {
          return safeError(400, "JSON_INVALID", "Booking command body must be valid JSON", correlationId);
        }
      }
    }
    const headers = serviceHeaders(correlationId, actorSubjectId, request.headers.get("idempotency-key"));
    const response = await fetch(`${backendUrl()}${path}`, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal
    });
    const payload = await response.json().catch(() => null);
    if (/\/price$/.test(path)) {
      const parsed = pricingCommandResponseSchema.safeParse(payload);
      if (parsed.success) {
        const responseCorrelation = parsed.data.result.correlationId || correlationId;
        const responseHeaders: Record<string, string> = { "x-correlation-id": responseCorrelation };
        if (parsed.data.result.retryAfterSeconds > 0) {
          responseHeaders["retry-after"] = String(parsed.data.result.retryAfterSeconds);
        }
        return Response.json(parsed.data, {
          status: response.status,
          headers: responseHeaders
        });
      }
      if (response.ok) {
        return safeError(502, "BOOKING_PRICE_RESPONSE_INVALID",
          "Booking price response was malformed", correlationId);
      }
    }
    if (!response.ok) {
      const responseCorrelationId = typeof payload?.correlationId === "string" && payload.correlationId !== "local-correlation"
        ? payload.correlationId
        : correlationId;
      return Response.json({
        code: typeof payload?.code === "string" ? payload.code : "BOOKING_REQUEST_FAILED",
        message: safeProxyMessage(response.status, method),
        fields: Array.isArray(payload?.fields) ? payload.fields : [],
        correlationId: responseCorrelationId
      }, { status: response.status });
    }
    return Response.json(payload, { status: response.status });
  } catch {
    if (request.signal.aborted) {
      return safeError(499, "BOOKING_REQUEST_CANCELLED", "Booking request was cancelled", correlationId);
    }
    if (controller.signal.aborted) {
      return safeError(504, "BOOKING_TIMEOUT", "Booking service timed out", correlationId);
    }
    return safeError(503, "BOOKING_UNAVAILABLE", "Booking service is unavailable", correlationId);
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", cancelBackend);
  }
}

export async function proxyBookingPrice(request: Request, bookingId: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(bookingId)) {
    return safeError(400, "BOOKING_ID_INVALID", "Booking id is invalid", crypto.randomUUID());
  }
  return proxyBooking(request, `/api/bookings/${encodeURIComponent(bookingId)}/price`, "POST");
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
  return Response.json({ code, message, correlationId }, {
    status,
    headers: { "x-correlation-id": correlationId }
  });
}

function correlationFromRequest(request: Request): string {
  const requested = request.headers.get("x-correlation-id")?.trim();
  return requested && SAFE_CORRELATION.test(requested) ? requested : crypto.randomUUID();
}

async function loadJson<T>(path: string, actorSubjectId?: string | null): Promise<BookingLoad<T>> {
  const correlationId = crypto.randomUUID();
  const occurredAt = new Date().toISOString();
  if (!actorSubjectId?.trim()) {
    return bookingFailure(401, correlationId, occurredAt);
  }
  try {
    const response = await fetchBookingRead(`${backendUrl()}${path}`, serviceHeaders(correlationId, actorSubjectId));
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const supportReference = typeof payload?.correlationId === "string"
        && payload.correlationId !== "local-correlation"
        ? payload.correlationId
        : correlationId;
      return bookingFailure(response.status, supportReference, occurredAt);
    }
    return { ok: true, value: payload as T };
  } catch (error) {
    console.error("Booking service read unavailable", {
      correlationId,
      path,
      error: error instanceof Error ? error.name : "UnknownError"
    });
    return bookingFailure(503, correlationId, occurredAt);
  }
}

function bookingFailure(
  status: number,
  supportReference: string,
  occurredAt: string
): Extract<BookingLoad<never>, { ok: false }> {
  if (status === 401) {
    return {
      ok: false,
      status,
      code: "AUTH_REQUIRED",
      title: "Your session has ended",
      message: "Sign in again to return to Booking.",
      retryable: false,
      supportReference,
      occurredAt
    };
  }
  if (status === 403) {
    return {
      ok: false,
      status,
      code: "BOOKING_ACCESS_DENIED",
      title: "You cannot open this booking",
      message: "Your current access does not include this booking or action.",
      retryable: false,
      supportReference,
      occurredAt
    };
  }
  if (status === 404) {
    return {
      ok: false,
      status,
      code: "BOOKING_NOT_FOUND",
      title: "Booking not found",
      message: "The booking may no longer be available, or the link may be out of date.",
      retryable: false,
      supportReference,
      occurredAt
    };
  }
  if ([502, 503, 504].includes(status)) {
    return {
      ok: false,
      status,
      code: "BOOKING_UNAVAILABLE",
      title: "Booking is temporarily unavailable",
      message: "The Booking service did not respond. Your data was not changed.",
      retryable: true,
      supportReference,
      occurredAt
    };
  }
  return {
    ok: false,
    status,
    code: "BOOKING_READ_FAILED",
    title: "Booking could not be loaded",
    message: "The request could not be completed. Your data was not changed.",
    retryable: status >= 500,
    supportReference,
    occurredAt
  };
}

function safeProxyMessage(status: number, method: "GET" | "POST") {
  if (status === 401) return "Your session has ended. Sign in again.";
  if (status === 403) return "You do not have permission to perform this Booking action.";
  if (status === 404) return "The requested Booking record was not found.";
  if (status === 409) return "The Booking changed or this action can no longer be applied. Reload the record.";
  if (status >= 500) return "The Booking service is temporarily unavailable. Your data was not changed.";
  return method === "POST"
    ? "The Booking action could not be completed. Check the entered values."
    : "The Booking request could not be completed.";
}

function boundedQueryValue(value: string | null, maxLength: number) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : undefined;
}

function integerQueryValue(value: string | null, min: number, max: number) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed >= min && parsed <= max ? String(parsed) : undefined;
}

async function fetchBookingRead(url: string, headers: Headers): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < BOOKING_READ_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BOOKING_READ_TIMEOUT_MS);
    try {
      return await fetch(url, {
        headers,
        cache: "no-store",
        signal: controller.signal
      });
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}
