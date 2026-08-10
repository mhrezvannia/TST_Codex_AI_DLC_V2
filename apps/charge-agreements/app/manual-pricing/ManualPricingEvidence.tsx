"use client";

import { Button, Card, EmptyState, Field, Input, Select, Skeleton, StatusBadge, Table } from "@erp/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { getManualCase, listManualCases } from "../../lib/manual-pricing-client";
import { manualPricingAppPath, type ManualCase, type ManualCasePage } from "../../lib/manual-pricing";

export function ManualPricingEvidence() {
  const [page, setPage] = useState<ManualCasePage | null>(null);
  const [selected, setSelected] = useState<ManualCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ reasonCode: "", bookingRef: "", openedFrom: "", openedTo: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const focusDetailHeading = useRef(false);

  const load = useCallback(async (browserPage = 1) => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page: String(browserPage) });
    Object.entries(appliedFilters).forEach(([key, value]) => { if (value) query.set(key, value); });
    try {
      setPage(await listManualCases(query));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Manual pricing evidence could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!selected || !focusDetailHeading.current) return;
    focusDetailHeading.current = false;
    requestAnimationFrame(() => detailHeading.current?.focus());
  }, [selected]);

  async function selectCase(caseId: string, trigger: HTMLButtonElement) {
    detailTrigger.current = trigger;
    setDetailLoading(true);
    setError("");
    try {
      const detail = await getManualCase(caseId);
      focusDetailHeading.current = true;
      setSelected(detail);
      const url = new URL(window.location.href);
      url.searchParams.set("case", caseId);
      window.history.replaceState(null, "", url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Manual pricing evidence could not be loaded");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("case");
    window.history.replaceState(null, "", url);
    requestAnimationFrame(() => detailTrigger.current?.focus());
  }

  return (
    <main className="manual-pricing-page" data-testid="manual-pricing-page">
      <header>
        <p className="rates-eyebrow">Charge authority / exception evidence</p>
        <h1 className="rates-title">Manual pricing evidence</h1>
        <p className="rates-muted">Read-only failures from automatic pricing. Pricing Analysts investigate authority outside this view.</p>
      </header>

      <Card title="Filter OPEN evidence">
        <form className="manual-pricing-filters" onSubmit={(event) => {
          event.preventDefault();
          setAppliedFilters({ ...filters });
        }}>
          <Field label="Reason" htmlFor="manual-reason">
            <Select id="manual-reason" value={filters.reasonCode}
              onChange={(event) => setFilters({ ...filters, reasonCode: event.target.value })}>
              <option value="">All reasons</option>
              <option value="NO_RATE">No rate</option>
              <option value="AMBIGUOUS_AGREEMENT_AUTHORITY">Agreement ambiguity</option>
              <option value="AMBIGUOUS_BASE_RATE">Base rate ambiguity</option>
              <option value="AMBIGUOUS_SURCHARGE_RATE">Surcharge ambiguity</option>
              <option value="AMBIGUOUS_LOCAL_RATE">Local rate ambiguity</option>
            </Select>
          </Field>
          <Field label="Booking reference" htmlFor="manual-booking">
            <Input id="manual-booking" value={filters.bookingRef}
              onChange={(event) => setFilters({ ...filters, bookingRef: event.target.value })} />
          </Field>
          <Field label="Opened from" htmlFor="manual-from">
            <Input id="manual-from" type="datetime-local" value={filters.openedFrom}
              onChange={(event) => setFilters({ ...filters, openedFrom: event.target.value })} />
          </Field>
          <Field label="Opened to" htmlFor="manual-to">
            <Input id="manual-to" type="datetime-local" value={filters.openedTo}
              onChange={(event) => setFilters({ ...filters, openedTo: event.target.value })} />
          </Field>
          <div className="rates-actions">
            <Button type="submit" variant="primary" disabled={loading} data-testid="apply-manual-filters">Apply filters</Button>
            <Button type="button" onClick={() => setFilters({ reasonCode: "", bookingRef: "", openedFrom: "", openedTo: "" })}>Clear</Button>
          </div>
        </form>
      </Card>

      <div className="rates-status-region" aria-live="polite" data-testid="manual-case-status">
        {loading ? "Loading OPEN evidence…" : error || `${page?.total ?? 0} OPEN cases`}
      </div>

      {loading ? <Card><Skeleton height={240} /></Card> : error ? (
        <Card title="Evidence service unavailable"><p>{error}</p><Button onClick={() => void load()}>Retry</Button></Card>
      ) : page && page.items.length ? (
        <div className="rates-table-region" role="region" aria-label="Manual pricing evidence" tabIndex={0}>
          <Table>
            <caption className="rates-muted">Stable OPEN evidence ordered by most recent opening time.</caption>
            <thead><tr><th scope="col">Case</th><th scope="col">Booking</th><th scope="col">Reason</th><th scope="col">Opened</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
            <tbody>{page.items.map((item) => (
              <tr key={item.caseId} data-testid={`manual-case-row-${item.caseId}`}>
                <td><strong>{item.caseId}</strong><br /><small>{item.pricingRequestId}</small></td>
                <td>{item.bookingRef ?? "Unavailable (legacy)"}</td>
                <td>{item.reasonCode}</td>
                <td>{item.openedAt ?? "Unavailable (legacy)"}</td>
                <td><StatusBadge status="OPEN" /></td>
                <td><Button data-testid={`manual-case-view-${item.caseId}`}
                  onClick={(event) => void selectCase(item.caseId, event.currentTarget)}>View evidence</Button></td>
              </tr>
            ))}</tbody>
          </Table>
        </div>
      ) : <Card><EmptyState title="No OPEN evidence matches these filters"><p>Adjust the filters to inspect another evidence set.</p></EmptyState></Card>}

      {page ? <nav className="rates-actions" aria-label="Manual evidence pages">
        <Button disabled={loading || page.page === 0} onClick={() => void load(page.page)}>Previous</Button>
        <span>Page {page.page + 1}</span>
        <Button disabled={loading || (page.page + 1) * page.size >= page.total} onClick={() => void load(page.page + 2)}>Next</Button>
      </nav> : null}

      {detailLoading ? <Card><Skeleton height={180} /></Card> : selected ? (
        <Card>
          <div className="rates-actions">
            <h2 ref={detailHeading} tabIndex={-1}>Case evidence</h2>
            <Button data-testid="manual-case-close" onClick={closeDetail}>Close evidence</Button>
          </div>
          <dl className="rates-definition-list" data-testid="manual-case-detail">
            <div><dt>Case ID</dt><dd>{selected.caseId}</dd></div>
            <div><dt>Pricing request</dt><dd>{selected.pricingRequestId}</dd></div>
            <div><dt>Reason</dt><dd>{selected.reasonCode}</dd></div>
            <div><dt>Correlation</dt><dd>{selected.correlationId ?? "Unavailable (legacy)"}</dd></div>
            <div><dt>Request hash</dt><dd>{selected.requestHash ?? "Unavailable (legacy)"}</dd></div>
            <div><dt>Responsible role</dt><dd>Pricing Analyst</dd></div>
            <div><dt>Lane</dt><dd>{selected.requestContext?.tradeLane ?? "Unavailable (legacy)"}</dd></div>
            <div><dt>Route</dt><dd>{selected.requestContext ? `${selected.requestContext.pol} → ${selected.requestContext.pod}` : "Unavailable (legacy)"}</dd></div>
          </dl>
          {selected.legacyEvidence ? <p className="rates-muted">This historical case has limited evidence; unavailable fields were not reconstructed.</p> : null}
        </Card>
      ) : null}

      <p className="rates-muted"><a href={manualPricingAppPath("/")}>Return to Charge agreements</a></p>
    </main>
  );
}
