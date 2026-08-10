import { proxyBooking } from "../../../lib/bookings";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyBooking(request, `/api/bookings${url.search}`, "GET");
}

export async function POST(request: Request) {
  return proxyBooking(request, "/api/bookings", "POST");
}
