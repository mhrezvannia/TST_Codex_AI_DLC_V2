"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Skeleton, StatusStrip, Table, TableContainer } from "@erp/ui";
import type {
  ShellBooking,
  ShellBookingStatus,
  ShellPricingCommandResponse,
  ShellPricingFailureEvidence,
  ShellPricingOutcome,
  ShellPricingSnapshotEnvelope,
  ShellPricingStatus
} from "../../../lib/booking-client";

export function BookingPricingPanel({
  bookingId,
  bookingStatus,
  initialSnapshot,
  initialHistory,
  initialPricingStatus = "UNPRICED",
  initialConfirmationEligible = false
}: {
  bookingId: string;
  bookingStatus: ShellBookingStatus;
  initialSnapshot: ShellBooking["pricingSnapshot"];
  initialHistory: ShellBooking["pricingHistory"];
  initialPricingStatus?: ShellPricingStatus;
  initialConfirmationEligible?: boolean;
}) {
  const commandButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const restoreCommandFocus = useRef(false);
  const [history, setHistory] = useState(() => normalizeHistory(initialSnapshot, initialHistory));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [outcome, setOutcome] = useState<ShellPricingStatus>(initialPricingStatus);
  const [failure, setFailure] = useState<ShellPricingFailureEvidence | null>(null);
  const [confirmationEligible, setConfirmationEligible] = useState(initialConfirmationEligible);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);

  const entries = useMemo(
    () => [history.current, ...history.prior].filter((entry): entry is ShellPricingSnapshotEnvelope => entry !== null),
    [history]
  );
  const selected = entries[Math.min(selectedIndex, Math.max(0, entries.length - 1))] ?? null;
  const command = outcome === "REPRICE_REQUIRED"
    ? "Reprice"
    : entries.length === 0 && bookingStatus === "VALIDATED"
      ? "Price"
      : null;

  useEffect(() => {
    setOutcome(initialPricingStatus);
    setConfirmationEligible(initialConfirmationEligible);
  }, [initialConfirmationEligible, initialPricingStatus]);

  useEffect(() => {
    if (busy || !restoreCommandFocus.current) return;
    restoreCommandFocus.current = false;
    requestAnimationFrame(() => (commandButton.current ?? heading.current)?.focus());
  }, [busy, outcome, requestError]);

  async function requestPrice() {
    if (!command) return;
    setBusy(true);
    setRequestError(null);
    setAnnouncement(`${command} started`);
    try {
      const response = await fetch(`/api/booking/bookings/${encodeURIComponent(bookingId)}/price`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID()
        },
        body: "{}"
      });
      const payload = await response.json().catch(() => null);
      if (!payload?.result || !payload?.history) {
        throw new Error("Pricing returned an unreadable response.");
      }
      const result = payload as ShellPricingCommandResponse;
      setHistory(result.history);
      setSelectedIndex(0);
      setOutcome(result.result.outcome);
      setFailure(result.result.failureEvidence);
      setConfirmationEligible(result.confirmationEligible);
      setAnnouncement(outcomeAnnouncement(result.result.outcome));
      if (!response.ok && !isExpectedOutcome(result.result.outcome)) {
        setRequestError(outcomeMessage(result.result.outcome, result.result.failureEvidence));
      }
    } catch (error) {
      const message = error instanceof Error && error.message.includes("unreadable")
        ? error.message
        : "Pricing is unavailable. Existing pricing evidence has been preserved.";
      setRequestError(message);
      setAnnouncement(message);
    } finally {
      restoreCommandFocus.current = true;
      setBusy(false);
    }
  }

  return <section className="erp-card shell-pricing" aria-labelledby="booking-pricing-title" data-testid="booking-pricing-region">
    <div className="shell-pricing-header">
      <div>
        <h2 id="booking-pricing-title" ref={heading} tabIndex={-1}>Pricing evidence</h2>
        <p className="shell-muted">Current and prior Booking-owned snapshots. Amounts are received from Charge.</p>
      </div>
      {command ? <Button
        ref={commandButton}
        variant="primary"
        data-testid={command === "Reprice" ? "booking-reprice" : "booking-first-price"}
        type="button"
        disabled={busy}
        aria-describedby="booking-pricing-guidance"
        onClick={requestPrice}
      >
        {busy ? `${command} in progress...` : command}
      </Button> : null}
    </div>

    <p id="booking-pricing-live" className="shell-visually-hidden" role="status" aria-live="polite">{announcement}</p>
    <p id="booking-pricing-guidance" className="shell-muted">
      {confirmationEligible ? "Current pricing permits confirmation." : "Confirmation remains blocked until current automatic pricing succeeds."}
    </p>

    {busy ? <div className="shell-pricing-skeleton" aria-label="Loading pricing" data-testid="booking-pricing-loading">
      <Skeleton /><Skeleton /><Skeleton />
    </div> : null}

    {!busy && entries.length > 0 ? <label className="shell-pricing-selector">
      Pricing snapshot
      <select
        data-testid="booking-pricing-selector"
        value={selectedIndex}
        onChange={(event) => setSelectedIndex(Number(event.currentTarget.value))}
      >
        {entries.map((entry, index) => <option key={`${entry.pricingRequestId ?? "legacy"}-${index}`} value={index}>
          {index === 0 ? "Current" : `Prior ${index}`} · {snapshotLabel(entry)}
        </option>)}
      </select>
    </label> : null}

    {!busy && requestError ? <StatusStrip tone="danger" role="alert" data-state="error">
      <h3>Pricing could not finish</h3>
      <p>{requestError}</p>
      {command ? <Button size="sm" type="button" data-testid="booking-pricing-retry" onClick={requestPrice}>
        Retry {command.toLowerCase()}
      </Button> : null}
    </StatusStrip> : null}

    {!busy && !requestError ? statePanel(outcome, failure, entries.length) : null}
    {!busy && selected?.typed ? <TypedPricingEvidence snapshot={selected} /> : null}
    {!busy && selected?.legacy ? <LegacyPricingEvidence snapshot={selected} /> : null}
  </section>;
}

function TypedPricingEvidence({ snapshot }: { snapshot: ShellPricingSnapshotEnvelope }) {
  const typed = snapshot.typed!;
  return <div data-testid="booking-pricing-typed">
    <TableContainer className="shell-table-wrap shell-pricing-lines" role="region" aria-label="Pricing line items" tabIndex={0}>
      <Table className="shell-table">
        <caption className="shell-visually-hidden">Ordered pricing line itemisation</caption>
        <thead><tr>
          <th scope="col">Charge</th><th scope="col">Category</th><th scope="col">Basis</th>
          <th scope="col">Quantity</th><th scope="col">Unit rate</th><th scope="col">Amount</th><th scope="col">Rate version</th>
        </tr></thead>
        <tbody>{typed.lines.map((line) => <tr key={`${line.rateCategory}-${line.chargeCode}`}>
          <th scope="row">{line.chargeCode}</th>
          <td>{line.category}</td><td>{line.basis.replaceAll("_", " ")}</td><td>{line.quantity}</td>
          <td>{money(line.unitRate, line.currency)}</td><td>{money(line.amount, line.currency)}</td>
          <td className="shell-pricing-technical">{line.sourceRateVersionId}</td>
        </tr>)}</tbody>
        <tfoot><tr><th scope="row" colSpan={5}>Exact received total</th><td>{money(typed.total, typed.currency)}</td><td /></tr></tfoot>
      </Table>
    </TableContainer>
    <dl className="shell-pricing-facts">
      <div><dt>Basis</dt><dd>{typed.pricingBasis}</dd></div>
      <div><dt>Pricing reference</dt><dd>{typed.pricingRef}</dd></div>
      <div><dt>Agreement version</dt><dd>{typed.agreementVersionId ?? "Tariff pricing"}</dd></div>
      <div><dt>Requested departure</dt><dd>{typed.requestedDepartureDate}</dd></div>
      <div><dt>Amendment</dt><dd>{typed.amendmentSeq}</dd></div>
      <div><dt>Request</dt><dd>{typed.pricingRequestId}</dd></div>
      <div><dt>Correlation</dt><dd>{typed.correlationId}</dd></div>
      <div><dt>Priced at</dt><dd>{formatInstant(typed.pricedAt)}</dd></div>
      <div><dt>Recorded at</dt><dd>{formatInstant(typed.createdAt)}</dd></div>
    </dl>
  </div>;
}

function LegacyPricingEvidence({ snapshot }: { snapshot: ShellPricingSnapshotEnvelope }) {
  const legacy = snapshot.legacy!;
  return <StatusStrip tone="warning" role="status" data-testid="booking-pricing-legacy">
    <h3>Legacy pricing snapshot</h3>
    <p>This read-only record predates typed line and version attribution. No missing evidence has been inferred.</p>
    <dl className="shell-pricing-facts">
      {Object.entries(legacy.quotedAmounts).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      <div><dt>Quote</dt><dd>{legacy.pricingQuoteId}</dd></div>
      <div><dt>Correlation</dt><dd>{legacy.correlationId}</dd></div>
      <div><dt>Received</dt><dd>{formatInstant(legacy.receivedAt)}</dd></div>
    </dl>
  </StatusStrip>;
}

function statePanel(outcome: ShellPricingStatus, evidence: ShellPricingFailureEvidence | null, historySize: number) {
  if (outcome === "UNPRICED" && historySize === 0) {
    return <StatusStrip role="status" data-testid="booking-pricing-empty"><h3>Not priced</h3><p>No pricing evidence has been recorded.</p></StatusStrip>;
  }
  if (outcome === "REPRICE_REQUIRED") {
    return <StatusStrip tone="warning" role="status" data-testid="booking-pricing-stale"><h3>Reprice required</h3><p>Pricing-affecting booking inputs changed. Prior evidence remains read-only.</p></StatusStrip>;
  }
  if (outcome === "MANUAL_PRICING_REQUIRED") {
    const noRate = evidence?.reasonCode === "NO_RATE";
    return <StatusStrip tone="warning" role="status" data-testid="booking-pricing-manual">
      <h3>{noRate ? "No automatic rate found" : evidence ? "Pricing ambiguity requires review" : "Manual pricing required"}</h3>
      <p>{evidence?.reasonMessage ?? "Manual pricing evidence was recorded without an amount."}</p>
      <p className="shell-muted">No total or manual quote control is available in Booking.</p>
    </StatusStrip>;
  }
  if (["DENIED", "VALIDATION_FAILED", "MALFORMED", "CONFLICT", "IN_PROGRESS", "TIMEOUT", "UNAVAILABLE", "CIRCUIT_OPEN", "BOOKING_CHANGED"].includes(outcome)) {
    return <StatusStrip tone="danger" role="alert" data-testid={`booking-pricing-${outcome.toLowerCase()}`}>
      <h3>{outcomeTitle(outcome as ShellPricingOutcome)}</h3>
      <p>{outcomeMessage(outcome as ShellPricingOutcome, evidence)}</p>
    </StatusStrip>;
  }
  return null;
}

function normalizeHistory(snapshot: ShellBooking["pricingSnapshot"], history: ShellBooking["pricingHistory"]): ShellPricingCommandResponse["history"] {
  if (history) return { current: history.current ?? null, prior: history.prior.slice(0, 50), nextCursor: history.nextCursor };
  if (!snapshot) return { current: null, prior: [], nextCursor: null };
  return {
    current: {
      pricingRequestId: snapshot.pricingRequestId,
      pricingQuoteId: snapshot.pricingQuoteId,
      status: snapshot.status,
      quotedAmounts: snapshot.quotedAmounts,
      receivedAt: snapshot.quotedAt,
      correlationId: snapshot.correlationId,
      typed: snapshot.typed,
      legacy: snapshot.legacy
    },
    prior: [],
    nextCursor: null
  };
}

function snapshotLabel(snapshot: ShellPricingSnapshotEnvelope) {
  return snapshot.typed
    ? `${snapshot.typed.pricingBasis} · amendment ${snapshot.typed.amendmentSeq}`
    : `Legacy · ${snapshot.pricingQuoteId}`;
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);
}

function formatInstant(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
}

function isExpectedOutcome(outcome: ShellPricingOutcome) {
  return ["MANUAL_PRICING_REQUIRED", "IN_PROGRESS", "CONFLICT", "BOOKING_CHANGED"].includes(outcome);
}

function outcomeAnnouncement(outcome: ShellPricingOutcome) {
  return outcome === "PRICED" || outcome === "LEGACY_PRICED"
    ? "Pricing completed and current evidence is available"
    : outcomeMessage(outcome, null);
}

function outcomeTitle(outcome: ShellPricingOutcome) {
  const titles: Partial<Record<ShellPricingOutcome, string>> = {
    DENIED: "Pricing access denied",
    VALIDATION_FAILED: "Pricing inputs need correction",
    MALFORMED: "Pricing response was invalid",
    CONFLICT: "Pricing request conflicted",
    IN_PROGRESS: "Pricing is already in progress",
    TIMEOUT: "Pricing timed out",
    UNAVAILABLE: "Pricing is unavailable",
    CIRCUIT_OPEN: "Pricing is temporarily paused",
    BOOKING_CHANGED: "Booking changed during pricing"
  };
  return titles[outcome] ?? "Pricing needs attention";
}

function outcomeMessage(outcome: ShellPricingOutcome, evidence: ShellPricingFailureEvidence | null) {
  if (evidence?.reasonMessage) return evidence.reasonMessage;
  const messages: Partial<Record<ShellPricingOutcome, string>> = {
    DENIED: "Authorization was evaluated before Booking existence. No pricing data was disclosed.",
    VALIDATION_FAILED: "Correct the Booking pricing inputs before trying again.",
    MALFORMED: "The provider response was rejected and no amount was stored.",
    CONFLICT: "A different request already owns this pricing operation.",
    IN_PROGRESS: "Wait for the current bounded attempt, then retry.",
    TIMEOUT: "The bounded provider deadline expired. Existing evidence is unchanged.",
    UNAVAILABLE: "The pricing provider could not be reached. Existing evidence is unchanged.",
    CIRCUIT_OPEN: "Transient provider failures opened the process-local circuit. Retry after the advised interval.",
    BOOKING_CHANGED: "Pricing was fenced because the Booking revision changed."
  };
  return messages[outcome] ?? "Pricing did not complete.";
}
