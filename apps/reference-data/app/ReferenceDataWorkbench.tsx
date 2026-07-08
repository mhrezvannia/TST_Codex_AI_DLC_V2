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
    <main style={styles.page}>
      <header style={styles.header}>
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

      <div style={styles.workspace}>
        <nav aria-label="Reference sets" style={styles.nav}>
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

        <section style={styles.content} aria-labelledby="reference-list-heading">
          <div style={styles.toolbar}>
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

        <aside style={styles.detail} aria-labelledby="detail-heading">
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
  page: { display: "flex", flexDirection: "column", gap: 16, padding: 24, color: "#1b1f24", background: "#f7f8fa" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" },
  eyebrow: { margin: 0, fontSize: 13, color: "#5f6b7a" },
  title: { margin: 0, fontSize: 30, fontWeight: 700 },
  statusPill: { border: "1px solid #9aa4b2", borderRadius: 6, padding: "6px 10px", background: "#ffffff", fontSize: 14 },
  banner: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", border: "1px solid #c5d1df", borderRadius: 6, padding: 12, background: "#eef5ff" },
  bannerReady: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", border: "1px solid #9ec5a9", borderRadius: 6, padding: 12, background: "#eef8f1" },
  bannerLink: { marginLeft: "auto" },
  notice: { border: "1px solid #d7dde5", borderRadius: 6, padding: "8px 10px", background: "#ffffff", fontSize: 14 },
  workspace: { display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 320px", gap: 16, alignItems: "start" },
  nav: { display: "flex", flexDirection: "column", gap: 6 },
  navItem: { display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderRadius: 6, background: "#ffffff", border: "1px solid #d7dde5", color: "#1b1f24", textAlign: "left" },
  navItemActive: { display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderRadius: 6, background: "#16324f", border: "1px solid #16324f", color: "#ffffff", textAlign: "left" },
  sensitive: { fontSize: 11 },
  content: { minWidth: 0, background: "#ffffff", border: "1px solid #d7dde5", borderRadius: 6, padding: 16 },
  toolbar: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 12 },
  sectionTitle: { margin: 0, fontSize: 20 },
  muted: { margin: "4px 0 0", color: "#5f6b7a" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  caption: { textAlign: "left", color: "#5f6b7a", paddingBottom: 8 },
  th: { textAlign: "left", borderBottom: "1px solid #c5d1df", padding: 8 },
  td: { borderBottom: "1px solid #eef1f4", padding: 8, verticalAlign: "top" },
  contractSection: { borderTop: "1px solid #eef1f4", marginTop: 16, paddingTop: 16 },
  contractGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 },
  contractItem: { display: "flex", flexDirection: "column", gap: 5, border: "1px solid #d7dde5", borderRadius: 6, padding: 10 },
  findings: { margin: "12px 0 0", paddingLeft: 18 },
  detail: { background: "#ffffff", border: "1px solid #d7dde5", borderRadius: 6, padding: 16 },
  definitionList: { display: "grid", gap: 8, margin: "12px 0" },
  panel: { borderTop: "1px solid #eef1f4", paddingTop: 12, marginTop: 12 },
  panelTitle: { margin: 0, fontSize: 16 },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
  form: { display: "grid", gap: 10, borderTop: "1px solid #eef1f4", marginTop: 12, paddingTop: 12 },
  label: { display: "flex", flexDirection: "column", gap: 4, fontSize: 13 },
  input: { minWidth: 0, border: "1px solid #9aa4b2", borderRadius: 4, padding: "7px 8px" },
  button: { border: "1px solid #9aa4b2", borderRadius: 4, background: "#ffffff", padding: "7px 9px" },
  buttonPrimary: { border: "1px solid #16324f", borderRadius: 4, background: "#16324f", color: "#ffffff", padding: "7px 9px" },
  buttonDisabled: { border: "1px solid #c5d1df", borderRadius: 4, background: "#eef1f4", color: "#5f6b7a", padding: "7px 9px" },
  linkButton: { border: 0, background: "transparent", color: "#16324f", padding: 0, textDecoration: "underline" }
};
