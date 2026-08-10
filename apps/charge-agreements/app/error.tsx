"use client";

import { useEffect, useRef } from "react";
import { Button, Card } from "@erp/ui";

export default function ChargeError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const reference = safeReference(error.digest);

  return (
    <main className="rates-page charge-route-state">
      <div role="alert" aria-live="assertive">
        <Card>
          <h1 ref={heading} tabIndex={-1} className="rates-title">
            Charge workspace could not be opened
          </h1>
          <p>The failure was contained. Retry the route or return to the charge catalogue.</p>
          {reference ? <p className="rates-muted">Reference: {reference}</p> : null}
          <div className="rates-actions">
            <Button data-testid="charge-error-retry" onClick={reset}>Retry</Button>
            <a
              className="rates-link charge-route-action"
              data-testid="charge-error-return"
              href="/charge-agreements/"
            >
              Return to catalogue
            </a>
          </div>
        </Card>
      </div>
    </main>
  );
}

function safeReference(value: string | undefined): string | undefined {
  return value && /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : undefined;
}
