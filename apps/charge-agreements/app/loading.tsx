import { Card, Skeleton } from "@erp/ui";

export default function ChargeLoading() {
  return (
    <main className="rates-page charge-route-state" aria-busy="true" aria-live="polite">
      <h1 className="rates-title">Loading charge workspace</h1>
      <Card>
        <Skeleton height={260} />
      </Card>
    </main>
  );
}
