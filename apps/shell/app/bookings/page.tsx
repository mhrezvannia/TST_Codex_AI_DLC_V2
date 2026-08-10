import { permanentRedirect } from "next/navigation";
import { canonicalBookingListPath } from "../../lib/booking-compat";

type Search = Record<string, string | string[] | undefined>;

export default async function LegacyBookingsPage({ searchParams }: { searchParams: Promise<Search> }) {
  permanentRedirect(canonicalBookingListPath(await searchParams));
}
