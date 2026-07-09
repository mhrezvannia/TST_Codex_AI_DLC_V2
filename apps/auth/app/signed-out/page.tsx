import type { CSSProperties } from "react";

export default function SignedOutPage() {
  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Session cleared</p>
        <h1 style={styles.title}>Signed out</h1>
        <p style={styles.copy}>Your Shared Platform session has been cleared.</p>
        <a data-testid="signed-out-sign-in-link" href="/sign-in" style={styles.primaryAction}>
          Sign in again
        </a>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "calc(100vh - 118px)", padding: 26, background: "#f4f7fb", display: "grid", placeItems: "start center" },
  panel: { width: "min(100%, 620px)", background: "#ffffff", border: "1px solid #e1e7ee", borderRadius: 8, padding: 28 },
  eyebrow: { margin: "0 0 9px", color: "#1e8e5a", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, fontSize: 30 },
  copy: { margin: "12px 0 20px", color: "#607080", lineHeight: 1.55 },
  primaryAction: { minHeight: 40, borderRadius: 8, background: "#11427a", color: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 16px", textDecoration: "none", fontWeight: 700 }
};
