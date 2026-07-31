import { permanentRedirect } from "next/navigation";
import { canonicalBookingRedirect, canonicalShellOrigin } from "../../../lib/booking-redirect";

export default async function BookingDetailPage({ params, searchParams }: { params: Promise<{ bookingId: string }>; searchParams: Promise<{ created?: string; returnTo?: string }> }) {
  const [{ bookingId }, query] = await Promise.all([params, searchParams]);
  const suffix = query.created === "1" ? "?created=1" : "";
  const request = new Request(`http://booking.internal/bookings/${encodeURIComponent(bookingId)}${suffix}`);
  const decision = canonicalBookingRedirect(request, canonicalShellOrigin());
  permanentRedirect(decision?.destination.toString() ?? new URL("/booking", canonicalShellOrigin()).toString());
}
