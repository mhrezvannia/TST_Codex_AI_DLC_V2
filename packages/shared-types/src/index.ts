export type CorrelationCarrier = {
  correlationId: string;
};

export type BookingDraftFields = {
  customerId: string;
  loadUnLocode: string;
  dischargeUnLocode: string;
  voyageId: string;
  requestedDepartureDate?: string;
  equipmentTypeCode: string;
  equipmentId: string;
  commodityCode: string;
};

export function validateBookingDraft(fields: BookingDraftFields) {
  const errors: Partial<Record<keyof BookingDraftFields, string>> = {};
  for (const [key, value] of Object.entries(fields) as Array<[keyof BookingDraftFields, string | undefined]>) {
    if (key !== "requestedDepartureDate" && !value?.trim()) errors[key] = "Required";
  }
  if (fields.loadUnLocode && !/^[A-Za-z]{2}[A-Za-z0-9]{3}$/.test(fields.loadUnLocode)) {
    errors.loadUnLocode = "Use a five-character UN/LOCODE";
  }
  if (fields.dischargeUnLocode && !/^[A-Za-z]{2}[A-Za-z0-9]{3}$/.test(fields.dischargeUnLocode)) {
    errors.dischargeUnLocode = "Use a five-character UN/LOCODE";
  }
  if (fields.requestedDepartureDate) {
    const parsedDate = new Date(`${fields.requestedDepartureDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.requestedDepartureDate)
      || Number.isNaN(parsedDate.valueOf())
      || parsedDate.toISOString().slice(0, 10) !== fields.requestedDepartureDate) {
      errors.requestedDepartureDate = "Use a valid departure date";
    }
  }
  if (fields.loadUnLocode.toUpperCase() === fields.dischargeUnLocode.toUpperCase()) {
    errors.dischargeUnLocode = "Discharge must differ from load";
  }
  if (fields.equipmentId && !isValidIso6346(fields.equipmentId)) {
    errors.equipmentId = "Use a valid ISO 6346 equipment identifier, including its check digit";
  }
  return errors;
}

export function isValidIso6346(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{3}[UJZ][0-9]{7}$/.test(normalized)) return false;
  const characters = normalized.slice(0, 10);
  const expected = Number(normalized[10]);
  const sum = Array.from(characters).reduce((total, character, index) => {
    const digit = /\d/.test(character)
      ? Number(character)
      : iso6346LetterValue(character);
    return total + digit * (2 ** index);
  }, 0);
  return (sum % 11) % 10 === expected;
}

function iso6346LetterValue(character: string) {
  const sequential = character.charCodeAt(0) - 55;
  return sequential + Math.floor((sequential - 1) / 10);
}

const bookingServerFieldMap: Record<string, keyof BookingDraftFields> = {
  customerId: "customerId",
  routing: "loadUnLocode",
  "routing[0].loadUnLocode": "loadUnLocode",
  "routing[0].dischargeUnLocode": "dischargeUnLocode",
  "routing[0].voyageId": "voyageId",
  "attributes.requestedDepartureDate": "requestedDepartureDate",
  "equipment[0].equipmentTypeCode": "equipmentTypeCode",
  equipment: "equipmentTypeCode",
  "equipment[0].quantity": "equipmentTypeCode",
  "equipment[0].equipmentId": "equipmentId",
  "attributes.commodityCode": "commodityCode"
};

export function mapBookingServerFields(fields: unknown, message: unknown) {
  const mapped: Partial<Record<keyof BookingDraftFields, string>> = {};
  if (!Array.isArray(fields)) return mapped;
  const safeMessage = typeof message === "string" && message ? message : "Check this value";
  for (const field of fields) {
    if (typeof field === "string" && bookingServerFieldMap[field]) {
      mapped[bookingServerFieldMap[field]] = safeMessage;
    }
  }
  return mapped;
}
