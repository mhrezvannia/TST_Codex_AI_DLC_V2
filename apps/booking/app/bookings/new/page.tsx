import { permanentRedirect } from "next/navigation";
import { canonicalBookingRedirect, canonicalShellOrigin } from "../../../lib/booking-redirect";

export default function NewBookingPage() {
  const decision = canonicalBookingRedirect(new Request("http://booking.internal/bookings/new"), canonicalShellOrigin());
  permanentRedirect(decision?.destination.toString() ?? new URL("/booking/new", canonicalShellOrigin()).toString());
}
