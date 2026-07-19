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
  status: ShellBookingStatus;
  customerId: string;
  routing: Array<{ loadUnLocode: string; dischargeUnLocode: string }>;
  equipment: Array<{ equipmentId: string; equipmentTypeCode: string; quantity: number }>;
};

export type ShellBookingPage = {
  items: ShellBooking[];
  returned: number;
  page: number;
  size: number;
};

export type ShellBookingLoad =
  | { ok: true; value: ShellBookingPage; correlationId: string }
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
  const headers = new Headers(init?.headers);
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  headers.set("x-correlation-id", correlationId);
  if ((init?.method ?? "GET").toUpperCase() === "POST" && !headers.has("origin")) {
    headers.set("origin", targetBaseUrl);
  }
  const idempotencyKey = request.headers.get("idempotency-key");
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
  return fetch(`${targetBaseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
}
