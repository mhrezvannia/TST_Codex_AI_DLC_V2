import type { ReactNode } from "react";
import { EnvironmentBadge, ProductWordmark } from "@erp/ui";

export function AuthBoundaryLayout({ children }: { children: ReactNode }) {
  const environmentLabel = process.env.LINERCORE_ENVIRONMENT_LABEL ?? "LOCAL DEMO";

  return (
    <div className="auth-gateway">
      <a className="auth-gateway__skip-link" href="#auth-boundary-main">
        Skip to main content
      </a>

      <header className="auth-gateway__header">
        <ProductWordmark context="Shipping operations platform" showMark={false} />
        <EnvironmentBadge>{environmentLabel}</EnvironmentBadge>
      </header>

      <main className="auth-gateway__main" id="auth-boundary-main">
        {children}
      </main>

      <footer className="auth-gateway__footer">
        <span>Authorized users only</span>
        <span aria-hidden="true">&middot;</span>
        <span>Contact your platform administrator for access support.</span>
      </footer>
    </div>
  );
}

export function AuthStatePanel({
  eyebrow,
  title,
  summary,
  wide = false,
  children
}: {
  eyebrow: string;
  title: string;
  summary: string;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={`auth-gateway__panel${wide ? " auth-gateway__panel--wide" : ""}`}
      aria-labelledby="auth-boundary-title"
    >
      <div className="auth-gateway__copy">
        <p className="auth-gateway__eyebrow">{eyebrow}</p>
        <h1 id="auth-boundary-title">{title}</h1>
        <p className="auth-gateway__summary">{summary}</p>
      </div>
      {children}
    </section>
  );
}

export function DestinationSummary({ children }: { children: ReactNode }) {
  return <p className="auth-gateway__destination">{children}</p>;
}

export function AuthNotice({
  title,
  children,
  tone = "warning"
}: {
  title: string;
  children: ReactNode;
  tone?: "warning" | "error" | "success";
}) {
  return (
    <div className={`auth-gateway__notice auth-gateway__notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  );
}

export function SupportDetails({
  items
}: {
  items: Array<{ term: string; description: ReactNode }>;
}) {
  return (
    <details className="auth-gateway__details">
      <summary>Technical details</summary>
      <dl>
        {items.map((item) => (
          <div key={item.term}>
            <dt>{item.term}</dt>
            <dd>{item.description}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
