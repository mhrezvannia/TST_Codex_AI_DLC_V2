import { forwardToBookingBff } from "../../../../lib/booking-client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return forwardToBookingBff(request, `/api/reference-options${url.search}`);
}
