"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  mapBookingServerFields,
  validateBookingDraft,
  type BookingDraftFields
} from "@erp/shared-types";

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

export function BookingCreateForm() {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [errors, setErrors] = useState<Partial<Record<keyof BookingDraftFields | "form", string>>>({});
  const [busy, setBusy] = useState(false);
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
    setIdempotencyKey(crypto.randomUUID());
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateBookingDraft(fields);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusErrors();
      return;
    }
    setBusy(true);
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
    setBusy(false);
    if (!response.ok) {
      const fieldErrors = mapBookingServerFields(payload.fields, payload.message);
      setErrors(Object.keys(fieldErrors).length
        ? fieldErrors
        : { form: payload.message ?? "Booking could not be created" });
      focusErrors();
      return;
    }
    router.push(`/booking/${payload.id}?created=1`);
  }

  function focusErrors() {
    setTimeout(() => document.getElementById("booking-errors")?.focus(), 0);
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
    <label>
      {label}
      <input
        id={`booking-${name}`}
        data-testid={`booking-${name}`}
        list={choices ? `booking-${name}-options` : undefined}
        value={fields[name]}
        onChange={(event) => (onValue ?? ((value) => change(name, value)))(event.target.value)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {choices && <datalist id={`booking-${name}-options`}>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</datalist>}
      {hint && <small>{hint}</small>}
      {errors[name] && <span id={`${name}-error`} className="shell-error">{errors[name]}</span>}
    </label>
  );

  return (
    <form className="shell-booking-form" onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && (
        <div id="booking-errors" className="shell-state shell-error" tabIndex={-1}>
          <strong>Booking not created</strong>
          {errors.form && <p>{errors.form}</p>}
          {fieldErrors.length > 0 && <ul>{fieldErrors.map(([name, message]) => <li key={name}><a href={`#booking-${name}`}>{message}</a></li>)}</ul>}
        </div>
      )}
      {optionError && <p className="shell-error" role="status">Reference choices unavailable</p>}
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
      <dl className="shell-grid">
        <div className="shell-panel"><dt>Currency</dt><dd>USD</dd></div>
        <div className="shell-panel"><dt>Cargo mode</dt><dd>FCL dry</dd></div>
        <div className="shell-panel"><dt>Dangerous goods</dt><dd>No</dd></div>
      </dl>
      <div className="shell-actions">
        <a className="shell-button" href="/booking" data-testid="booking-cancel">Cancel</a>
        <button data-testid="booking-submit" className="shell-button shell-button-primary" disabled={busy} type="submit">
          {busy ? "Creating..." : "Create draft"}
        </button>
      </div>
    </form>
  );
}
