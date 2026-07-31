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
        <div className="shell-brand-block">
          <a className="shell-brand" href="/" data-testid="shell-home-link">LinerCore</a>
          <span className="shell-brand-divider" />
          <span className="shell-brand-context">Commercial &amp; Equipment Platform</span>
          <span className="shell-scope">MVP - ONE TRADE LANE</span>
        </div>
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
      <div className="shell-journey" aria-label="MVP journey">
        <div className="shell-journey-step shell-journey-complete"><span>1</span><div><strong>Agreement</strong><small>Charge module</small></div></div>
        <div className="shell-journey-step shell-journey-active"><span>2</span><div><strong>Booking</strong><small>Booking module</small></div></div>
        <div className="shell-journey-step"><span>3</span><div><strong>Track &amp; trace</strong><small>Movement module</small></div></div>
        <div className="shell-journey-step"><span>4</span><div><strong>D&amp;D &amp; invoice</strong><small>Charge to Finance</small></div></div>
      </div>
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
          <a className="shell-nav-link" href="/reference-data/">Reference data</a>
          <a className="shell-nav-link" href="/charge-agreements/">Charge agreements</a>
        </nav>
      </aside>
      <main className="shell-main" id="shell-main">
        <div className="shell-breadcrumbs" aria-label="Breadcrumbs">{breadcrumbs.join(" / ")}</div>
        {children}
      </main>
    </div>
  );
}
