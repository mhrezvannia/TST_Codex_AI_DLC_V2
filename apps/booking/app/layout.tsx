import type { ReactNode } from "react";
import { actorSubjectFromSession, sessionFromCookieHeader } from "@erp/auth";
import { DesignSystemStyles, LucideIcon } from "@erp/ui";
import { headers } from "next/headers";
import "./booking.css";

export const metadata = {
  title: "LinerCore Booking",
  description: "Booking quote-to-cash workspace"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headerStore = await headers();
  const session = sessionFromCookieHeader(headerStore.get("cookie"));
  const actor = actorSubjectFromSession(session);
  const permissions = new Set(session?.permissions ?? []);

  return (
    <html lang="en" data-theme="light">
      <body>
        <DesignSystemStyles />
        <a className="booking-skip-link" href="#booking-main">Skip to main content</a>
        <div className="booking-shell">
          <aside className="booking-sidebar" aria-label="LinerCore modules">
            <a className="booking-brand" href="/" aria-label="LinerCore home">
              <span className="booking-brand-mark" aria-hidden="true">LC</span>
              <span>LinerCore</span>
            </a>
            <nav className="booking-module-nav">
              <a href="/">
                <LucideIcon name="home" />
                <span>Home</span>
              </a>
              <a href="/bookings" aria-current="page">
                <LucideIcon name="clipboard-list" />
                <span>Bookings</span>
              </a>
              {permissions.has("reference-data:read") ? (
                <a href="/reference-data/">
                  <LucideIcon name="database" />
                  <span>Reference Data</span>
                </a>
              ) : null}
              {permissions.has("charge-agreement:read") ? (
                <a href="/charge-agreements/">
                  <LucideIcon name="file-text" />
                  <span>Service Contracts &amp; Rates</span>
                </a>
              ) : null}
            </nav>
          </aside>
          <div className="booking-workspace">
            <header className="booking-topbar">
              <details className="booking-mobile-nav">
                <summary aria-label="Open navigation">
                  <LucideIcon name="menu" />
                  <span>LinerCore</span>
                </summary>
                <nav aria-label="Mobile modules">
                  <a href="/"><LucideIcon name="home" />Home</a>
                  <a href="/bookings" aria-current="page"><LucideIcon name="clipboard-list" />Bookings</a>
                  {permissions.has("reference-data:read") ? (
                    <a href="/reference-data/"><LucideIcon name="database" />Reference Data</a>
                  ) : null}
                  {permissions.has("charge-agreement:read") ? (
                    <a href="/charge-agreements/"><LucideIcon name="file-text" />Service Contracts &amp; Rates</a>
                  ) : null}
                </nav>
              </details>
              <span className="booking-environment">Local demo</span>
              {session && actor ? (
                <details className="booking-user-menu">
                  <summary>
                    <LucideIcon name="user" />
                    <span>{session.displayName || actor}</span>
                  </summary>
                  <div>
                    <a href="/auth/session">Account and session</a>
                    <a href="/api/auth/sign-out">Sign out</a>
                  </div>
                </details>
              ) : (
                <a className="booking-sign-in" href="/auth/?returnUrl=%2Fbookings">Sign in</a>
              )}
            </header>
            <div className="booking-content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
