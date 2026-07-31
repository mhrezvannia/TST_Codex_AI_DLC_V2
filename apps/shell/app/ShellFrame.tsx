import type { ReactNode } from "react";
import type { SessionSummary } from "@erp/auth";
import { Button, ThemeToggle } from "@erp/ui";

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
      <a className="shell-skip-link" href="#shell-main">Skip to main content</a>
      <header className="shell-topbar">
        <a className="shell-brand" href="/" data-testid="shell-home-link">LinerCore</a>
        <div className="shell-user" data-testid="shell-user-menu" aria-label="Signed-in user">
          <ThemeToggle />
          <div className="shell-user-identity">
            <span>{session.displayName || session.subject}</span>
            <strong>{session.subject}</strong>
          </div>
          <form action="/api/auth/sign-out" method="post">
            <Button size="sm" type="submit" data-testid="shell-sign-out-button">
              Sign out
            </Button>
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
          <span className="shell-nav-disabled" aria-disabled="true">Charge agreements</span>
          <span className="shell-nav-disabled" aria-disabled="true">Container movement</span>
          <span className="shell-nav-disabled" aria-disabled="true">Reference data</span>
        </nav>
      </aside>
      <main className="shell-main" id="shell-main">
        <div className="shell-breadcrumbs" aria-label="Breadcrumbs">{breadcrumbs.join(" / ")}</div>
        {children}
      </main>
    </div>
  );
}
