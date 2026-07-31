import type { SessionSummary } from "@erp/auth";

export function AccessDeniedPanel({
  action,
  correlationId,
  resource,
  session
}: {
  action: string;
  correlationId: string;
  message: string;
  resource: string;
  session: SessionSummary;
}) {
  const requestAccess = `/auth/request-access?resource=${encodeURIComponent(resource)}&action=${encodeURIComponent(action)}&correlationId=${encodeURIComponent(correlationId)}`;
  return (
    <section className="shell-state shell-denied" data-testid="shell-access-denied" aria-labelledby="shell-access-denied-title">
      <p className="shell-eyebrow">Authorization decision</p>
      <h1 id="shell-access-denied-title">You cannot {businessAction(action)}</h1>
      <p>This action is not included in your current access for {businessResource(resource)}.</p>
      <div className="shell-actions">
        <a className="shell-button shell-button-primary" href="/" data-testid="shell-denied-home">Return to workspace</a>
        <a className="shell-button" href={requestAccess} data-testid="shell-request-access">Access request options</a>
      </div>
      <details className="erp-technical-details">
        <summary>Technical details</summary>
        <dl className="shell-denied-facts">
          <div><dt>Subject</dt><dd>{session.subject}</dd></div>
          <div><dt>Request ID</dt><dd><code>{correlationId}</code></dd></div>
        </dl>
      </details>
    </section>
  );
}

function businessAction(value: string) {
  const labels: Record<string, string> = {
    read: "view this Booking workspace",
    create: "create this record",
    update: "change this record",
    approve: "approve this record"
  };
  return labels[value] ?? "complete this action";
}

function businessResource(value: string) {
  const labels: Record<string, string> = {
    booking: "Bookings",
    "reference-data": "Reference Data",
    "charge-agreement": "Service Contracts & Rates"
  };
  return labels[value] ?? "the requested workspace";
}
