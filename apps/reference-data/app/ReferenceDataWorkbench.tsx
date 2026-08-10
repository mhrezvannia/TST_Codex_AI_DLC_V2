"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { contractFindings, contractSummaries, statusLabel } from "../lib/contract-catalog";
import type { PermissionState, ReferenceRecordView, ReferenceSetDescriptor, ReferenceSetId } from "../lib/reference-data";

type WorkbenchProps = {
  initialSets: ReferenceSetDescriptor[];
  initialRecords: ReferenceRecordView[];
  initialPermissions: PermissionState;
};

type Draft = {
  code: string;
  displayName: string;
  status: "ACTIVE" | "INACTIVE";
  reason: string;
};

export function ReferenceDataWorkbench({ initialSets, initialRecords, initialPermissions }: WorkbenchProps) {
  const [sets] = useState(initialSets);
  const [selectedSet, setSelectedSet] = useState<ReferenceSetId>(initialSets.find((set) => set.id === "CURRENCY")?.id ?? initialSets[0]?.id ?? "CURRENCY");
  const [records, setRecords] = useState(initialRecords);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [selectedRecordId, setSelectedRecordId] = useState(initialRecords[0]?.id ?? "");
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [status, setStatus] = useState("Local fallback data loaded");
  const [busy, setBusy] = useState(false);

  const visibleRecords = useMemo(() => records.filter((record) => record.set === selectedSet), [records, selectedSet]);
  const selectedRecord = visibleRecords.find((record) => record.id === selectedRecordId) ?? visibleRecords[0] ?? records[0];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const correlationId = `ref-ui-${Date.now()}`;
        const permissionResponse = await fetch("/api/permissions/reference-data", { headers: { "x-correlation-id": correlationId } });
        if (!permissionResponse.ok) {
          if (!cancelled) {
            setStatus(`Permission check failed (${permissionResponse.status})`);
          }
          return;
        }
        const nextPermissions = await permissionResponse.json() as PermissionState;
        const recordsResponse = await fetch(`/api/reference-sets/${selectedSet}/records`, { headers: { "x-correlation-id": correlationId } });
        if (!recordsResponse.ok) {
          if (!cancelled) {
            setPermissions(nextPermissions);
            setStatus(`Records service unavailable (${recordsResponse.status}); showing fallback data`);
          }
          return;
        }
        const page = await recordsResponse.json() as { records: ReferenceRecordView[] };
        if (!cancelled) {
          setPermissions(nextPermissions);
          setRecords((current) => mergeRecords(current, page.records));
          setSelectedRecordId(page.records[0]?.id ?? selectedRecordId);
          setStatus("Live records loaded");
        }
      } catch {
        if (!cancelled) {
          setStatus("Records service unavailable; showing fallback data");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedSet]);

  function openCreate() {
    setDraft(emptyDraft());
    setMode("create");
  }

  function openEdit() {
    if (!selectedRecord) {
      return;
    }
    setDraft({
      code: selectedRecord.code,
      displayName: selectedRecord.displayName,
      status: selectedRecord.status,
      reason: "",
    });
    setMode("edit");
  }

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!permissions.canWrite || !mode) {
      return;
    }
    setBusy(true);
    const targetId = mode === "edit" ? selectedRecord?.id : null;
    const response = await fetch(`/api/reference-sets/${selectedSet}/records${targetId ? `/${targetId}` : ""}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: draft.code,
        displayName: draft.displayName,
        status: draft.status,
        reason: draft.reason,
        attributes: {}
      })
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setStatus(`${mode === "create" ? "Create" : "Edit"} failed (${response.status}): ${payload.error ?? "service error"}`);
      return;
    }
    setStatus(`${mode === "create" ? "Created" : "Updated"} ${draft.code}`);
    setMode(null);
    const reload = await fetch(`/api/reference-sets/${selectedSet}/records`);
    if (reload.ok) {
      const page = await reload.json() as { records: ReferenceRecordView[] };
      setRecords((current) => mergeRecords(current, page.records));
      setSelectedRecordId(page.records.find((record) => record.code === draft.code)?.id ?? selectedRecordId);
    }
  }

  return (
    <main className="reference-page" style={styles.page}>
      <style>{responsiveCss}</style>
      <header className="reference-header" style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Shared Platform</p>
          <h1 style={styles.title}>Reference Data</h1>
        </div>
        <div aria-live="polite" style={styles.statusPill} data-testid="permission-status">
          {permissions.canWrite ? "Write enabled" : "Read-only"}
        </div>
      </header>

      <section aria-label="Permission state" style={permissions.canWrite ? styles.bannerReady : styles.banner}>
        <strong>{permissions.canWrite ? "Mutation workspace" : "Read-only workspace"}</strong>
        <span>{permissions.reason}</span>
        {!permissions.canWrite ? <a data-testid="request-access-link" href="/request-access" style={styles.bannerLink}>Request access</a> : null}
      </section>

      <div aria-live="polite" data-testid="workbench-status" style={styles.notice}>{status}</div>

      <div className="reference-workspace" style={styles.workspace}>
        <nav className="reference-set-nav" aria-label="Reference sets" style={styles.nav}>
          {sets.map((set) => (
            <button
              key={set.id}
              type="button"
              aria-current={set.id === selectedSet ? "page" : undefined}
              data-testid={`reference-set-${set.id}`}
              style={set.id === selectedSet ? styles.navItemActive : styles.navItem}
              onClick={() => setSelectedSet(set.id)}
            >
              <span>{set.label}</span>
              {set.sensitive ? <small style={styles.sensitive}>Sensitive</small> : null}
            </button>
          ))}
        </nav>

        <section className="reference-content" style={styles.content} aria-labelledby="reference-list-heading">
          <div className="reference-toolbar" style={styles.toolbar}>
            <div>
              <h2 id="reference-list-heading" style={styles.sectionTitle}>Canonical records</h2>
              <p style={styles.muted}>{visibleRecords.length} records in {selectedSet}</p>
            </div>
            <button type="button" data-testid="create-record" style={permissions.canWrite ? styles.buttonPrimary : styles.buttonDisabled} disabled={!permissions.canWrite} onClick={openCreate}>
              Create
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <caption style={styles.caption}>Reference records sorted by display name</caption>
              <thead>
                <tr>
                  <th scope="col" style={styles.th}>Code</th>
                  <th scope="col" style={styles.th}>Display name</th>
                  <th scope="col" style={styles.th}>Status</th>
                  <th scope="col" style={styles.th}>Event status</th>
                  <th scope="col" style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id}>
                    <td style={styles.td}><code>{record.code}</code></td>
                    <td style={styles.td}>{record.displayName}</td>
                    <td style={styles.td}>{record.status}</td>
                    <td style={styles.td}>{eventText(record.eventStatus)}</td>
                    <td style={styles.td}>
                      <button type="button" data-testid={`record-action-${record.id}`} style={styles.linkButton} onClick={() => setSelectedRecordId(record.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section aria-labelledby="contract-catalog-heading" style={styles.contractSection}>
            <h2 id="contract-catalog-heading" style={styles.sectionTitle}>Contract catalog</h2>
            <div style={styles.contractGrid}>
              {contractSummaries.map((contract) => (
                <article key={contract.contractId} style={styles.contractItem}>
                  <strong>{contract.label}</strong>
                  <span>{contract.kind} / {contract.sourceService}</span>
                  <span data-testid={`contract-status-${contract.contractId}`}>{statusLabel(contract.compatibilityStatus)}</span>
                  <code>{contract.artifactPath}</code>
                </article>
              ))}
            </div>
            <ul aria-label="Contract findings" style={styles.findings}>
              {contractFindings.map((finding) => (
                <li key={finding.findingId}><strong>{finding.severity}</strong>: {finding.summary} ({finding.status})</li>
              ))}
            </ul>
          </section>
        </section>

        <aside className="reference-detail" style={styles.detail} aria-labelledby="detail-heading">
          <h2 id="detail-heading" style={styles.sectionTitle}>Record detail</h2>
          {selectedRecord ? (
            <>
              <dl style={styles.definitionList}>
                <div><dt>Platform id</dt><dd>{selectedRecord.id}</dd></div>
                <div><dt>Business key</dt><dd>{selectedRecord.code}</dd></div>
                <div><dt>Classification</dt><dd>{selectedRecord.classification}</dd></div>
                <div><dt>Relationship</dt><dd>{selectedRecord.relationship}</dd></div>
                <div><dt>Updated by</dt><dd>{selectedRecord.updatedBy}</dd></div>
              </dl>
              <section aria-labelledby="event-status-heading" style={styles.panel}>
                <h3 id="event-status-heading" style={styles.panelTitle}>Publication status</h3>
                <p data-testid="publication-status">{eventText(selectedRecord.eventStatus)}</p>
              </section>
              <div style={styles.actions}>
                <button type="button" disabled={!permissions.canWrite} data-testid="edit-record" style={permissions.canWrite ? styles.button : styles.buttonDisabled} onClick={openEdit}>Edit</button>
                <button type="button" disabled data-testid="deactivate-record" style={styles.buttonDisabled}>Deactivate</button>
              </div>
            </>
          ) : <p>No record selected.</p>}

          {mode ? (
            <form aria-label={`${mode} reference record`} style={styles.form} onSubmit={submitDraft}>
              <h3 style={styles.panelTitle}>{mode === "create" ? "Create record" : "Edit record"}</h3>
              <label style={styles.label}>Code<input data-testid="draft-code" required minLength={2} maxLength={32} value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} style={styles.input} /></label>
              <label style={styles.label}>Display name<input data-testid="draft-display-name" required minLength={2} maxLength={120} value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} style={styles.input} /></label>
              <label style={styles.label}>Reason<input data-testid="draft-reason" value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} style={styles.input} /></label>
              <button type="submit" data-testid="save-record" disabled={busy} style={styles.buttonPrimary}>{busy ? "Saving" : "Save"}</button>
            </form>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function emptyDraft(): Draft {
  return { code: "", displayName: "", status: "ACTIVE", reason: "" };
}

function mergeRecords(current: ReferenceRecordView[], next: ReferenceRecordView[]): ReferenceRecordView[] {
  const byId = new Map(current.map((record) => [record.id, record]));
  for (const record of next) {
    byId.set(record.id, record);
  }
  return [...byId.values()].sort((left, right) => left.displayName.localeCompare(right.displayName));
}

function eventText(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending publication",
    published: "Published",
    failed: "Publication failed",
    retrying: "Retrying publication",
    unknown: "Status unknown"
  };
  return labels[status] ?? "Status unknown";
}

const styles: Record<string, CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: 16, padding: 26, color: "#102235", background: "#f4f7fb" },
  header: { display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center" },
  eyebrow: { margin: "0 0 7px", fontSize: 12, color: "#2f73c4", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 700 },
  statusPill: { border: "1px solid #cfe0d6", borderRadius: 999, padding: "6px 12px", background: "#e7f4ec", color: "#1e8e5a", fontSize: 12, fontWeight: 700 },
  banner: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", border: "1px solid #d7e2ef", borderRadius: 8, padding: "12px 14px", background: "#ffffff", boxShadow: "0 8px 24px rgba(16, 34, 53, 0.04)" },
  bannerReady: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", border: "1px solid #cfe0d6", borderRadius: 8, padding: "12px 14px", background: "#f4fbf7", boxShadow: "0 8px 24px rgba(16, 34, 53, 0.04)" },
  bannerLink: { marginLeft: "auto", color: "#11427a", fontWeight: 700 },
  notice: { border: "1px solid #d7e2ef", borderRadius: 8, padding: "9px 12px", background: "#ffffff", color: "#607080", fontSize: 13 },
  workspace: { display: "grid", gridTemplateColumns: "230px minmax(0, 1fr) 340px", gap: 16, alignItems: "start" },
  nav: { display: "flex", flexDirection: "column", gap: 7 },
  navItem: { display: "flex", justifyContent: "space-between", gap: 8, padding: "11px 12px", borderRadius: 8, background: "#ffffff", border: "1px solid #e1e7ee", color: "#40556a", textAlign: "left", cursor: "pointer" },
  navItemActive: { display: "flex", justifyContent: "space-between", gap: 8, padding: "11px 12px", borderRadius: 8, background: "#0c2742", border: "1px solid #0c2742", color: "#ffffff", textAlign: "left", cursor: "pointer", boxShadow: "0 10px 24px rgba(12, 39, 66, 0.18)" },
  sensitive: { fontSize: 11, opacity: 0.8 },
  content: { minWidth: 0, background: "#ffffff", border: "1px solid #e1e7ee", borderRadius: 8, padding: 18, boxShadow: "0 10px 30px rgba(16, 34, 53, 0.05)" },
  toolbar: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 14 },
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
  muted: { margin: "4px 0 0", color: "#71808f", fontSize: 13 },
  tableWrap: { overflowX: "auto", border: "1px solid #edf1f5", borderRadius: 8 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#ffffff" },
  caption: { textAlign: "left", color: "#71808f", padding: "10px 12px" },
  th: { textAlign: "left", borderBottom: "1px solid #dfe6ee", padding: "10px 12px", color: "#607080", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" },
  td: { borderBottom: "1px solid #eef2f6", padding: "10px 12px", verticalAlign: "top" },
  contractSection: { borderTop: "1px solid #eef2f6", marginTop: 18, paddingTop: 18 },
  contractGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 },
  contractItem: { display: "flex", flexDirection: "column", gap: 6, border: "1px solid #e1e7ee", borderRadius: 8, padding: 12, background: "#f9fbfd" },
  findings: { margin: "12px 0 0", paddingLeft: 18, color: "#607080", fontSize: 13 },
  detail: { background: "#0c2742", color: "#ffffff", border: "1px solid #0c2742", borderRadius: 8, padding: 18, boxShadow: "0 14px 34px rgba(12, 39, 66, 0.18)" },
  definitionList: { display: "grid", gap: 9, margin: "14px 0", color: "#d4e0ec" },
  panel: { borderTop: "1px solid #1f476d", paddingTop: 12, marginTop: 12, color: "#d4e0ec" },
  panelTitle: { margin: 0, fontSize: 15, color: "#ffffff" },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
  form: { display: "grid", gap: 10, borderTop: "1px solid #1f476d", marginTop: 12, paddingTop: 12 },
  label: { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#d4e0ec" },
  input: { minWidth: 0, border: "1px solid #cdd7e2", borderRadius: 6, padding: "8px 9px", background: "#ffffff", color: "#102235" },
  button: { border: "1px solid #cdd7e2", borderRadius: 6, background: "#ffffff", color: "#102235", padding: "8px 10px", fontWeight: 700 },
  buttonPrimary: { border: "1px solid #11427a", borderRadius: 6, background: "#11427a", color: "#ffffff", padding: "8px 11px", fontWeight: 700 },
  buttonDisabled: { border: "1px solid #d5dee8", borderRadius: 6, background: "#eef2f6", color: "#71808f", padding: "8px 10px" },
  linkButton: { border: 0, background: "transparent", color: "#11427a", padding: 0, textDecoration: "underline", fontWeight: 700, cursor: "pointer" }
};

const responsiveCss = `
  @media (max-width: 1100px) {
    .reference-workspace {
      grid-template-columns: 210px minmax(0, 1fr) !important;
    }

    .reference-detail {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 720px) {
    .reference-page {
      padding: 18px !important;
    }

    .reference-header,
    .reference-toolbar {
      align-items: flex-start !important;
      flex-direction: column;
    }

    .reference-workspace {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .reference-set-nav {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .reference-content,
    .reference-detail {
      grid-column: auto;
      min-width: 0;
    }
  }
`;
