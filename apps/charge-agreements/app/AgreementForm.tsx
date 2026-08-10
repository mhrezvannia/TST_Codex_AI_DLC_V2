"use client";

import { Button, Combobox, Dialog, Field, Input, Skeleton } from "@erp/ui";
import { useEffect, useRef, useState } from "react";
import { createAgreement, createAgreementSuccessor, updateAgreement } from "../lib/agreement-client";
import { agreementAppPath, agreementFormSchema, type AgreementDetail, type AgreementForm } from "../lib/agreements";

const empty: AgreementForm = {
  agreementNumber: "",
  commercial: {
    customerId: "",
    tradeLaneId: "",
    originLocationId: "",
    destinationLocationId: "",
    equipmentTypeId: "",
    validFrom: "",
    validTo: "",
    baseRateVersionId: "",
    surchargeRateVersionId: "",
    localRateVersionId: ""
  },
  reason: ""
};

const commercialFields: Array<[keyof AgreementForm["commercial"], string, string]> = [
  ["customerId", "Customer ID", "text"],
  ["tradeLaneId", "Trade lane ID", "text"],
  ["originLocationId", "Origin location ID", "text"],
  ["destinationLocationId", "Destination location ID", "text"],
  ["equipmentTypeId", "Equipment type ID", "text"],
  ["validFrom", "Valid from", "date"],
  ["validTo", "Valid to", "date"],
  ["baseRateVersionId", "Base / OFR RateVersion ID", "text"],
  ["surchargeRateVersionId", "Surcharge / BAF RateVersion ID", "text"],
  ["localRateVersionId", "Local / THC RateVersion ID", "text"]
];

export function AgreementFormEditor({
  detail,
  mode = "create"
}: {
  detail?: AgreementDetail;
  mode?: "create" | "edit" | "successor";
}) {
  const selected = detail?.selectedVersion;
  const [form, setForm] = useState<AgreementForm>(selected ? {
    agreementNumber: detail!.agreementNumber,
    commercial: {
      customerId: selected.customerId,
      tradeLaneId: selected.tradeLaneId,
      originLocationId: selected.originLocationId ?? "",
      destinationLocationId: selected.destinationLocationId ?? "",
      equipmentTypeId: selected.equipmentTypeId ?? "",
      validFrom: selected.validFrom,
      validTo: selected.validTo,
      baseRateVersionId: selected.rateLinks.find((link) => link.category === "BASE")?.rateVersionId ?? "",
      surchargeRateVersionId: selected.rateLinks.find((link) => link.category === "SURCHARGE")?.rateVersionId ?? "",
      localRateVersionId: selected.rateLinks.find((link) => link.category === "LOCAL")?.rateVersionId ?? ""
    },
    reason: ""
  } : empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [referenceState, setReferenceState] = useState<{
    loading: boolean;
    error: string;
    options: Array<{ value: string; label: string }>;
  }>({ loading: true, error: "", options: [] });
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const fieldErrors = Object.entries(errors).filter(([path]) => path !== "_form");

  useEffect(() => {
    if (Object.keys(errors).length > 0) errorSummaryRef.current?.focus();
  }, [errors]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty || saving) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, saving]);

  useEffect(() => { void loadCustomerReferences(); }, []);

  async function loadCustomerReferences() {
    setReferenceState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(agreementAppPath("/api/reference-options?domain=agreements&kind=customer"), { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(payload?.options)) {
        throw new Error(typeof payload?.message === "string" ? payload.message : "Reference options are unavailable");
      }
      setReferenceState({ loading: false, error: "", options: payload.options.map((option: { id: string; label: string }) => ({
        value: option.id,
        label: option.label
      })) });
    } catch (reason) {
      setReferenceState({ loading: false, error: reason instanceof Error ? reason.message : "Reference options are unavailable", options: [] });
    }
  }

  function setCommercial(field: keyof AgreementForm["commercial"], value: string) {
    setDirty(true);
    setForm({ ...form, commercial: { ...form.commercial, [field]: value } });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = agreementFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])
      ));
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      const saved = mode === "edit" && detail && selected
        ? await updateAgreement(detail, selected, parsed.data)
        : mode === "successor" && detail && selected
          ? await createAgreementSuccessor(detail, selected, parsed.data)
          : await createAgreement(parsed.data);
      window.location.assign(agreementAppPath(`/agreements/${encodeURIComponent(saved.agreementId)}`));
    } catch (reason) {
      const value = reason as { message?: string; fields?: Record<string, string> };
      setErrors({
        _form: value.message ?? "Agreement could not be saved",
        ...normalizeServiceFieldErrors(value.fields ?? {})
      });
    } finally {
      setSaving(false);
    }
  }

  function focusField(event: React.MouseEvent<HTMLAnchorElement>, fieldPath: string) {
    const fieldId = formFieldId(fieldPath);
    if (!fieldId) return;
    event.preventDefault();
    document.getElementById(fieldId)?.focus();
  }

  const agreementNumberError = errors.agreementNumber;
  const reasonError = errors.reason;

  return <form onSubmit={submit} className="rates-form-grid" data-testid="agreement-form">
    {Object.keys(errors).length > 0 ? <div
      className="rates-error-summary"
      role="alert"
      aria-labelledby="agreement-form-error-title"
      tabIndex={-1}
      ref={errorSummaryRef}
      data-testid="agreement-form-error"
    >
      <h2 id="agreement-form-error-title">Agreement could not be saved</h2>
      {errors._form ? <p>{errors._form}</p> : null}
      {fieldErrors.length > 0 ? <ul>{fieldErrors.map(([fieldPath, message]) => {
        const fieldId = formFieldId(fieldPath);
        return <li key={fieldPath}>{fieldId
          ? <a href={`#${fieldId}`} onClick={(event) => focusField(event, fieldPath)}>
            {formFieldLabel(fieldPath)}: {message}
          </a>
          : <span>{fieldPath}: {message}</span>}</li>;
      })}</ul> : null}
    </div> : null}

    <div className="rates-form-field" aria-live="polite" data-testid="agreement-reference-status">
      {referenceState.loading ? <><span>Loading customer references…</span><Skeleton height={40} /></> : referenceState.error ? (
        <div role="alert"><span>{referenceState.error}</span><Button type="button" onClick={() => void loadCustomerReferences()}>Retry references</Button></div>
      ) : (
        <Field label="Customer reference lookup" htmlFor="agreement-customer-reference">
          <Combobox id="agreement-customer-reference" options={referenceState.options}
            aria-label="Customer reference lookup"
            value={form.commercial.customerId} onChange={(value) => setCommercial("customerId", value)}
            placeholder="Search active customers" emptyLabel="No active customers match" />
        </Field>
      )}
    </div>

    <div className="rates-form-field">
      <Field label="Agreement number" htmlFor="agreement-number">
        <Input
          id="agreement-number"
          disabled={mode !== "create"}
          value={form.agreementNumber}
          onChange={(event) => { setDirty(true); setForm({ ...form, agreementNumber: event.target.value }); }}
          invalid={Boolean(agreementNumberError)}
          aria-describedby={agreementNumberError ? "agreement-number-error" : undefined}
        />
      </Field>
      {agreementNumberError ? <small id="agreement-number-error">{agreementNumberError}</small> : null}
    </div>

    {commercialFields.map(([field, label, type]) => {
      const fieldPath = `commercial.${field}`;
      const fieldError = errors[fieldPath];
      const inputId = `agreement-${field}`;
      const errorId = `${inputId}-error`;
      return <div className="rates-form-field" key={field}>
        <Field label={label} htmlFor={inputId}>
          <Input
            id={inputId}
            type={type}
            value={form.commercial[field]}
            onChange={(event) => setCommercial(field, event.target.value)}
            invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? errorId : undefined}
          />
        </Field>
        {fieldError ? <small id={errorId}>{fieldError}</small> : null}
      </div>;
    })}

    <div className="rates-form-field">
      <Field label="Reason" htmlFor="agreement-reason">
        <Input
          id="agreement-reason"
          value={form.reason}
        onChange={(event) => { setDirty(true); setForm({ ...form, reason: event.target.value }); }}
          invalid={Boolean(reasonError)}
          aria-describedby={reasonError ? "agreement-reason-error" : undefined}
        />
      </Field>
      {reasonError ? <small id="agreement-reason-error">{reasonError}</small> : null}
    </div>

    <div className="rates-actions">
      <Button variant="primary" type="submit" disabled={saving} data-testid="save-agreement">
        {saving ? "Saving…" : "Save Draft"}
      </Button>
      <Button type="button" onClick={() => dirty ? setDiscardOpen(true) : window.location.assign(agreementAppPath("/"))}>
        Cancel
      </Button>
    </div>
    <Dialog open={discardOpen} title="Discard unsaved changes?" onClose={() => setDiscardOpen(false)} actions={<>
      <Button type="button" onClick={() => setDiscardOpen(false)}>Keep editing</Button>
      <Button type="button" variant="primary" onClick={() => window.location.assign(agreementAppPath("/"))}>Discard changes</Button>
    </>}>
      <p>Your entered agreement values have not been saved.</p>
    </Dialog>
  </form>;
}

function normalizeServiceFieldErrors(fields: Record<string, string>): Record<string, string> {
  const commercialFieldNames = new Set<string>(commercialFields.map(([field]) => field));
  return Object.fromEntries(Object.entries(fields).map(([path, message]) => [
    commercialFieldNames.has(path) ? `commercial.${path}` : path,
    message
  ]));
}

function formFieldId(path: string): string | undefined {
  if (path === "agreementNumber") return "agreement-number";
  if (path === "reason") return "agreement-reason";
  if (!path.startsWith("commercial.")) return undefined;
  const field = path.slice("commercial.".length);
  return commercialFields.some(([candidate]) => candidate === field)
    ? `agreement-${field}`
    : undefined;
}

function formFieldLabel(path: string): string {
  if (path === "agreementNumber") return "Agreement number";
  if (path === "reason") return "Reason";
  const field = path.startsWith("commercial.") ? path.slice("commercial.".length) : path;
  return commercialFields.find(([candidate]) => candidate === field)?.[1] ?? path;
}
