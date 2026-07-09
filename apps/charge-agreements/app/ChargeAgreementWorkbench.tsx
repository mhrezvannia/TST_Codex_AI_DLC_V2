"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { AgreementListItem, ModuleInfo, RuntimeStatus } from "../lib/charge-agreements";
import { skeletonModuleInfo } from "../lib/charge-agreements";

type WorkbenchProps = {
  initialAgreements: AgreementListItem[];
  initialStatus: RuntimeStatus;
};

export function ChargeAgreementWorkbench({ initialAgreements, initialStatus }: WorkbenchProps) {
  const [agreements] = useState(initialAgreements);
  const [selectedId, setSelectedId] = useState(initialAgreements[0]?.id ?? "");
  const [status, setStatus] = useState(initialStatus);
  const [moduleInfo, setModuleInfo] = useState<ModuleInfo>(skeletonModuleInfo);

  const selectedAgreement = useMemo(
    () => agreements.find((agreement) => agreement.id === selectedId) ?? agreements[0],
    [agreements, selectedId]
  );

  useEffect(() => {
    let cancelled = false;
    async function loadModuleInfo() {
      try {
        const response = await fetch("/api/module-info", { cache: "no-store" });
        const payload = await response.json() as ModuleInfo;
        if (!cancelled) {
          setModuleInfo(payload);
          setStatus((current) => ({
            ...current,
            backend: payload.backendStatus === "live" ? "Backend skeleton live on 8084" : "Backend fallback data loaded"
          }));
        }
      } catch {
        if (!cancelled) {
          setStatus((current) => ({ ...current, backend: "Backend fallback data loaded" }));
        }
      }
    }
    void loadModuleInfo();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Commercial module</p>
          <h1 style={styles.title}>Charge Agreements</h1>
        </div>
        <div aria-live="polite" style={styles.statusPill} data-testid="charge-backend-status">
          {status.backend}
        </div>
      </header>

      <section aria-label="Runtime status" style={styles.banner}>
        <strong>Walking skeleton</strong>
        <span>{status.authMode}</span>
        <span>{status.referenceData}</span>
      </section>

      <div style={styles.workspace}>
        <section aria-labelledby="agreement-list-heading" style={styles.panel}>
          <div style={styles.toolbar}>
            <div>
              <h2 id="agreement-list-heading" style={styles.sectionTitle}>Agreement list</h2>
              <p style={styles.muted}>Skeleton data until CRUD API arrives in U05.</p>
            </div>
            <button type="button" disabled data-testid="new-agreement" style={styles.buttonDisabled}>
              New Agreement
            </button>
          </div>
          <table style={styles.table}>
            <caption style={styles.caption}>Charge agreement skeleton list</caption>
            <thead>
              <tr>
                <th scope="col" style={styles.th}>Agreement</th>
                <th scope="col" style={styles.th}>Customer</th>
                <th scope="col" style={styles.th}>Status</th>
                <th scope="col" style={styles.th}>Lane</th>
                <th scope="col" style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {agreements.map((agreement) => (
                <tr key={agreement.id}>
                  <td style={styles.td}>{agreement.agreementNumber}</td>
                  <td style={styles.td}>{agreement.customer}</td>
                  <td style={styles.td}>{agreement.status}</td>
                  <td style={styles.td}>{agreement.tradeLane}</td>
                  <td style={styles.td}>
                    <button type="button" data-testid={`open-agreement-${agreement.id}`} style={styles.linkButton} onClick={() => setSelectedId(agreement.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside aria-labelledby="agreement-detail-heading" style={styles.detail}>
          <h2 id="agreement-detail-heading" style={styles.sectionTitle}>Agreement detail</h2>
          {selectedAgreement ? (
            <>
              <dl style={styles.definitionList}>
                <div><dt>Agreement number</dt><dd>{selectedAgreement.agreementNumber}</dd></div>
                <div><dt>Customer</dt><dd>{selectedAgreement.customer}</dd></div>
                <div><dt>Validity</dt><dd>{selectedAgreement.validFrom} to {selectedAgreement.validTo}</dd></div>
                <div><dt>Status</dt><dd>{selectedAgreement.status}</dd></div>
              </dl>
              <section aria-label="Pricing preview" style={styles.pricingRail}>
                <span>Calculated charges</span>
                <strong>$4,764.00</strong>
                <small>USD - auto-priced from active agreement</small>
                <div style={styles.chargeRows}>
                  <span>Ocean freight</span><b>$3,680.00</b>
                  <span>BAF</span><b>$440.00</b>
                  <span>THC origin</span><b>$290.00</b>
                  <span>THC destination</span><b>$330.00</b>
                  <span>ISPS</span><b>$24.00</b>
                </div>
              </section>
            </>
          ) : <p>No agreement selected.</p>}
          <div style={styles.actions}>
            <button type="button" disabled data-testid="edit-agreement" style={styles.buttonDisabled}>Edit</button>
            <button type="button" disabled data-testid="approve-agreement" style={styles.buttonDisabled}>Approve</button>
          </div>
        </aside>

        <section aria-labelledby="lookup-heading" style={styles.panel}>
          <h2 id="lookup-heading" style={styles.sectionTitle}>Active lookup preview</h2>
          <p style={styles.muted}>Booking lookup contract arrives in U09 after backend API work.</p>
          <button type="button" disabled data-testid="run-active-lookup" style={styles.buttonDisabled}>Run Lookup</button>
        </section>

        <section aria-labelledby="module-heading" style={styles.panel}>
          <h2 id="module-heading" style={styles.sectionTitle}>Module capabilities</h2>
          <p style={styles.muted}>{moduleInfo.serviceName} / {moduleInfo.mode}</p>
          <ul style={styles.capabilityList}>
            {moduleInfo.capabilities.map((capability) => (
              <li key={capability.key}>
                <strong>{capability.enabled ? "Enabled" : "Planned"}</strong>: {capability.description}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { display: "flex", flexDirection: "column", gap: 16, padding: 26, color: "#102235", background: "#f4f7fb" },
  header: { display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center" },
  eyebrow: { margin: "0 0 7px", fontSize: 12, color: "#2f73c4", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 700 },
  statusPill: { border: "1px solid #d7e2ef", borderRadius: 999, padding: "6px 12px", background: "#ffffff", color: "#40556a", fontSize: 12, fontWeight: 700 },
  banner: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", border: "1px solid #d7e2ef", borderRadius: 8, padding: "12px 14px", background: "#ffffff", boxShadow: "0 8px 24px rgba(16, 34, 53, 0.04)" },
  workspace: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 16, alignItems: "start" },
  panel: { minWidth: 0, background: "#ffffff", border: "1px solid #e1e7ee", borderRadius: 8, padding: 18, boxShadow: "0 10px 30px rgba(16, 34, 53, 0.05)" },
  detail: { background: "#ffffff", border: "1px solid #e1e7ee", borderRadius: 8, padding: 18, boxShadow: "0 10px 30px rgba(16, 34, 53, 0.05)" },
  toolbar: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 14 },
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
  muted: { margin: "4px 0 12px", color: "#71808f", fontSize: 13 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  caption: { textAlign: "left", color: "#71808f", paddingBottom: 10 },
  th: { textAlign: "left", borderBottom: "1px solid #dfe6ee", padding: "10px 12px", color: "#607080", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" },
  td: { borderBottom: "1px solid #eef2f6", padding: "10px 12px", verticalAlign: "top" },
  definitionList: { display: "grid", gap: 9, margin: "14px 0", color: "#607080" },
  pricingRail: { display: "grid", gap: 5, background: "#0c2742", color: "#ffffff", borderRadius: 8, padding: 18, marginTop: 16 },
  chargeRows: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px 14px", paddingTop: 14, marginTop: 10, borderTop: "1px solid #1f476d", color: "#cbd8e5", fontSize: 13 },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
  buttonDisabled: { border: "1px solid #d5dee8", borderRadius: 6, background: "#eef2f6", color: "#71808f", padding: "8px 10px" },
  linkButton: { border: 0, background: "transparent", color: "#11427a", padding: 0, textDecoration: "underline", fontWeight: 700, cursor: "pointer" },
  capabilityList: { margin: 0, paddingLeft: 18, color: "#607080", fontSize: 13 }
};
