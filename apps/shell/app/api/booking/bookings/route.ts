import { forwardToBookingBff } from "../../../../lib/booking-client";

export async function POST(request: Request) {
  return forwardToBookingBff(request, "/api/bookings", {
    method: "POST",
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body: await request.text()
  });
}
