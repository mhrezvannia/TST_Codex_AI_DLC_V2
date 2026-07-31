"use client";

import { Button, Field, Input, Select, StatusStrip } from "@erp/ui";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { RateClientError, saveRateDraft } from "../../lib/rate-client";
import { rateAppPath, rateFormSchema, type RateDetail, type RateForm } from "../../lib/rates";

type Props = {
  initialDetail?: RateDetail;
  onSaved?: (detail: RateDetail) => void;
};

const blank: RateForm = {
  category: "BASE",
  chargeCodeId: "charge-code-ofr",
  chargeCode: "OFR",
  unitRate: "0.00",
  currencyId: "currency-usd",
  currency: "USD",
  effectiveFrom: "",
  effectiveTo: "",
  originLocationId: "",
  destinationLocationId: "",
  equipmentTypeId: ""
};

export function RateFormEditor({ initialDetail, onSaved }: Props) {
  const draft = initialDetail?.versions.find((version) => version.lifecycle === "DRAFT");
  const [form, setForm] = useState<RateForm>(() => draft ? {
    category: initialDetail!.category,
    chargeCodeId: initialDetail!.chargeCodeId,
    chargeCode: initialDetail!.chargeCode,
    unitRate: draft.unitRate,
    currencyId: draft.currencyId,
    currency: "USD",
    effectiveFrom: draft.effectiveFrom,
    effectiveTo: draft.effectiveTo,
    originLocationId: draft.originLocationId,
    destinationLocationId: draft.destinationLocationId,
    equipmentTypeId: draft.equipmentTypeId
  } : blank);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const editing = Boolean(initialDetail);
  const expectedCode = useMemo(() => ({
    BASE: "OFR" as const,
    SURCHARGE: "BAF" as const,
    LOCAL: "THC" as const
  })[form.category], [form.category]);

  function update<K extends keyof RateForm>(key: K, value: RateForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changeCategory(category: RateForm["category"]) {
    const code = { BASE: "OFR" as const, SURCHARGE: "BAF" as const, LOCAL: "THC" as const }[category];
    setForm((current) => ({
      ...current,
      category,
      chargeCode: code,
      chargeCodeId: `charge-code-${code.toLowerCase()}`,
      destinationLocationId: category === "LOCAL" ? null : (current.destinationLocationId ?? "")
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setStatus("");
    const parsed = rateFormSchema.safeParse(form);
    if (!parsed.success) {
      const errors = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
      setFieldErrors(errors);
      queueMicrotask(() => errorSummary.current?.focus());
      return;
    }
    setFieldErrors({});
    setPending(true);
    try {
      const detail = await saveRateDraft({ detail: initialDetail, draft, form: parsed.data });
      setStatus(editing ? "Draft changes saved." : "Rate Draft created.");
      onSaved?.(detail);
      if (!editing && typeof window !== "undefined") {
        window.location.assign(rateAppPath(`/rates/${encodeURIComponent(detail.rateId)}`));
      }
    } catch (reason) {
      if (reason instanceof RateClientError) {
        setFieldErrors(reason.fields);
        setStatus(reason.message);
      } else {
        setStatus("Rate service is unavailable. Entered values have been preserved.");
      }
      queueMicrotask(() => errorSummary.current?.focus());
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      {Object.keys(fieldErrors).length > 0 || (status && !status.includes("saved") && !status.includes("created")) ? (
        <div className="rates-error-summary" role="alert" tabIndex={-1} ref={errorSummary}
          data-testid="rate-form-error-summary">
          <strong>Review the Rate form</strong>
          {status ? <p>{status}</p> : null}
          <ul>{Object.entries(fieldErrors).map(([field, message]) => <li key={field}><a href={`#rate-${field}`}>{message}</a></li>)}</ul>
        </div>
      ) : null}

      <div className="rates-status-region" aria-live="polite" data-testid="rate-form-status">
        {pending ? "Saving Rate Draft…" : status}
      </div>

      <div className="rates-form-grid">
        <fieldset className="rates-form-group">
          <legend>Authority classification</legend>
          <Field label="Category" htmlFor="rate-category" error={fieldErrors.category}>
            <Select id="rate-category" data-testid="rate-category" value={form.category}
              disabled={editing} invalid={Boolean(fieldErrors.category)}
              onChange={(event) => changeCategory(event.target.value as RateForm["category"])}>
              <option value="BASE">Base / OFR</option>
              <option value="SURCHARGE">Surcharge / BAF</option>
              <option value="LOCAL">Local / THC</option>
            </Select>
          </Field>
          <Field label="Charge code reference" htmlFor="rate-chargeCodeId" error={fieldErrors.chargeCodeId}>
            <Input id="rate-chargeCodeId" value={form.chargeCodeId} disabled={editing}
              invalid={Boolean(fieldErrors.chargeCodeId)}
              onChange={(event) => update("chargeCodeId", event.target.value)} />
          </Field>
          <Field label="Charge code" htmlFor="rate-chargeCode" hint={`${form.category} requires ${expectedCode}`}
            error={fieldErrors.chargeCode}>
            <Input id="rate-chargeCode" value={form.chargeCode} readOnly />
          </Field>
        </fieldset>

        <fieldset className="rates-form-group">
          <legend>Commercial value and validity</legend>
          <Field label="Unit rate (USD)" htmlFor="rate-unitRate" error={fieldErrors.unitRate}>
            <Input id="rate-unitRate" data-testid="rate-unit-rate" inputMode="decimal" value={form.unitRate}
              invalid={Boolean(fieldErrors.unitRate)} onChange={(event) => update("unitRate", event.target.value)} />
          </Field>
          <Field label="Currency reference" htmlFor="rate-currencyId" error={fieldErrors.currencyId}>
            <Input id="rate-currencyId" value={form.currencyId} invalid={Boolean(fieldErrors.currencyId)}
              onChange={(event) => update("currencyId", event.target.value)} />
          </Field>
          <Field label="Effective from" htmlFor="rate-effectiveFrom" error={fieldErrors.effectiveFrom}>
            <Input id="rate-effectiveFrom" type="date" value={form.effectiveFrom}
              invalid={Boolean(fieldErrors.effectiveFrom)}
              onChange={(event) => update("effectiveFrom", event.target.value)} />
          </Field>
          <Field label="Effective to" htmlFor="rate-effectiveTo" error={fieldErrors.effectiveTo}>
            <Input id="rate-effectiveTo" type="date" value={form.effectiveTo}
              invalid={Boolean(fieldErrors.effectiveTo)}
              onChange={(event) => update("effectiveTo", event.target.value)} />
          </Field>
        </fieldset>

        <fieldset className="rates-form-group">
          <legend>Applicability</legend>
          <Field label="Origin location" htmlFor="rate-originLocationId" error={fieldErrors.originLocationId}>
            <Input id="rate-originLocationId" value={form.originLocationId}
              invalid={Boolean(fieldErrors.originLocationId)}
              onChange={(event) => update("originLocationId", event.target.value)} />
          </Field>
          {form.category !== "LOCAL" ? (
            <Field label="Destination location" htmlFor="rate-destinationLocationId"
              error={fieldErrors.destinationLocationId}>
              <Input id="rate-destinationLocationId" value={form.destinationLocationId ?? ""}
                invalid={Boolean(fieldErrors.destinationLocationId)}
                onChange={(event) => update("destinationLocationId", event.target.value)} />
            </Field>
          ) : <p className="rates-muted">Local THC authority has no destination.</p>}
          <Field label="Equipment type" htmlFor="rate-equipmentTypeId" error={fieldErrors.equipmentTypeId}>
            <Input id="rate-equipmentTypeId" value={form.equipmentTypeId}
              invalid={Boolean(fieldErrors.equipmentTypeId)}
              onChange={(event) => update("equipmentTypeId", event.target.value)} />
          </Field>
        </fieldset>
      </div>

      <div className="rates-actions">
        <Button type="submit" variant="primary" disabled={pending} data-testid="save-rate">
          {pending ? "Saving…" : editing ? "Save Draft changes" : "Create Rate Draft"}
        </Button>
        <a className="rates-link"
          href={editing ? rateAppPath(`/rates/${initialDetail!.rateId}`) : rateAppPath("/rates")}>Cancel</a>
      </div>
      <StatusStrip>Approved versions are immutable. Changes after approval require a successor Draft.</StatusStrip>
    </form>
  );
}
