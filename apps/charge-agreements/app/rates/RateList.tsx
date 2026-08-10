"use client";

import { Button, Card, EmptyState, Field, Input, Select, Skeleton, StatusBadge, Table } from "@erp/ui";
import { useCallback, useEffect, useState } from "react";
import { loadRatePage } from "../../lib/rate-client";
import { rateAppPath, type RatePage } from "../../lib/rates";

export function RateList() {
  const [page, setPage] = useState<RatePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", category: "", lifecycle: "", asOf: "" });

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    query.set("page", String(targetPage));
    query.set("size", "25");
    try {
      setPage(await loadRatePage(query));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Rate list could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="rates-page">
      <header className="rates-page-header">
        <div>
          <p className="rates-eyebrow">Rate authority / unified catalogue</p>
          <h1 className="rates-title">Charge rates</h1>
          <p className="rates-muted">Versioned OFR, BAF, and THC commercial authority.</p>
        </div>
        {page?.canCreate ? (
          <a className="rates-link" href={rateAppPath("/rates/new")} data-testid="create-rate-link">Create rate</a>
        ) : null}
      </header>

      <Card title="Search and filters">
        <form className="rates-filters" onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}>
          <Field label="Search rate or charge code" htmlFor="rate-q">
            <Input id="rate-q" value={filters.q}
              onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
          </Field>
          <Field label="Category" htmlFor="rate-category">
            <Select id="rate-category" value={filters.category}
              onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
              <option value="">All categories</option>
              <option value="BASE">Base / OFR</option>
              <option value="SURCHARGE">Surcharge / BAF</option>
              <option value="LOCAL">Local / THC</option>
            </Select>
          </Field>
          <Field label="Lifecycle" htmlFor="rate-lifecycle">
            <Select id="rate-lifecycle" value={filters.lifecycle}
              onChange={(event) => setFilters({ ...filters, lifecycle: event.target.value })}>
              <option value="">All states</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EFFECTIVE">Effective</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </Field>
          <Field label="Evaluate as of" htmlFor="rate-as-of">
            <Input id="rate-as-of" type="date" value={filters.asOf}
              onChange={(event) => setFilters({ ...filters, asOf: event.target.value })} />
          </Field>
          <div className="rates-actions">
            <Button type="submit" variant="primary" data-testid="apply-rate-filters" disabled={loading}>
              Apply filters
            </Button>
            <Button type="button" onClick={() => setFilters({ q: "", category: "", lifecycle: "", asOf: "" })}>
              Clear
            </Button>
          </div>
        </form>
      </Card>

      <div className="rates-status-region" aria-live="polite" data-testid="rate-list-status">
        {loading ? "Loading rate authority…" : error || `${page?.total ?? 0} rates evaluated as of ${page?.evaluatedAsOf ?? "—"}`}
      </div>

      {loading ? (
        <Card><Skeleton height={220} /></Card>
      ) : error ? (
        <Card title="Rate service unavailable">
          <p>{error}</p>
          <Button onClick={() => void load()} data-testid="retry-rate-list">Retry</Button>
        </Card>
      ) : page && page.items.length > 0 ? (
        <div className="rates-table-region" role="region" aria-label="Charge rate results" tabIndex={0}>
          <Table>
            <caption className="rates-muted">History-aware summary; effective authority remains visible beside any Draft successor.</caption>
            <thead><tr>
              <th scope="col">Rate</th><th scope="col">Category</th><th scope="col">Summary state</th>
              <th scope="col">Amount</th><th scope="col">Validity</th><th scope="col">Versions</th><th scope="col">Action</th>
            </tr></thead>
            <tbody>
              {page.items.map((item) => (
                <tr key={item.rateId} data-testid={`rate-row-${item.rateId}`}>
                  <td><strong>{item.chargeCode}</strong><br /><small>{item.rateId}</small></td>
                  <td>{item.category}</td>
                  <td><StatusBadge status={item.selectedSummaryVersion.presentationState} />{item.hasDraft ? " + Draft" : ""}</td>
                  <td>{item.selectedSummaryVersion.unitRate} USD</td>
                  <td>{item.selectedSummaryVersion.effectiveFrom} – {item.selectedSummaryVersion.effectiveTo}</td>
                  <td>{item.versionCount}</td>
                  <td><a className="rates-link"
                    href={rateAppPath(`/rates/${encodeURIComponent(item.rateId)}`)}>Open</a></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <Card>
          <EmptyState title="No rates match these filters">
            <p>{page?.canCreate
              ? "Adjust the filters or create a new commercial authority."
              : "Adjust the filters. Your access is read-only."}</p>
          </EmptyState>
        </Card>
      )}

      {page ? (
        <nav className="rates-actions" aria-label="Rate result pages">
          <Button disabled={loading || page.page === 0} onClick={() => void load(page.page)}>Previous</Button>
          <span>Page {page.page + 1}</span>
          <Button disabled={loading || !page.hasMore} onClick={() => void load(page.page + 2)}>Next</Button>
        </nav>
      ) : null}
    </main>
  );
}
