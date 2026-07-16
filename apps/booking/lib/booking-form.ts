export type BookingDraftFields = {
  customerId: string;
  loadUnLocode: string;
  dischargeUnLocode: string;
  voyageId: string;
  equipmentTypeCode: string;
  equipmentId: string;
  commodityCode: string;
};

export function validateDraft(fields: BookingDraftFields) {
  const errors: Partial<Record<keyof BookingDraftFields, string>> = {};
  for (const [key, value] of Object.entries(fields) as Array<[keyof BookingDraftFields, string]>) {
    if (!value.trim()) errors[key] = "Required";
  }
  if (fields.loadUnLocode && !/^[A-Za-z]{2}[A-Za-z0-9]{3}$/.test(fields.loadUnLocode)) {
    errors.loadUnLocode = "Use a five-character UN/LOCODE";
  }
  if (fields.dischargeUnLocode && !/^[A-Za-z]{2}[A-Za-z0-9]{3}$/.test(fields.dischargeUnLocode)) {
    errors.dischargeUnLocode = "Use a five-character UN/LOCODE";
  }
  if (fields.loadUnLocode.toUpperCase() === fields.dischargeUnLocode.toUpperCase()) {
    errors.dischargeUnLocode = "Discharge must differ from load";
  }
  if (fields.equipmentId && !/^[A-Za-z]{3}[UJZujz][0-9]{7}$/.test(fields.equipmentId)) {
    errors.equipmentId = "Use an ISO 6346 equipment identifier";
  }
  return errors;
}

const serverFieldMap: Record<string, keyof BookingDraftFields> = {
  customerId: "customerId",
  routing: "loadUnLocode",
  "routing[0].loadUnLocode": "loadUnLocode",
  "routing[0].dischargeUnLocode": "dischargeUnLocode",
  "routing[0].voyageId": "voyageId",
  "equipment[0].equipmentTypeCode": "equipmentTypeCode",
  equipment: "equipmentTypeCode",
  "equipment[0].quantity": "equipmentTypeCode",
  "equipment[0].equipmentId": "equipmentId",
  "attributes.commodityCode": "commodityCode"
};

export function mapServerFields(fields: unknown, message: unknown) {
  const mapped: Partial<Record<keyof BookingDraftFields, string>> = {};
  if (!Array.isArray(fields)) return mapped;
  const safeMessage = typeof message === "string" && message ? message : "Check this value";
  for (const field of fields) {
    if (typeof field === "string" && serverFieldMap[field]) {
      mapped[serverFieldMap[field]] = safeMessage;
    }
  }
  return mapped;
}
