import { forwardToBookingBff } from "../../../../../../lib/booking-client";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  return forwardToBookingBff(request, `/api/bookings/${encodeURIComponent(bookingId)}/validate`, {
    method: "POST",
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body: await request.text()
  });
}
