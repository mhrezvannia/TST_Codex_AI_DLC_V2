import type { CSSProperties } from "react";

export default function AuthHomePage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.copy}>
          <p style={styles.eyebrow}>Identity gateway</p>
          <h1 style={styles.title}>Shared Platform Auth</h1>
          <p style={styles.summary}>
            Sign in with your carrier identity, inspect the safe session payload, and route denied actions into an auditable access request.
          </p>
          <div style={styles.actions}>
            <a data-testid="auth-start-link" href="/sign-in" style={styles.primaryAction}>
              Sign in
            </a>
            <a href="/session" style={styles.secondaryAction}>
              Session
            </a>
          </div>
        </div>
        <aside style={styles.identityPanel} aria-label="Authentication readiness">
          <div style={styles.panelHeader}>
            <span style={styles.panelKicker}>Runtime</span>
            <span style={styles.readyPill}>Local ready</span>
          </div>
          <dl style={styles.signalGrid}>
            <div style={styles.signal}>
              <dt>Provider</dt>
              <dd>Keycloak</dd>
            </div>
            <div style={styles.signal}>
              <dt>Mode</dt>
              <dd>BFF guarded</dd>
            </div>
            <div style={styles.signal}>
              <dt>Policy</dt>
              <dd>Fail closed</dd>
            </div>
          </dl>
          <div style={styles.traceBox}>
            <span>Auth events</span>
            <strong>correlation id required</strong>
          </div>
        </aside>
      </section>

      <section aria-label="Auth workflow" style={styles.workflow}>
        <article style={styles.workflowItem}>
          <strong>1. Authenticate</strong>
          <span>Redirect to the local identity provider with the return URL preserved.</span>
        </article>
        <article style={styles.workflowItem}>
          <strong>2. Authorize</strong>
          <span>Subject capabilities are summarized before protected workflows open.</span>
        </article>
        <article style={styles.workflowItem}>
          <strong>3. Request access</strong>
          <span>Denied actions carry resource, action, and trace metadata into the request flow.</span>
        </article>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "calc(100vh - 118px)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    padding: 26,
    background: "#f4f7fb",
    color: "#102235"
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 390px)",
    gap: 22,
    alignItems: "stretch"
  },
  copy: {
    minWidth: 0,
    background: "#ffffff",
    border: "1px solid #e1e7ee",
    borderRadius: 8,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  eyebrow: {
    margin: "0 0 10px",
    color: "#2f73c4",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.08,
    fontWeight: 700
  },
  summary: {
    maxWidth: 700,
    margin: "14px 0 0",
    color: "#607080",
    fontSize: 15,
    lineHeight: 1.55
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24
  },
  primaryAction: {
    minHeight: 38,
    borderRadius: 8,
    background: "#11427a",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    textDecoration: "none",
    fontWeight: 700
  },
  secondaryAction: {
    minHeight: 38,
    borderRadius: 8,
    border: "1px solid #d5dee8",
    background: "#ffffff",
    color: "#24384c",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    textDecoration: "none",
    fontWeight: 700
  },
  identityPanel: {
    background: "#0c2742",
    color: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: 280
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: "22px 24px 16px"
  },
  panelKicker: {
    color: "#9fb3c8",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  readyPill: {
    borderRadius: 999,
    background: "#e7f4ec",
    color: "#1e8e5a",
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700
  },
  signalGrid: {
    display: "grid",
    gap: 1,
    margin: 0,
    background: "#183b5c",
    borderTop: "1px solid #1f476d",
    borderBottom: "1px solid #1f476d"
  },
  signal: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    padding: "14px 24px",
    background: "#0f2f4f"
  },
  traceBox: {
    marginTop: "auto",
    padding: 24,
    display: "grid",
    gap: 4,
    color: "#9fb3c8"
  },
  workflow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14
  },
  workflowItem: {
    minWidth: 0,
    display: "grid",
    gap: 6,
    background: "#ffffff",
    border: "1px solid #e1e7ee",
    borderRadius: 8,
    padding: 18,
    color: "#607080"
  }
};
