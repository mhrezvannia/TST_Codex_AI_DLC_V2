export type ShellBookingStatus =
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

export type ShellBooking = {
  id: string;
  bookingNumber: string;
  revision: number;
  status: ShellBookingStatus;
  customerId: string;
  routing: Array<{ legSequence: number; loadUnLocode: string; dischargeUnLocode: string; voyageId: string }>;
  equipment: Array<{ equipmentId: string; equipmentTypeCode: string; quantity: number }>;
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
  pricingSnapshot?: {
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
    location: { unLocationCode: string | null; facilityCode: string | null; facilityTypeCode: string | null } | null;
    eventId: string;
    source: string;
    eventTime: string;
    dataSchemaVersion: number;
    correlationId: string;
    projectedAt: string;
  }>;
  attributes: Record<string, string>;
};

export type ShellBookingPage = {
  items: ShellBooking[];
  returned: number;
  page: number;
  size: number;
};

export type ShellBookingLoad =
  | { ok: true; value: ShellBookingPage; correlationId: string; degradedMessage?: string }
  | { ok: false; status: number; message: string; correlationId: string };

export type ShellBookingDetailLoad =
  | { ok: true; value: ShellBooking; correlationId: string }
  | { ok: false; status: number; message: string; correlationId: string };

const bookingAppUrl = () => process.env.BOOKING_APP_URL ?? "http://apps-booking:3000";

export async function loadShellBookings(query: URLSearchParams, cookieHeader: string, correlationId: string): Promise<ShellBookingLoad> {
  const response = await fetch(`${bookingAppUrl()}/api/bookings?${query.toString()}`, {
    headers: {
      cookie: cookieHeader,
      "x-correlation-id": correlationId
    },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: typeof payload?.message === "string" ? payload.message : "Booking request failed",
      correlationId: typeof payload?.correlationId === "string" ? payload.correlationId : correlationId
    };
  }
  return { ok: true, value: payload as ShellBookingPage, correlationId };
}

export async function loadShellBooking(bookingId: string, cookieHeader: string, correlationId: string): Promise<ShellBookingDetailLoad> {
  const response = await fetch(`${bookingAppUrl()}/api/bookings/${encodeURIComponent(bookingId)}`, {
    headers: {
      cookie: cookieHeader,
      "x-correlation-id": correlationId
    },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: typeof payload?.message === "string" ? payload.message : "Booking request failed",
      correlationId: typeof payload?.correlationId === "string" ? payload.correlationId : correlationId
    };
  }
  return { ok: true, value: payload as ShellBooking, correlationId };
}

export async function forwardToBookingBff(request: Request, path: string, init?: RequestInit) {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const targetBaseUrl = bookingAppUrl();
  const targetOrigin = new URL(targetBaseUrl);
  const headers = new Headers(init?.headers);
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  headers.set("x-correlation-id", correlationId);
  if ((init?.method ?? "GET").toUpperCase() === "POST") {
    if (!headers.has("origin")) headers.set("origin", targetOrigin.origin);
    headers.set("x-forwarded-host", targetOrigin.host);
    headers.set("x-forwarded-proto", targetOrigin.protocol.replace(":", ""));
  }
  const idempotencyKey = request.headers.get("idempotency-key");
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
  return fetch(`${targetBaseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
}
