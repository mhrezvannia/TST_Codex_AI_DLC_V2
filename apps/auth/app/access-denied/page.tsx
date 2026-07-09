import { createCorrelationId } from "@erp/auth";
import type { CSSProperties } from "react";

export default async function AccessDeniedPage({
  searchParams
}: {
  searchParams?: Promise<{ reasonCode?: string; resource?: string; action?: string; correlationId?: string }>;
}) {
  const params = await searchParams;
  const correlationId = params?.correlationId ?? createCorrelationId();
  const resource = params?.resource ?? "Shared Platform";
  const action = params?.action ?? "access";
  const reasonCode = params?.reasonCode ?? "DENY_NO_PERMISSION";
  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Authorization decision</p>
        <h1 style={styles.title}>Access denied</h1>
        <p style={styles.copy}>{`You do not currently have permission to ${action} ${resource}.`}</p>
        <div style={styles.trace}>
          <span>{`Reason: ${reasonCode}`}</span>
          <code>{correlationId}</code>
        </div>
        <a
          data-testid="request-access-link"
          href={`/request-access?resource=${encodeURIComponent(resource)}&action=${encodeURIComponent(action)}&correlationId=${encodeURIComponent(correlationId)}`}
          style={styles.primaryAction}
        >
          Request access
        </a>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "calc(100vh - 118px)", padding: 26, background: "#f4f7fb", display: "grid", placeItems: "start center" },
  panel: { width: "min(100%, 720px)", background: "#ffffff", border: "1px solid #e1e7ee", borderRadius: 8, padding: 28 },
  eyebrow: { margin: "0 0 9px", color: "#a8492a", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, fontSize: 30 },
  copy: { margin: "12px 0 0", color: "#607080", lineHeight: 1.55 },
  trace: { display: "grid", gap: 6, border: "1px solid #f1d6c8", background: "#fff7f3", borderRadius: 8, padding: 14, margin: "18px 0", color: "#8b4426" },
  primaryAction: { minHeight: 40, borderRadius: 8, background: "#11427a", color: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 16px", textDecoration: "none", fontWeight: 700 }
};
