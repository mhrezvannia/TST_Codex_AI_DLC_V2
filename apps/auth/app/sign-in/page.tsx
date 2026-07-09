import type { CSSProperties } from "react";

export default async function SignInPage({ searchParams }: { searchParams?: Promise<{ returnUrl?: string }> }) {
  const params = await searchParams;
  const returnUrl = params?.returnUrl ?? "/session";
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div>
          <p style={styles.eyebrow}>Secure handoff</p>
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.copy}>Continue through Keycloak. The BFF will exchange the callback, redact sensitive claims, and return you to the requested workspace.</p>
        </div>
        <div style={styles.contextGrid}>
          <div style={styles.contextItem}>
            <span>Return URL</span>
            <code>{returnUrl}</code>
          </div>
          <div style={styles.contextItem}>
            <span>Client</span>
            <code>linercore-platform</code>
          </div>
        </div>
        <a data-testid="sign-in-button" href={`/api/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`} style={styles.primaryAction}>
          Continue with Keycloak
        </a>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "calc(100vh - 118px)",
    display: "grid",
    placeItems: "center",
    padding: 26,
    background: "#f4f7fb"
  },
  card: {
    width: "min(100%, 620px)",
    display: "grid",
    gap: 20,
    background: "#ffffff",
    border: "1px solid #e1e7ee",
    borderRadius: 8,
    padding: 28,
    boxShadow: "0 18px 50px rgba(16, 34, 53, 0.08)"
  },
  eyebrow: {
    margin: "0 0 9px",
    color: "#2f73c4",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.1
  },
  copy: {
    margin: "12px 0 0",
    color: "#607080",
    lineHeight: 1.55
  },
  contextGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12
  },
  contextItem: {
    minWidth: 0,
    display: "grid",
    gap: 6,
    border: "1px solid #e6ebf2",
    borderRadius: 8,
    padding: 14,
    color: "#758392",
    fontSize: 13
  },
  primaryAction: {
    minHeight: 42,
    borderRadius: 8,
    background: "#11427a",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    textDecoration: "none",
    fontWeight: 700
  }
};
