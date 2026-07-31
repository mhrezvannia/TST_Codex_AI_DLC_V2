"use client";

import { Button, Card, Skeleton, StatusBadge, Table } from "@erp/ui";
import { useCallback, useEffect, useState } from "react";
import { executeAgreementAction, getAgreement } from "../lib/agreement-client";
import { agreementAppPath, type AgreementDetail } from "../lib/agreements";
import {
  AgreementLifecycleDialog,
  type AgreementLifecycleAction
} from "./AgreementLifecycleDialog";

export function AgreementDetailView({ agreementId }: { agreementId: string }) {
  const [detail, setDetail] = useState<AgreementDetail | null>(null);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [dialogAction, setDialogAction] = useState<AgreementLifecycleAction | null>(null);
  const [dialogTrigger, setDialogTrigger] = useState<HTMLElement | null>(null);
  const load = useCallback(async () => {
    setError("");
    try { setDetail(await getAgreement(agreementId)); } catch (value) { setError(value instanceof Error ? value.message : "Agreement could not be loaded"); }
  }, [agreementId]);
  useEffect(() => { void load(); }, [load]);
  function openAction(kind: AgreementLifecycleAction, trigger: HTMLElement) {
    setDialogTrigger(trigger);
    setDialogAction(kind);
  }
  async function confirmAction(reason: string) {
    if (!detail?.selectedVersion || !dialogAction) {
      throw new Error("The selected Agreement version is unavailable.");
    }
    const updated = await executeAgreementAction(
      dialogAction,
      detail,
      detail.selectedVersion,
      reason
    );
    setDetail(updated);
    setAnnouncement(`${updated.agreementNumber} ${dialogAction} command completed.`);
  }
  if (!detail && !error) return <main className="rates-page"><Card><Skeleton height={260} /></Card></main>;
  if (!detail) return <main className="rates-page"><Card title="Agreement unavailable"><p role="alert">{error}</p><Button onClick={() => void load()}>Retry</Button></Card></main>;
  const version = detail.selectedVersion;
  return <main className="rates-page">
    <header className="rates-page-header"><div><p className="rates-eyebrow">Agreement authority / detail</p><h1 className="rates-title">{detail.agreementNumber}</h1><p className="rates-muted">{detail.agreementId} / {detail.authorityModel}{detail.readOnly ? " / read-only" : ""}</p></div><div className="rates-actions">{detail.capabilities.canUpdate && version?.lifecycle === "DRAFT" ? <a className="rates-link" href={agreementAppPath(`/agreements/${encodeURIComponent(detail.agreementId)}/edit`)}>Edit Draft</a> : null}{detail.capabilities.canCreateSuccessor && version?.lifecycle === "APPROVED" ? <a className="rates-link" href={agreementAppPath(`/agreements/${encodeURIComponent(detail.agreementId)}/successor`)}>Create successor</a> : null}</div></header>
    {error ? <div className="rates-error-summary" role="alert">{error}</div> : null}
    <p className="rates-status-region" role="status" aria-live="polite">{announcement}</p>
    {version ? <Card title={`Version ${version.versionNo}`}><dl className="rates-definition-list"><div><dt>Lifecycle</dt><dd><StatusBadge status={version.lifecycle} /></dd></div><div><dt>Version identity</dt><dd>{version.agreementVersionId}</dd></div><div><dt>Row version</dt><dd>{version.rowVersion}</dd></div><div><dt>Customer / lane</dt><dd>{version.customerId} / {version.tradeLaneId}</dd></div><div><dt>Route</dt><dd>{version.originLocationId} → {version.destinationLocationId}</dd></div><div><dt>Equipment</dt><dd>{version.equipmentTypeId}</dd></div><div><dt>Validity</dt><dd>{version.validFrom} – {version.validTo}</dd></div><div><dt>Source</dt><dd>{version.sourceAgreementVersionId ?? "Initial version"}</dd></div></dl></Card> : null}
    <Card title="RateVersion links"><div className="rates-table-region"><Table><thead><tr><th scope="col">Category</th><th scope="col">Immutable RateVersion ID</th></tr></thead><tbody>{version?.rateLinks.map((link) => <tr key={link.category}><td>{link.category}</td><td>{link.rateVersionId}</td></tr>)}</tbody></Table></div></Card>
    {!detail.readOnly && version ? <Card title="Lifecycle action"><p>Every lifecycle command requires an evidence reason and confirmation.</p><div className="rates-actions">{detail.capabilities.canApprove && version.lifecycle === "DRAFT" ? <Button onClick={(event) => openAction("approve", event.currentTarget)} data-testid="approve-agreement">Approve</Button> : null}{detail.capabilities.canSuspend && version.lifecycle === "APPROVED" ? <Button onClick={(event) => openAction("suspend", event.currentTarget)} data-testid="suspend-agreement">Suspend</Button> : null}{detail.capabilities.canExpire && version.lifecycle === "APPROVED" ? <Button onClick={(event) => openAction("expire", event.currentTarget)} data-testid="expire-agreement">Expire</Button> : null}</div></Card> : null}
    <Card title="Version history"><ol className="rates-history">{detail.versions.map((item) => <li key={item.agreementVersionId}><strong>v{item.versionNo} / {item.lifecycle}</strong><br /><small>{item.agreementVersionId} · row {item.rowVersion}</small></li>)}</ol></Card>
    <Card title="Activity evidence"><ol className="rates-history">{detail.activity.map((item) => <li key={item.activityId}><strong>{item.action}</strong> by {item.actorSubjectId}<br /><small>{item.occurredAt} · {item.correlationId}</small>{item.reason ? <p>{item.reason}</p> : null}</li>)}</ol></Card>
    {version && dialogAction ? <AgreementLifecycleDialog
      open
      action={dialogAction}
      agreementNumber={detail.agreementNumber}
      agreementId={detail.agreementId}
      versionNo={version.versionNo}
      agreementVersionId={version.agreementVersionId}
      rowVersion={version.rowVersion}
      returnFocusTo={dialogTrigger}
      onClose={() => setDialogAction(null)}
      onConfirm={confirmAction}
    /> : null}
  </main>;
}
