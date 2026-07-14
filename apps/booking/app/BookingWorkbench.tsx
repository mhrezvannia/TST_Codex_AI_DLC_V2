"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Inline,
  Input,
  Stack,
  StatusBadge,
  StatusStrip,
  Table,
  WorkflowCommandCenter
} from "@erp/ui";
import type { BookingView } from "../lib/bookings";

type Props = {
  initialBookings: BookingView[];
};

type Draft = {
  customerId: string;
  originLocationId: string;
  destinationLocationId: string;
  equipmentType: string;
  containerId: string;
};

export function BookingWorkbench({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedId, setSelectedId] = useState(initialBookings[0]?.id ?? "");
  const [status, setStatus] = useState("Fallback booking data loaded");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    customerId: "cust-demo",
    originLocationId: "loc-origin",
    destinationLocationId: "loc-destination",
    equipmentType: "equipment-type-45g1",
    containerId: "CONT-DEMO-001"
  });

  const selected = useMemo(() => bookings.find((booking) => booking.id === selectedId) ?? bookings[0], [bookings, selectedId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/bookings?limit=25");
        if (!response.ok) {
          if (!cancelled) setStatus(`Booking service unavailable (${response.status}); showing fallback data`);
          return;
        }
        const page = await response.json() as { items?: BookingView[] };
        if (!cancelled && page.items?.length) {
          setBookings(page.items);
          setSelectedId(page.items[0].id);
          setStatus("Live bookings loaded");
        }
      } catch {
        if (!cancelled) setStatus("Booking service unavailable; showing fallback data");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        idempotencyKey: `booking-ui-${Date.now()}`,
        customerId: draft.customerId,
        originLocationId: draft.originLocationId,
        destinationLocationId: draft.destinationLocationId,
        equipmentType: draft.equipmentType,
        actorSubjectId: "local-user",
        correlationId: `booking-ui-${Date.now()}`,
        attributes: { containerId: draft.containerId }
      })
    });
    await handleMutation(response, "Booking draft created");
  }

  async function runAction(action: "validate" | "price" | "confirm") {
    if (!selected) return;
    setBusy(true);
    const body = action === "price"
      ? { idempotencyKey: `pricing-ui-${Date.now()}`, actorSubjectId: "local-user", correlationId: `booking-ui-${Date.now()}` }
      : { actorSubjectId: "local-user", correlationId: `booking-ui-${Date.now()}` };
    const response = await fetch(`/api/bookings/${selected.id}/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    await handleMutation(response, `Booking ${action} complete`);
  }

  async function handleMutation(response: Response, successMessage: string) {
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setStatus(`${successMessage} failed (${response.status}): ${payload.error ?? payload.message ?? "service error"}`);
      return;
    }
    const booking = payload as BookingView;
    setBookings((current) => upsert(current, booking));
    setSelectedId(booking.id);
    setStatus(successMessage);
  }

  return (
    <main style={page}>
      <header style={header}>
        <div>
          <p style={eyebrow}>Commercial Flow</p>
          <h1 style={title}>Booking Workbench</h1>
        </div>
        <StatusStrip>{status}</StatusStrip>
      </header>

      <WorkflowCommandCenter
        queue={[
          { label: "Draft booking", owner: "Customer service", status: selected?.status ?? "Ready" },
          { label: "Pricing request", owner: "Charge Agreement", status: selected?.pricingSnapshot ? "Quoted" : "Waiting", severity: selected?.pricingSnapshot ? "normal" : "attention" },
          { label: "Confirmation", owner: "Operations", status: selected?.status === "CONFIRMED" ? "Ready for movement" : "Pending" }
        ]}
        evidence={[
          { label: "Bookings", value: `${bookings.length} loaded` },
          { label: "Selected", value: selected?.bookingNumber ?? "None" },
          { label: "Movement status", value: selected?.attributes.movementStatus ?? "Not received" }
        ]}
        exceptions={selected?.status === "EXCEPTION" ? [{ label: "Booking exception", owner: "Booking", status: "Review", severity: "blocked" }] : []}
      />

      <section style={grid}>
        <Card title="Create booking">
          <form onSubmit={createBooking}>
            <Stack gap={3}>
              <Field label="Customer"><Input value={draft.customerId} onChange={(e) => setDraft({ ...draft, customerId: e.target.value })} /></Field>
              <Field label="Origin"><Input value={draft.originLocationId} onChange={(e) => setDraft({ ...draft, originLocationId: e.target.value })} /></Field>
              <Field label="Destination"><Input value={draft.destinationLocationId} onChange={(e) => setDraft({ ...draft, destinationLocationId: e.target.value })} /></Field>
              <Field label="Equipment"><Input value={draft.equipmentType} onChange={(e) => setDraft({ ...draft, equipmentType: e.target.value })} /></Field>
              <Field label="Container"><Input value={draft.containerId} onChange={(e) => setDraft({ ...draft, containerId: e.target.value })} /></Field>
              <Button type="submit" variant="primary" disabled={busy}>Create draft</Button>
            </Stack>
          </form>
        </Card>

        <Card title="Recent bookings">
          {bookings.length === 0 ? (
            <EmptyState title="No bookings yet">Create a draft to get started.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr><th>Booking</th><th>Customer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={booking.id === selected?.id ? "erp-table__row--active" : undefined}
                    onClick={() => setSelectedId(booking.id)}
                    style={rowClickable}
                  >
                    <td><strong>{booking.bookingNumber}</strong></td>
                    <td>{booking.customerId}</td>
                    <td><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card title="Status view" inverse>
          {selected ? (
            <Stack gap={4}>
              <dl style={dl}>
                <div><dt style={dt}>ID</dt><dd style={dd}>{selected.id}</dd></div>
                <div><dt style={dt}>Route</dt><dd style={dd}>{selected.originLocationId} to {selected.destinationLocationId}</dd></div>
                <div><dt style={dt}>Revision</dt><dd style={dd}>{selected.revision}</dd></div>
                <div><dt style={dt}>Status</dt><dd style={dd}><StatusBadge status={selected.status} /></dd></div>
                <div><dt style={dt}>Quote</dt><dd style={dd}>{selected.pricingSnapshot?.pricingQuoteId ?? "Not priced"}</dd></div>
                <div><dt style={dt}>Movement</dt><dd style={dd}>{selected.attributes.movementStatus ?? "Not started"}</dd></div>
              </dl>
              <Inline>
                <Button size="sm" disabled={busy} onClick={() => runAction("validate")}>Validate</Button>
                <Button size="sm" disabled={busy} onClick={() => runAction("price")}>Price</Button>
                <Button size="sm" variant="primary" disabled={busy} onClick={() => runAction("confirm")}>Confirm</Button>
              </Inline>
            </Stack>
          ) : (
            <EmptyState title="No booking selected" />
          )}
        </Card>
      </section>
    </main>
  );
}

function upsert(current: BookingView[], next: BookingView) {
  const rest = current.filter((booking) => booking.id !== next.id);
  return [next, ...rest];
}

// Layout-only inline styles — token-based (no hardcoded colors). Presentation lives in @erp/ui.
const page: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--erp-space-4)", padding: "var(--erp-space-6)" };
const header: CSSProperties = { display: "flex", justifyContent: "space-between", gap: "var(--erp-space-5)", alignItems: "center" };
const eyebrow: CSSProperties = { margin: "0 0 var(--erp-space-1)", fontSize: "var(--erp-font-size-xs)", color: "var(--erp-color-accent)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" };
const title: CSSProperties = { margin: 0, fontSize: "var(--erp-font-size-2xl)", lineHeight: 1.1, fontWeight: 700 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "300px minmax(0, 1fr) 360px", gap: "var(--erp-space-4)", alignItems: "start" };
const rowClickable: CSSProperties = { cursor: "pointer" };
const dl: CSSProperties = { display: "grid", gap: "var(--erp-space-3)", margin: 0 };
const dt: CSSProperties = { fontSize: "var(--erp-font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75 };
const dd: CSSProperties = { margin: "2px 0 0", fontWeight: 600 };
