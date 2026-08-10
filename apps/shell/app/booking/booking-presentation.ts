import type { ShellBooking, ShellBookingLoad } from "../../lib/booking-client";

export type BookingListPresentation =
  | { state: "empty"; items: []; correlationId: string }
  | { state: "populated"; items: ShellBooking[]; correlationId: string }
  | { state: "denied"; message: string; correlationId: string }
  | { state: "degraded"; message: string; items: ShellBooking[]; correlationId: string }
  | { state: "error"; message: string; correlationId: string };

export function normalizeBookingList(result: ShellBookingLoad): BookingListPresentation {
  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      return { state: "denied", message: result.message, correlationId: result.correlationId };
    }
    return { state: "error", message: result.message, correlationId: result.correlationId };
  }
  if (result.value.items.length > 25) {
    return {
      state: "error",
      message: `Booking response violated the 25-row shell contract (${result.value.items.length} rows returned).`,
      correlationId: result.correlationId
    };
  }
  const items = result.value.items;
  if (result.degradedMessage) {
    return { state: "degraded", message: result.degradedMessage, items, correlationId: result.correlationId };
  }
  return items.length
    ? { state: "populated", items, correlationId: result.correlationId }
    : { state: "empty", items: [], correlationId: result.correlationId };
}
