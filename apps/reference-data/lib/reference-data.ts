import { z } from "zod";

export const referenceSetIds = [
  "PARTY_CUSTOMER",
  "LOCATION",
  "REGION",
  "VESSEL_VOYAGE",
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
  { id: "VESSEL_VOYAGE", label: "Vessel / Voyage", description: "Vessels and scheduled carrier voyages used by booking workflows.", sensitive: false },
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
  record("vessel-linercore-atlas", "VESSEL_VOYAGE", "9387425", "LinerCore Atlas", "Internal", "published", "IMO 9387425"),
  record("voyage-local-001", "VESSEL_VOYAGE", "LC001E", "LinerCore Atlas LC001E", "Internal", "published", "USNYC to NLRTM, 01-10 Aug 2026"),
  record("voyage-local-002", "VESSEL_VOYAGE", "LC002E", "LinerCore Atlas LC002E", "Internal", "published", "USNYC to NLRTM, 15-24 Aug 2026"),
  record("currency-usd", "CURRENCY", "USD", "US Dollar", "Internal", "published", "Minor unit: 2"),
  record("charge-code-ofr", "CHARGE_CODE", "OFR", "Ocean Freight", "Confidential", "published", "Freight"),
  record("charge-code-baf", "CHARGE_CODE", "BAF", "Bunker Adjustment Factor", "Confidential", "published", "Fuel surcharge"),
  record("charge-code-thc", "CHARGE_CODE", "THC", "Terminal Handling Charge", "Confidential", "published", "Terminal handling"),
  record("equipment-type-22g1", "EQUIPMENT_TYPE", "22G1", "20 Foot General Purpose", "Internal", "published", "ISO 6346 size/type 22G1"),
  record("equipment-type-42g1", "EQUIPMENT_TYPE", "42G1", "40 Foot General Purpose", "Internal", "published", "ISO 6346 size/type 42G1"),
  record("equipment-type-45g1", "EQUIPMENT_TYPE", "45G1", "40 Foot High Cube", "Internal", "published", "ISO 6346 size/type 45G1"),
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

// The fail-closed counterpart to defaultPermissionState. Used wherever authorization
// cannot be established — no session, an expired session, or absent server-side
// configuration — so that an unresolved decision denies rather than grants.
export function deniedPermissionState(
  correlationId: string,
  reason = "Authorization could not be established."
): PermissionState {
  return {
    canRead: false,
    canWrite: false,
    requestedArea: "reference-data",
    correlationId,
    reason
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
