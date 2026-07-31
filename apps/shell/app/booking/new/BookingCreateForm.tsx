"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  mapBookingServerFields,
  validateBookingDraft,
  type BookingDraftFields
} from "@erp/shared-types";
import { Button, Card, Field, Input, StatusStrip } from "@erp/ui";

const initial: BookingDraftFields = {
  customerId: "",
  loadUnLocode: "",
  dischargeUnLocode: "",
  voyageId: "",
  equipmentTypeCode: "",
  equipmentId: "",
  commodityCode: ""
};

type ReferenceOption = { id: string; code: string; displayName: string; version: number; attributes: Record<string, string> };
type OptionKey = "customers" | "locations" | "voyages" | "equipment";
type SubmitState = "idle" | "pending" | "validationBlocked" | "recoverableError" | "denied" | "fatalError";

export function BookingCreateForm() {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [errors, setErrors] = useState<Partial<Record<keyof BookingDraftFields | "form", string>>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const summaryRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<Record<OptionKey, ReferenceOption[]>>({ customers: [], locations: [], voyages: [], equipment: [] });
  const [optionError, setOptionError] = useState(false);

  useEffect(() => {
    let active = true;
    const sets: Array<[OptionKey, string]> = [["customers", "PARTY_CUSTOMER"], ["locations", "LOCATION"], ["voyages", "VESSEL_VOYAGE"], ["equipment", "EQUIPMENT_TYPE"]];
    Promise.all(sets.map(async ([key, set]) => {
      const response = await fetch(`/api/booking/reference-options?set=${set}`, { cache: "no-store" });
      if (!response.ok) throw new Error("reference options unavailable");
      return [key, await response.json()] as const;
    })).then((entries) => {
      if (active) setOptions(Object.fromEntries(entries) as Record<OptionKey, ReferenceOption[]>);
    }).catch(() => { if (active) setOptionError(true); });
    return () => { active = false; };
  }, []);

  function change(name: keyof BookingDraftFields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
    setSubmitState("idle");
    setIdempotencyKey(crypto.randomUUID());
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await performSubmit();
  }

  async function performSubmit() {
    if (submitState === "pending") return;
    const nextErrors = validateBookingDraft(fields);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSubmitState("validationBlocked");
      focusErrors();
      return;
    }
    setSubmitState("pending");
    setErrors({});
    try {
      const response = await fetch("/api/booking/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": idempotencyKey },
        body: JSON.stringify({
          customerId: fields.customerId,
          routing: [{ legSequence: 1, loadUnLocode: fields.loadUnLocode, dischargeUnLocode: fields.dischargeUnLocode, voyageId: fields.voyageId }],
          equipment: [{ equipmentTypeCode: fields.equipmentTypeCode, quantity: 1, equipmentId: fields.equipmentId }],
          currency: "USD",
          cargoMode: "FCL_DRY",
          reefer: false,
          dangerousGoods: false,
          attributes: { commodityCode: fields.commodityCode }
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fieldErrors = mapBookingServerFields(payload.fields, payload.message);
        const nextState: SubmitState = response.status === 400 || response.status === 422
          ? "validationBlocked"
          : response.status === 401 || response.status === 403
            ? "denied"
            : response.status === 408 || response.status === 429 || response.status >= 500
              ? "recoverableError"
              : "fatalError";
        setSubmitState(nextState);
        setErrors(Object.keys(fieldErrors).length
          ? fieldErrors
          : { form: typeof payload.message === "string" ? payload.message : "Booking could not be created" });
        focusErrors();
        return;
      }
      if (typeof payload.id !== "string" || !payload.id) {
        setSubmitState("fatalError");
        setErrors({ form: "Booking returned without an identifier. Return to Booking and verify before trying again." });
        focusErrors();
        return;
      }
      router.push(`/booking/${payload.id}?created=1`);
    } catch {
      setSubmitState("recoverableError");
      setErrors({ form: "Booking is temporarily unreachable. Your entries are retained and retry is safe." });
      focusErrors();
    } finally {
      setSubmitState((current) => current === "pending" ? "idle" : current);
    }
  }

  function focusErrors() {
    setTimeout(() => summaryRef.current?.focus(), 0);
  }

  function selectVoyage(value: string) {
    change("voyageId", value);
    const voyage = options.voyages.find((option) => option.id === value || option.code === value);
    if (!voyage) return;
    const load = options.locations.find((option) => option.id === voyage.attributes.originLocationId)?.code;
    const discharge = options.locations.find((option) => option.id === voyage.attributes.destinationLocationId)?.code;
    setFields((current) => ({
      ...current,
      loadUnLocode: current.loadUnLocode || load || "",
      dischargeUnLocode: current.dischargeUnLocode || discharge || ""
    }));
  }

  const fieldErrors = Object.entries(errors).filter(([name, message]) => name !== "form" && message);
  const field = (
    name: keyof BookingDraftFields,
    label: string,
    hint?: string,
    choices?: Array<{ value: string; label: string }>,
    onValue?: (value: string) => void
  ) => (
    <Field label={label} hint={hint} error={errors[name]} htmlFor={`booking-${name}`} hintId={`${name}-hint`} errorId={`${name}-error`}>
      <Input
        id={`booking-${name}`}
        data-testid={`booking-${name}`}
        list={choices ? `booking-${name}-options` : undefined}
        value={fields[name]}
        onChange={(event) => (onValue ?? ((value) => change(name, value)))(event.target.value)}
        invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : hint ? `${name}-hint` : undefined}
      />
      {choices && <datalist id={`booking-${name}-options`}>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</datalist>}
    </Field>
  );

  return (
    <form className="shell-booking-form" data-state={submitState} aria-live="polite" onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && (
        <StatusStrip ref={summaryRef} id="booking-errors" tone="danger" role="alert" live="assertive" tabIndex={-1} data-state={submitState === "idle" ? "validationBlocked" : submitState}>
          <strong>Booking not created</strong>
          {errors.form && <p>{errors.form}</p>}
          {fieldErrors.length > 0 && <ul>{fieldErrors.map(([name, message]) => <li key={name}><a href={`#booking-${name}`}>{message}</a></li>)}</ul>}
          {submitState === "recoverableError" ? <Button size="sm" type="button" onClick={() => performSubmit()} data-testid="booking-create-retry">Retry create</Button> : null}
          {submitState === "denied" || submitState === "fatalError" ? <p><a href="/booking">Return safely to Booking</a></p> : null}
        </StatusStrip>
      )}
      {optionError && <StatusStrip tone="warning" role="status" data-state="degraded">Reference choices unavailable. Enter known values or retry by reloading this page.</StatusStrip>}
      <fieldset>
        <legend>Customer and routing</legend>
        {field("customerId", "Customer", undefined, options.customers.map((option) => ({ value: option.id, label: `${option.code} - ${option.displayName}` })))}
        {field("loadUnLocode", "Load UN/LOCODE", "Example: USNYC", options.locations.map((option) => ({ value: option.code, label: option.displayName })))}
        {field("dischargeUnLocode", "Discharge UN/LOCODE", "Example: NLRTM", options.locations.map((option) => ({ value: option.code, label: option.displayName })))}
        {field("voyageId", "Voyage", undefined, options.voyages.filter((option) => option.attributes.recordType === "VOYAGE").map((option) => ({ value: option.id, label: `${option.code} - ${option.displayName}` })), selectVoyage)}
      </fieldset>
      <fieldset>
        <legend>Equipment and cargo</legend>
        {field("equipmentTypeCode", "Equipment type code", "Example: 45G1", options.equipment.map((option) => ({ value: option.code, label: option.displayName })))}
        {field("equipmentId", "Equipment ID", "ISO 6346 including check digit")}
        {field("commodityCode", "Commodity code")}
      </fieldset>
      <div className="shell-grid">
        <Card><dl><dt>Currency</dt><dd>USD</dd></dl></Card>
        <Card><dl><dt>Cargo mode</dt><dd>FCL dry</dd></dl></Card>
        <Card><dl><dt>Dangerous goods</dt><dd>No</dd></dl></Card>
      </div>
      <div className="sr-only" aria-live="polite">{submitState === "pending" ? "Creating booking draft" : ""}</div>
      <div className="shell-actions">
        <a className="erp-btn" href="/booking" data-testid="booking-cancel">Cancel</a>
        <Button data-testid="booking-submit" variant="primary" disabled={submitState === "pending"} aria-busy={submitState === "pending"} type="submit">
          {submitState === "pending" ? "Creating..." : "Create draft"}
        </Button>
      </div>
    </form>
  );
}
