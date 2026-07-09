import type { CSSProperties } from "react";

export default function SessionPage() {
  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Signed-in context</p>
        <h1 style={styles.title}>Current Session</h1>
        <p style={styles.copy}>Your session summary is loaded through the server-side BFF and exposed as a redacted operational payload.</p>
        <div style={styles.actions}>
          <a data-testid="session-json-link" href="/api/auth/session" style={styles.secondaryAction}>
            View safe session JSON
          </a>
          <form action="/api/auth/sign-out" method="post">
            <button data-testid="sign-out-button" type="submit" style={styles.dangerAction}>
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "calc(100vh - 118px)", padding: 26, background: "#f4f7fb", display: "grid", placeItems: "start center" },
  panel: { width: "min(100%, 720px)", background: "#ffffff", border: "1px solid #e1e7ee", borderRadius: 8, padding: 28 },
  eyebrow: { margin: "0 0 9px", color: "#2f73c4", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, fontSize: 30 },
  copy: { margin: "12px 0 0", color: "#607080", lineHeight: 1.55 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 22 },
  secondaryAction: { minHeight: 38, borderRadius: 8, border: "1px solid #d5dee8", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 14px", textDecoration: "none", fontWeight: 700 },
  dangerAction: { minHeight: 38, borderRadius: 8, border: "1px solid #b64b4b", background: "#fff5f5", color: "#9d3030", padding: "0 14px", fontWeight: 700, cursor: "pointer" }
};
