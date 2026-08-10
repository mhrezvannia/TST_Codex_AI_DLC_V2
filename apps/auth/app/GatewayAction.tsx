"use client";

import { useRef, useState } from "react";

export function GatewayAction({
  href,
  label,
  pendingLabel,
  dataTestId,
  variant = "primary"
}: {
  href: string;
  label: string;
  pendingLabel: string;
  dataTestId?: string;
  variant?: "primary" | "secondary";
}) {
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  return (
    <a
      aria-busy={pending}
      aria-disabled={pending}
      className={`auth-gateway__${variant}-action`}
      data-testid={dataTestId}
      href={href}
      onClick={(event) => {
        if (pendingRef.current) {
          event.preventDefault();
          return;
        }
        pendingRef.current = true;
        setPending(true);
      }}
    >
      <span aria-live="polite">{pending ? pendingLabel : label}</span>
    </a>
  );
}

export function GatewayPostAction({
  action,
  label,
  pendingLabel,
  dataTestId,
  variant = "primary"
}: {
  action: string;
  label: string;
  pendingLabel: string;
  dataTestId?: string;
  variant?: "primary" | "secondary" | "sign-out";
}) {
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  return (
    <form
      action={action}
      method="post"
      onSubmit={(event) => {
        if (pendingRef.current) {
          event.preventDefault();
          return;
        }
        pendingRef.current = true;
        setPending(true);
      }}
    >
      <button
        aria-busy={pending}
        className={`auth-gateway__${variant}-action`}
        data-testid={dataTestId}
        disabled={pending}
        type="submit"
      >
        <span aria-live="polite">{pending ? pendingLabel : label}</span>
      </button>
    </form>
  );
}
