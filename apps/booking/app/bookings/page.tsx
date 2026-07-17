import Link from "next/link";
import { bookingReturnTo, loadBookings, type BookingStatus } from "../../lib/bookings";

type Search = { search?: string; status?: BookingStatus; page?: string };

export default async function BookingListPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ page: params.page ?? "0", size: "25" });
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  const returnTo = bookingReturnTo(params);
  const result = await loadBookings(query);

  return (
    <main className="booking-page">
      <div className="booking-heading-row">
        <div><p className="booking-eyebrow">Operations queue</p><h1>Bookings</h1></div>
        <Link className="booking-button booking-button-primary" href="/bookings/new">New booking</Link>
      </div>
      <form className="booking-filters" method="get">
        <label>Search<input name="search" defaultValue={params.search ?? ""} /></label>
        <label>Status<select name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option><option value="DRAFT">Draft</option><option value="VALIDATED">Validated</option>
          <option value="PRICED">Priced</option><option value="CONFIRMED">Confirmed</option><option value="EXCEPTION">Exception</option>
        </select></label>
        <button className="booking-button" type="submit">Apply</button>
      </form>
      {!result.ok ? (
        <section className="booking-state booking-state-error"><h2>Bookings unavailable</h2><p>{result.message}</p><a href="/bookings">Retry</a></section>
      ) : result.value.items.length === 0 ? (
        <section className="booking-state"><h2>No bookings found</h2><p>Create a draft or change the current filters.</p></section>
      ) : (
        <div className="booking-table-wrap"><table className="booking-table"><thead><tr><th>Booking</th><th>Customer</th><th>Route</th><th>Equipment</th><th>Status</th></tr></thead>
          <tbody>{result.value.items.map((booking) => <tr key={booking.id}>
            <td><Link href={`/bookings/${booking.id}?returnTo=${encodeURIComponent(returnTo)}`}>{booking.bookingNumber}</Link></td><td>{booking.customerId}</td>
            <td>{booking.routing[0] ? `${booking.routing[0].loadUnLocode} to ${booking.routing[0].dischargeUnLocode}` : "Correction required"}</td>
            <td>{booking.equipment[0]?.equipmentId ?? "Correction required"}</td><td><span className={`booking-status booking-status-${booking.status.toLowerCase()}`}>{booking.status}</span></td>
          </tr>)}</tbody></table></div>
      )}
    </main>
  );
}
