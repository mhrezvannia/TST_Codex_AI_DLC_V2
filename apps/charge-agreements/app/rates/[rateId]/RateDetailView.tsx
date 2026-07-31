"use client";

import { Button, Card, Dialog, Skeleton, StatusBadge, StatusStrip, Table } from "@erp/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { executeRateCommand, loadRateDetail } from "../../../lib/rate-client";
import { rateAppPath, type RateDetail, type RateVersion } from "../../../lib/rates";
import { RateFormEditor } from "../RateForm";

export function RateDetailView({ rateId, editMode }: { rateId: string; editMode: boolean }) {
  const [detail, setDetail] = useState<RateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const [approvalVersion, setApprovalVersion] = useState<RateVersion | null>(null);
  const approvalTrigger = useRef<HTMLElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      setDetail(await loadRateDetail(rateId));
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Rate could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [rateId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!approvalVersion) return;
    const trigger = approvalTrigger.current;
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>(".erp-dialog");
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (document.activeElement === dialog || !dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      trigger?.focus();
    };
  }, [approvalVersion]);

  async function command(kind: "approve" | "successor", version: RateVersion): Promise<boolean> {
    if (pending) return false;
    setPending(kind);
    setMessage("");
    try {
      setDetail(await executeRateCommand(kind, rateId, version));
      setMessage(kind === "approve" ? "Rate version approved." : "Successor Draft created.");
      return true;
    } catch {
      setMessage("Rate service is unavailable. No completion has been assumed.");
      return false;
    } finally {
      setPending("");
    }
  }

  function openApproval(version: RateVersion) {
    approvalTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setApprovalVersion(version);
  }

  function closeApproval() {
    if (!pending) setApprovalVersion(null);
  }

  if (loading) return <main className="rates-page"><Card><Skeleton height={280} /></Card></main>;
  if (!detail) {
    return (
      <main className="rates-page">
        <Card title="Rate could not be loaded"><p role="alert">{message}</p><Button onClick={() => void load()}>Retry</Button></Card>
      </main>
    );
  }

  const draft = detail.versions.find((version) => version.lifecycle === "DRAFT");
  const latestApproved = detail.versions.find((version) => version.lifecycle === "APPROVED");
  if (editMode && draft && detail.actions.canEdit) {
    return (
      <main className="rates-page">
        <header>
          <p className="rates-eyebrow">Rate authority / Draft edit</p>
          <h1 className="rates-title">{detail.chargeCode} · {detail.rateId}</h1>
        </header>
        <Card><RateFormEditor initialDetail={detail} onSaved={setDetail} /></Card>
      </main>
    );
  }

  return (
    <main className="rates-page">
      <header className="rates-page-header">
        <div>
          <p className="rates-eyebrow">Rate authority / detail</p>
          <h1 className="rates-title">{detail.chargeCode} · {detail.category}</h1>
          <p className="rates-muted">{detail.rateId} · evaluated as of {detail.evaluatedAsOf}</p>
        </div>
        <div className="rates-actions">
          {draft && detail.actions.canEdit ? <a className="rates-link"
            href={`${rateAppPath(`/rates/${encodeURIComponent(rateId)}`)}?mode=edit`}>Edit Draft</a> : null}
          {draft && detail.actions.canApprove ? (
            <Button variant="primary" disabled={Boolean(pending)} data-testid="approve-rate"
              onClick={() => openApproval(draft)}>Approve Draft</Button>
          ) : null}
          {!draft && latestApproved && detail.actions.canCreateSuccessor ? (
            <Button disabled={Boolean(pending)} data-testid="create-rate-successor"
              onClick={() => void command("successor", latestApproved)}>Create successor</Button>
          ) : null}
          <a className="rates-link" href={rateAppPath("/rates")}>Back to rates</a>
        </div>
      </header>

      <div className="rates-status-region" aria-live="polite" data-testid="rate-command-status">
        {pending ? `Submitting ${pending}…` : message}
      </div>

      <Dialog
        open={approvalVersion !== null}
        title="Confirm immutable Rate approval"
        onClose={closeApproval}
        actions={approvalVersion ? (
          <>
            <Button disabled={Boolean(pending)} onClick={closeApproval}>Cancel</Button>
            <Button variant="primary" disabled={Boolean(pending)} data-testid="confirm-rate-approval"
              onClick={() => void (async () => {
                if (await command("approve", approvalVersion)) setApprovalVersion(null);
              })()}>
              {pending === "approve" ? "Approving..." : "Approve version"}
            </Button>
          </>
        ) : null}
      >
        {approvalVersion ? (
          <>
            <p>Approval creates immutable commercial authority for this exact version and effective window.</p>
            <dl className="rates-definition-list" data-testid="approval-evidence">
              <div><dt>Rate / version</dt><dd>{detail.rateId} / v{approvalVersion.versionNo}</dd></div>
              <div><dt>Charge</dt><dd>{detail.chargeCode} / {detail.category}</dd></div>
              <div><dt>Amount / basis</dt><dd>{approvalVersion.unitRate} {approvalVersion.currency} / {approvalVersion.basis}</dd></div>
              <div><dt>Validity</dt><dd>{approvalVersion.effectiveFrom} to {approvalVersion.effectiveTo}</dd></div>
              <div><dt>Applicability</dt><dd>{approvalVersion.originLocationId} to {approvalVersion.destinationLocationId ?? "POL local"} / {approvalVersion.equipmentTypeId}</dd></div>
              <div><dt>Concurrency evidence</dt><dd>row {approvalVersion.rowVersion}</dd></div>
            </dl>
          </>
        ) : null}
      </Dialog>

      {!draft ? <StatusStrip>No Draft exists. Approved versions remain immutable.</StatusStrip> : null}
      {draft && !detail.actions.canEdit && !detail.actions.canApprove
        ? <StatusStrip>Read-only access: mutation actions are not available.</StatusStrip> : null}

      <Card title="Stable authority identity">
        <dl className="rates-definition-list">
          <div><dt>Rate ID</dt><dd>{detail.rateId}</dd></div>
          <div><dt>Category</dt><dd>{detail.category}</dd></div>
          <div><dt>Charge code</dt><dd>{detail.chargeCode}</dd></div>
          <div><dt>Charge code reference</dt><dd>{detail.chargeCodeId}</dd></div>
        </dl>
      </Card>

      <Card title={`Version history (${detail.versions.length})`}>
        <div className="rates-table-region" role="region" aria-label="Rate version history" tabIndex={0}>
          <Table>
            <thead><tr><th scope="col">Version</th><th scope="col">State</th><th scope="col">Amount</th>
              <th scope="col">Validity</th><th scope="col">Applicability</th><th scope="col">Evidence</th></tr></thead>
            <tbody>{detail.versions.map((version) => (
              <tr key={version.versionId} data-testid={`rate-version-${version.versionId}`}>
                <td>v{version.versionNo}<br /><small>{version.versionId}</small></td>
                <td><StatusBadge status={version.presentationState} /><br /><small>{version.lifecycle}</small></td>
                <td>{version.unitRate} {version.currency}<br /><small>{version.basis}</small></td>
                <td>{version.effectiveFrom} – {version.effectiveTo}</td>
                <td>{version.originLocationId} → {version.destinationLocationId ?? "Local"}<br />
                  <small>{version.equipmentTypeId}</small></td>
                <td>{version.approvedBy ? `Approved by ${version.approvedBy}` : `Created by ${version.createdBy}`}<br />
                  <small>row {version.rowVersion}</small></td>
              </tr>
            ))}</tbody>
          </Table>
        </div>
      </Card>

      <Card title={`Activity evidence (${detail.activities.length})`}>
        {detail.activities.length ? (
          <ol className="rates-history">
            {detail.activities.map((activity) => (
              <li key={activity.activityId}>
                <strong>{activity.action.replaceAll("_", " ")}</strong>
                <p>{activity.actorSubjectId} · {activity.occurredAt}</p>
                <small>Correlation {activity.correlationId}{activity.reason ? ` · ${activity.reason}` : ""}</small>
              </li>
            ))}
          </ol>
        ) : <p className="rates-muted">No activity evidence is available.</p>}
      </Card>
    </main>
  );
}
