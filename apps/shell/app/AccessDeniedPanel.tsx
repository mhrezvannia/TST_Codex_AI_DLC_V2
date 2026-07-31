import type { SessionSummary } from "@erp/auth";

export function AccessDeniedPanel({
  action,
  correlationId,
  message,
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
    <section className="shell-state shell-denied" data-state="denied" data-testid="shell-access-denied" aria-labelledby="shell-access-denied-title" aria-live="assertive">
      <p className="shell-eyebrow">Authorization decision</p>
      <h1 id="shell-access-denied-title">Access denied</h1>
      <p>{message}</p>
      <dl className="shell-denied-facts">
        <div><dt>Subject</dt><dd>{session.subject}</dd></div>
        <div><dt>Resource</dt><dd>{resource}</dd></div>
        <div><dt>Action</dt><dd>{action}</dd></div>
        <div><dt>Correlation</dt><dd><code>{correlationId}</code></dd></div>
      </dl>
      <div className="shell-actions">
        <a className="shell-button shell-button-primary" href={requestAccess} data-testid="shell-request-access">Request access</a>
        <a className="shell-button" href="/" data-testid="shell-denied-home">Back to shell</a>
      </div>
    </section>
  );
}
