import { proxyBookingPrice } from "../../../../../lib/bookings";

export async function POST(request: Request, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  return proxyBookingPrice(request, bookingId);
}
