import { Card } from "@erp/ui";

export function ChargeDeniedState({ reference }: { reference?: string }) {
  const safeReference = reference && /^[A-Za-z0-9_-]{1,64}$/.test(reference)
    ? reference
    : undefined;

  return (
    <main className="rates-page charge-route-state" data-testid="charge-access-denied">
      <Card>
        <h1 className="rates-title">Access denied</h1>
        <p>Your current role does not permit this charge operation.</p>
        {safeReference ? <p className="rates-muted">Reference: {safeReference}</p> : null}
        <a
          className="rates-link charge-route-action"
          data-testid="charge-denied-return"
          href="/charge-agreements/"
        >
          Return to catalogue
        </a>
      </Card>
    </main>
  );
}
