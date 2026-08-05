import { Card } from "@erp/ui";

export default function ChargeNotFound() {
  return (
    <main className="rates-page charge-route-state">
      <Card>
        <h1 className="rates-title">Charge route not found</h1>
        <p>The requested charge record or route is not available.</p>
        <a
          className="rates-link charge-route-action"
          data-testid="charge-not-found-return"
          href="/charge-agreements/"
        >
          Return to catalogue
        </a>
      </Card>
    </main>
  );
}
