import { Card, Skeleton } from "@erp/ui";

export default function RatesLoading() {
  return (
    <main className="rates-page charge-route-state" aria-busy="true" aria-live="polite">
      <h1 className="rates-title">Loading charge rates</h1>
      <Card><Skeleton height={260} /></Card>
    </main>
  );
}
