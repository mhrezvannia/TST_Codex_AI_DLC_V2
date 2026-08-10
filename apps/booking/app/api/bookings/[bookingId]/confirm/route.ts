import { proxyBooking } from "../../../../../lib/bookings";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  return proxyBooking(request, `/api/bookings/${encodeURIComponent(bookingId)}/confirm`, "POST");
}
