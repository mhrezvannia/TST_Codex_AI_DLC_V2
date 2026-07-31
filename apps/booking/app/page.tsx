import { permanentRedirect } from "next/navigation";
import { canonicalBookingRedirect, canonicalShellOrigin } from "../lib/booking-redirect";

export default function BookingHomePage() {
  const decision = canonicalBookingRedirect(new Request("http://booking.internal/bookings"), canonicalShellOrigin());
  permanentRedirect(decision?.destination.toString() ?? new URL("/booking", canonicalShellOrigin()).toString());
}
