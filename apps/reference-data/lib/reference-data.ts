import { z } from "zod";

export const referenceSetIds = [
  "PARTY_CUSTOMER",
  "LOCATION",
  "REGION",
  "VOYAGE",
  "CURRENCY",
  "CHARGE_CODE",
  "EQUIPMENT_TYPE",
  "COMMODITY",
  "TRADE_LANE"
] as const;

export type ReferenceSetId = (typeof referenceSetIds)[number];

export type ReferenceSetDescriptor = {
  id: ReferenceSetId;
  label: string;
  description: string;
  sensitive: boolean;
};

export type PermissionState = {
  canRead: boolean;
  canWrite: boolean;
  requestedArea: string;
  correlationId: string;
  reason: string;
};

export type ReferenceRecordView = {
  id: string;
  set: ReferenceSetId;
  code: string;
  displayName: string;
  status: "ACTIVE" | "INACTIVE";
  updatedAt: string;
  updatedBy: string;
  relationship: string;
  classification: "Internal" | "Confidential" | "Restricted";
  eventStatus: "pending" | "published" | "failed" | "retrying" | "unknown";
  correlationId: string;
};

export const referenceSetDescriptors: ReferenceSetDescriptor[] = [
  { id: "PARTY_CUSTOMER", label: "Party / Customer", description: "Carrier parties and customer identifiers.", sensitive: true },
  { id: "LOCATION", label: "Location / Port", description: "Ports, locations, and country-linked location records.", sensitive: false },
  { id: "REGION", label: "Region", description: "Flat region groupings for routing and trade lanes.", sensitive: false },
  { id: "VOYAGE", label: "Voyage", description: "Voyage identifiers used by shared workflows.", sensitive: false },
  { id: "CURRENCY", label: "Currency", description: "Operating currencies and display metadata.", sensitive: false },
  { id: "CHARGE_CODE", label: "Charge Code", description: "Commercial charge code catalog.", sensitive: true },
  { id: "EQUIPMENT_TYPE", label: "Equipment Type", description: "Container and equipment type references.", sensitive: false },
  { id: "COMMODITY", label: "Commodity", description: "Commodity categories for shipment classification.", sensitive: true },
  { id: "TRADE_LANE", label: "Trade Lane", description: "Configurable origin and destination region pairs.", sensitive: false }
];

export const mutationDraftSchema = z.object({
  set: z.enum(referenceSetIds),
  code: z.string().trim().min(2).max(32),
  displayName: z.string().trim().min(2).max(120),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  reason: z.string().trim().max(240).optional(),
  attributes: z.record(z.string()).default({})
});

export const localRecords: ReferenceRecordView[] = [
  record("party-customer-local-carrier", "PARTY_CUSTOMER", "LOCAL-CARRIER", "Local Demo Carrier", "Confidential", "published", "Customer class: carrier"),
  record("location-usnyc", "LOCATION", "USNYC", "New York, US", "Internal", "published", "Country: US"),
  record("location-nlrot", "LOCATION", "NLRTM", "Rotterdam, NL", "Internal", "published", "Country: NL"),
  record("region-na", "REGION", "NA", "North America", "Internal", "published", "Flat region"),
  record("region-eu", "REGION", "EU", "Europe", "Internal", "published", "Flat region"),
  record("voyage-local-001", "VOYAGE", "LC-VOY-001", "Local Demo Voyage 001", "Internal", "pending", "USNYC to NLRTM"),
  record("currency-usd", "CURRENCY", "USD", "US Dollar", "Internal", "published", "Minor unit: 2"),
  record("charge-code-ofr", "CHARGE_CODE", "OFR", "Ocean Freight", "Confidential", "retrying", "Charge family: freight"),
  record("equipment-type-40hc", "EQUIPMENT_TYPE", "40HC", "40 Foot High Cube", "Internal", "published", "ISO size type: 45G1"),
  record("commodity-general-cargo", "COMMODITY", "GEN", "General Cargo", "Confidential", "unknown", "Hazardous: false"),
  record("trade-lane-na-eu", "TRADE_LANE", "NA-EU", "North America to Europe", "Internal", "published", "Origin NA, destination EU")
];

export function defaultPermissionState(correlationId = "ref-ui-local"): PermissionState {
  return {
    canRead: true,
    canWrite: false,
    requestedArea: "reference-data",
    correlationId,
    reason: "Read-only local session. Mutations require reference-data:write."
  };
}

export function getReferenceSet(id: string): ReferenceSetDescriptor | undefined {
  return referenceSetDescriptors.find((set) => set.id === id);
}

export function listRecords(set: string | null, search = "", includeInactive = false): ReferenceRecordView[] {
  const normalizedSearch = search.trim().toLowerCase();
  return localRecords
    .filter((record) => !set || record.set === set)
    .filter((record) => includeInactive || record.status === "ACTIVE")
    .filter((record) => normalizedSearch.length === 0
      || record.code.toLowerCase().includes(normalizedSearch)
      || record.displayName.toLowerCase().includes(normalizedSearch))
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
}

export function findRecord(set: string, id: string): ReferenceRecordView | undefined {
  return localRecords.find((record) => record.set === set && record.id === id);
}

export function historyFor(record: ReferenceRecordView) {
  return [
    {
      operation: "UPDATED",
      actor: record.updatedBy,
      occurredAt: record.updatedAt,
      eventId: `evt-${record.id}`,
      status: record.eventStatus,
      correlationId: record.correlationId
    }
  ];
}

export function validateMutationDraft(input: unknown) {
  return mutationDraftSchema.safeParse(input);
}

function record(
  id: string,
  set: ReferenceSetId,
  code: string,
  displayName: string,
  classification: ReferenceRecordView["classification"],
  eventStatus: ReferenceRecordView["eventStatus"],
  relationship: string
): ReferenceRecordView {
  return {
    id,
    set,
    code,
    displayName,
    status: "ACTIVE",
    updatedAt: "2026-07-01T00:00:00Z",
    updatedBy: "local.reference.admin",
    relationship,
    classification,
    eventStatus,
    correlationId: `corr-${id}`
  };
}
