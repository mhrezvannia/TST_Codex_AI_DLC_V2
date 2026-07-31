"use client";

import { Button, Card, EmptyState, Field, Input, Select, Skeleton, StatusBadge, Table } from "@erp/ui";
import { useCallback, useEffect, useState } from "react";
import { listAgreements } from "../lib/agreement-client";
import { agreementAppPath, canonicalAgreementSearchParams, type AgreementPage } from "../lib/agreements";

export function AgreementList() {
  const [result, setResult] = useState<AgreementPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ customerId: "", tradeLaneId: "", lifecycle: "", validOn: "" });

  const load = useCallback(async (browserPage = 1) => {
    setLoading(true);
    setError("");
    const browser = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && browser.set(key, value));
    browser.set("page", String(browserPage));
    browser.set("size", "25");
    window.history.replaceState(null, "", `${window.location.pathname}?${browser}`);
    try {
      setResult(await listAgreements(canonicalAgreementSearchParams(browser)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Agreements could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  return <main className="rates-page">
    <header className="rates-page-header">
      <div>
        <p className="rates-eyebrow">Agreement authority / administration</p>
        <h1 className="rates-title">Charge agreements</h1>
        <p className="rates-muted">Stable identities with immutable approved versions and explicit RateVersion links.</p>
      </div>
      {result?.canCreate ? <a className="rates-link" href={agreementAppPath("/agreements/new")} data-testid="create-agreement-link">Create agreement</a> : null}
    </header>
    <Card title="Search and filters">
      <form className="rates-filters" onSubmit={(event) => { event.preventDefault(); void load(); }}>
        <Field label="Customer ID" htmlFor="agreement-customer"><Input id="agreement-customer" value={filters.customerId} onChange={(event) => setFilters({ ...filters, customerId: event.target.value })} /></Field>
        <Field label="Trade lane ID" htmlFor="agreement-lane"><Input id="agreement-lane" value={filters.tradeLaneId} onChange={(event) => setFilters({ ...filters, tradeLaneId: event.target.value })} /></Field>
        <Field label="Lifecycle" htmlFor="agreement-lifecycle"><Select id="agreement-lifecycle" value={filters.lifecycle} onChange={(event) => setFilters({ ...filters, lifecycle: event.target.value })}><option value="">All states</option>{["DRAFT", "APPROVED", "SUSPENDED", "EXPIRED", "LEGACY"].map((value) => <option key={value}>{value}</option>)}</Select></Field>
        <Field label="Valid on" htmlFor="agreement-valid-on"><Input id="agreement-valid-on" type="date" value={filters.validOn} onChange={(event) => setFilters({ ...filters, validOn: event.target.value })} /></Field>
        <div className="rates-actions"><Button type="submit" variant="primary" disabled={loading} data-testid="apply-agreement-filters">Apply filters</Button><Button type="button" onClick={() => setFilters({ customerId: "", tradeLaneId: "", lifecycle: "", validOn: "" })}>Clear</Button></div>
      </form>
    </Card>
    <div className="rates-status-region" aria-live="polite" data-testid="agreement-list-status">{loading ? "Loading agreement authority…" : error || `${result?.total ?? 0} agreements`}</div>
    {loading ? <Card><Skeleton height={220} /></Card> : error ? <Card title="Agreement service unavailable"><p>{error}</p><Button onClick={() => void load()} data-testid="retry-agreement-list">Retry</Button></Card> : result?.items.length ? <div className="rates-table-region" role="region" aria-label="Agreement results" tabIndex={0}><Table><caption className="rates-muted">W2 authority and read-only legacy history are explicitly distinguished.</caption><thead><tr><th scope="col">Agreement</th><th scope="col">Authority</th><th scope="col">Lifecycle</th><th scope="col">Customer / lane</th><th scope="col">Validity</th><th scope="col">Action</th></tr></thead><tbody>{result.items.map((item) => {
      const version = item.selectedVersion;
      return <tr key={item.agreementId} data-testid={`agreement-row-${item.agreementId}`}><td><strong>{item.agreementNumber}</strong><br /><small>{item.agreementId}</small></td><td>{item.authorityModel}{item.readOnly ? " / read-only" : ""}</td><td>{version ? <StatusBadge status={version.lifecycle} /> : "—"}</td><td>{version?.customerId ?? "—"}<br /><small>{version?.tradeLaneId ?? "—"}</small></td><td>{version ? `${version.validFrom} – ${version.validTo}` : "—"}</td><td><a className="rates-link" href={agreementAppPath(`/agreements/${encodeURIComponent(item.agreementId)}`)}>Open</a></td></tr>;
    })}</tbody></Table></div> : <Card><EmptyState title="No agreements match these filters"><p>Adjust filters or create a W2 Agreement Draft if permitted.</p></EmptyState></Card>}
    {result ? <nav className="rates-actions" aria-label="Agreement result pages"><Button disabled={loading || result.page === 0} onClick={() => void load(result.page)}>Previous</Button><span>Page {result.page + 1}</span><Button disabled={loading || !result.hasMore} onClick={() => void load(result.page + 2)}>Next</Button></nav> : null}
  </main>;
}
