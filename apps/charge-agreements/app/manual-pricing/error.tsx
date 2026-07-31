"use client";

import { Button, Card } from "@erp/ui";

export default function ManualPricingError({ reset }: { reset: () => void }) {
  return (
    <main className="manual-pricing-page">
      <Card title="Manual pricing evidence unavailable">
        <p>The read-only evidence service could not be loaded.</p>
        <Button onClick={reset}>Retry</Button>
      </Card>
    </main>
  );
}
