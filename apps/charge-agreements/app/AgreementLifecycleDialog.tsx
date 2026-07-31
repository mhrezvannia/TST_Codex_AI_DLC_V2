"use client";

import { Button, Dialog } from "@erp/ui";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type AgreementLifecycleAction = "approve" | "suspend" | "expire";

type AgreementLifecycleDialogProps = {
  open: boolean;
  action: AgreementLifecycleAction;
  agreementNumber: string;
  agreementId: string;
  versionNo: number;
  agreementVersionId: string;
  rowVersion: number;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

const ACTION_COPY: Record<AgreementLifecycleAction, {
  title: string;
  command: string;
  consequence: string;
}> = {
  approve: {
    title: "Confirm Agreement approval",
    command: "Approve Agreement",
    consequence: "Approval freezes this commercial version and its three RateVersion links."
  },
  suspend: {
    title: "Confirm Agreement suspension",
    command: "Suspend Agreement",
    consequence: "Suspension removes this approved version from active authority."
  },
  expire: {
    title: "Confirm Agreement expiry",
    command: "Expire Agreement",
    consequence: "Expiry is a terminal lifecycle transition for this approved version."
  }
};

export function AgreementLifecycleDialog({
  open,
  action,
  agreementNumber,
  agreementId,
  versionNo,
  agreementVersionId,
  rowVersion,
  returnFocusTo,
  onClose,
  onConfirm
}: AgreementLifecycleDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const reasonId = useId();
  const reasonErrorId = useId();
  const copy = ACTION_COPY[action];

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError("");
    setPending(false);
    pendingRef.current = false;
    const focusReason = () => reasonRef.current?.focus();
    queueMicrotask(focusReason);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const dialog = contentRef.current?.closest<HTMLElement>('[role="dialog"]');
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog.contains(document.activeElement) || document.activeElement === dialog) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      returnFocusTo?.focus();
    };
  }, [action, open, returnFocusTo]);

  const requestClose = useCallback(() => {
    if (!pendingRef.current) onClose();
  }, [onClose]);

  async function confirm() {
    if (pendingRef.current) return;
    const evidence = reason.trim();
    if (!evidence) {
      setError("A reason is required for this lifecycle command.");
      queueMicrotask(() => errorRef.current?.focus());
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setError("");
    try {
      await onConfirm(evidence);
      onClose();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Agreement lifecycle command failed.");
      queueMicrotask(() => errorRef.current?.focus());
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return <Dialog
    open={open}
    title={copy.title}
    onClose={requestClose}
    actions={<>
      <Button type="button" onClick={requestClose} disabled={pending}>Cancel</Button>
      <Button
        type="button"
        variant="primary"
        onClick={() => void confirm()}
        disabled={pending}
        data-testid="confirm-agreement-lifecycle"
      >
        {pending ? "Applying…" : copy.command}
      </Button>
    </>}
  >
    <div ref={contentRef} data-testid="agreement-lifecycle-dialog" aria-busy={pending}>
      <p>{copy.consequence}</p>
      <dl className="rates-definition-list">
        <div><dt>Agreement</dt><dd>{agreementNumber}</dd></div>
        <div><dt>Stable identity</dt><dd>{agreementId}</dd></div>
        <div><dt>Version</dt><dd>v{versionNo} / {agreementVersionId}</dd></div>
        <div><dt>Expected row version</dt><dd>{rowVersion}</dd></div>
      </dl>
      {error ? <div
        className="rates-error-summary"
        role="alert"
        tabIndex={-1}
        ref={errorRef}
        id={reasonErrorId}
      >{error}</div> : null}
      <label htmlFor={reasonId}>Reason</label>
      <input
        ref={reasonRef}
        id={reasonId}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? reasonErrorId : undefined}
        disabled={pending}
      />
      <p role="status" aria-live="polite">
        {pending ? `${copy.command} is pending. Do not submit again.` : ""}
      </p>
    </div>
  </Dialog>;
}
