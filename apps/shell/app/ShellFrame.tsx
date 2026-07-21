import type { ReactNode } from "react";
import type { SessionSummary } from "@erp/auth";

export function ShellFrame({
  activePath,
  breadcrumbs,
  children,
  session
}: {
  activePath: "home" | "booking";
  breadcrumbs: string[];
  children: ReactNode;
  session: SessionSummary;
}) {
  return (
    <div className="shell-frame">
      <header className="shell-topbar">
        <a className="shell-brand" href="/" data-testid="shell-home-link">LinerCore</a>
        <div className="shell-user" data-testid="shell-user-menu" aria-label="Signed-in user">
          <div className="shell-user-identity">
            <span>{session.displayName || session.subject}</span>
            <strong>{session.subject}</strong>
          </div>
          <form action="/api/auth/sign-out" method="post">
            <button className="shell-sign-out" type="submit" data-testid="shell-sign-out-button">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <aside className="shell-sidebar">
        <nav aria-label="Application modules">
          <a
            className={`shell-nav-link ${activePath === "home" ? "shell-nav-link-active" : ""}`}
            href="/"
            data-testid="shell-nav-home"
          >
            Overview
          </a>
          <a
            className={`shell-nav-link ${activePath === "booking" ? "shell-nav-link-active" : ""}`}
            href="/booking"
            data-testid="shell-nav-booking"
          >
            Booking
          </a>
          <span className="shell-nav-disabled" aria-disabled="true">Reference data</span>
          <span className="shell-nav-disabled" aria-disabled="true">Charge agreements</span>
        </nav>
      </aside>
      <main className="shell-main">
        <div className="shell-breadcrumbs" aria-label="Breadcrumbs">{breadcrumbs.join(" / ")}</div>
        {children}
      </main>
    </div>
  );
}
