import type { CSSProperties } from "react";

export default async function RequestAccessPage({
  searchParams
}: {
  searchParams?: Promise<{ resource?: string; action?: string; correlationId?: string }>;
}) {
  const params = await searchParams;
  const resource = params?.resource ?? "Shared Platform";
  const action = params?.action ?? "access";
  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Access workflow</p>
        <h1 style={styles.title}>Request access</h1>
        <div style={styles.contextGrid}>
          <div style={styles.contextItem}>
            <span>Resource</span>
            <strong>{resource}</strong>
          </div>
          <div style={styles.contextItem}>
            <span>Action</span>
            <strong>{action}</strong>
          </div>
        </div>
        <form action="/api/auth/request-access" method="post" style={styles.form}>
          <input type="hidden" name="requestedResource" value={resource} />
          <input type="hidden" name="requestedAction" value={action} />
          <label htmlFor="message" style={styles.label}>Message</label>
          <textarea data-testid="request-access-message" id="message" name="message" style={styles.textarea} />
          <button data-testid="request-access-submit" type="submit" style={styles.primaryAction}>
            Submit request
          </button>
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "calc(100vh - 118px)", padding: 26, background: "#f4f7fb", display: "grid", placeItems: "start center" },
  panel: { width: "min(100%, 720px)", background: "#ffffff", border: "1px solid #e1e7ee", borderRadius: 8, padding: 28 },
  eyebrow: { margin: "0 0 9px", color: "#2f73c4", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, fontSize: 30 },
  contextGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 18 },
  contextItem: { display: "grid", gap: 5, border: "1px solid #e6ebf2", borderRadius: 8, padding: 14, color: "#607080" },
  form: { display: "grid", gap: 10, marginTop: 20 },
  label: { fontWeight: 700 },
  textarea: { minHeight: 120, resize: "vertical", border: "1px solid #cdd7e2", borderRadius: 8, padding: 12 },
  primaryAction: { minHeight: 40, border: 0, borderRadius: 8, background: "#11427a", color: "#ffffff", padding: "0 16px", fontWeight: 700, cursor: "pointer" }
};
