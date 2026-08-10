import { proxyBooking } from "../../../lib/bookings";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyBooking(request, `/api/reference-options${url.search}`, "GET");
}
