import { notFound, permanentRedirect } from "next/navigation";
import { canonicalBookingDetailPath } from "../../../lib/booking-compat";

export default async function LegacyBookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const target = canonicalBookingDetailPath((await params).bookingId);
  if (!target) {
    notFound();
  }
  permanentRedirect(target);
}
