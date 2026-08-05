import Link from "next/link";
import { Card, StatusStrip } from "@erp/ui";

export default function BookingNotFound() {
  return (
    <Card title="Booking not found">
      <StatusStrip tone="warning" role="status">
        The requested booking does not exist or is no longer available.
      </StatusStrip>
      <Link className="erp-btn" href="/booking">Return to Booking</Link>
    </Card>
  );
}
