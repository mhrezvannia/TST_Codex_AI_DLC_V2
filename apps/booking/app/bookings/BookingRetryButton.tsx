"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@erp/ui";

export function BookingRetryButton({ href }: { href: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      variant="primary"
      busy={busy}
      busyLabel="Retrying"
      onClick={() => {
        if (busy) return;
        setBusy(true);
        router.replace(href);
        router.refresh();
      }}
    >
      Retry
    </Button>
  );
}
