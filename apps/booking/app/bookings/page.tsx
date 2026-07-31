import { permanentRedirect } from "next/navigation";
import { canonicalBookingRedirect, canonicalShellOrigin } from "../../lib/booking-redirect";

type Search = Record<string, string | string[] | undefined>;

export default async function BookingListPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    for (const value of Array.isArray(raw) ? raw : raw ? [raw] : []) query.append(key, value);
  }
  const request = new Request(`http://booking.internal/bookings${query.size ? `?${query}` : ""}`);
  const decision = canonicalBookingRedirect(request, canonicalShellOrigin());
  permanentRedirect(decision?.destination.toString() ?? new URL("/booking", canonicalShellOrigin()).toString());
}
