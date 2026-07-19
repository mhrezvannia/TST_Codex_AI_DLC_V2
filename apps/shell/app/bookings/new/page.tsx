import { permanentRedirect } from "next/navigation";
import { canonicalBookingNewPath } from "../../../lib/booking-compat";

export default function LegacyBookingNewPage() {
  permanentRedirect(canonicalBookingNewPath());
}
