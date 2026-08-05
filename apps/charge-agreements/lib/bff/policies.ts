import { defineChargeRoutePolicy } from "./route-policy";
import {
  AGREEMENT_V2_MEDIA_TYPE,
  JSON_MEDIA_TYPE,
  type ChargeRouteInput,
  type ChargeRoutePolicy,
  type SafeIdentifier
} from "./types";

const RATE_BODY_FIELDS = [
  "category", "chargeCodeId", "chargeCode", "unitRate", "currencyId", "currency",
  "effectiveFrom", "effectiveTo", "originLocationId", "destinationLocationId",
  "equipmentTypeId", "expectedVersion", "reason"
] as const;
const AGREEMENT_BODY_FIELDS = [
  "agreementNumber", "commercial", "agreementVersionId", "sourceAgreementVersionId",
  "expectedRowVersion", "reason"
] as const;

function capability(resource: string, action: string) {
  return Object.freeze({ resource, action });
}

function id(input: ChargeRouteInput, name: string): string {
  const value = input.identifiers?.[name];
  if (!value) throw new Error(`Missing fixed route identifier ${name}`);
  return encodeURIComponent(value);
}

function query(input: ChargeRouteInput): string {
  const value = input.query?.toString();
  return value ? `?${value}` : "";
}

function ratePolicy(
  routeId: string,
  method: ChargeRoutePolicy["method"],
  action: string,
  backendPath: (input: ChargeRouteInput) => string,
  queryKeys: readonly string[] = [],
  bodyFields: readonly string[] = RATE_BODY_FIELDS
): ChargeRoutePolicy {
  return defineChargeRoutePolicy({
    routeId,
    method,
    requiredCapability: capability("charge-rates", action),
    accessClass: "COMMERCIAL",
    bodyMode: method === "GET" ? "NONE" : "JSON",
    idempotencyMode: method === "GET" ? "NONE" : "FORWARD_DERIVED",
    assertionMode: "NONE",
    backendAccept: JSON_MEDIA_TYPE,
    ...(method === "GET" ? {} : { backendMutationContentType: JSON_MEDIA_TYPE }),
    maxResponseBytes: 512 * 1024,
    timeoutMs: 2500,
    queryKeys,
    bodyFields,
    backendPath
  });
}

function agreementPolicy(
  routeId: string,
  method: ChargeRoutePolicy["method"],
  action: string,
  backendPath: (input: ChargeRouteInput) => string,
  queryKeys: readonly string[] = [],
  bodyFields: readonly string[] = AGREEMENT_BODY_FIELDS
): ChargeRoutePolicy {
  return defineChargeRoutePolicy({
    routeId,
    method,
    requiredCapability: capability("charge-agreements", action),
    accessClass: "COMMERCIAL",
    bodyMode: method === "GET" ? "NONE" : "JSON",
    idempotencyMode: method === "GET" ? "NONE" : "FORWARD_DERIVED",
    assertionMode: "SUBJECT_ASSERTION_V1",
    backendAccept: AGREEMENT_V2_MEDIA_TYPE,
    ...(method === "GET" ? {} : { backendMutationContentType: AGREEMENT_V2_MEDIA_TYPE }),
    maxResponseBytes: 512 * 1024,
    timeoutMs: 2500,
    queryKeys,
    bodyFields,
    backendPath
  });
}

export const RATE_POLICIES = Object.freeze({
  list: ratePolicy("rates.list", "GET", "read",
    (input) => `/api/charge-rates${query(input)}`,
    ["q", "category", "lifecycle", "asOf", "originId", "destinationId", "equipmentTypeId", "page", "size"]),
  create: ratePolicy("rates.create", "POST", "create", () => "/api/charge-rates"),
  detail: ratePolicy("rates.detail", "GET", "read",
    (input) => `/api/charge-rates/${id(input, "rateId")}${query(input)}`, ["asOf"]),
  update: ratePolicy("rates.update", "PUT", "update",
    (input) => `/api/charge-rates/${id(input, "rateId")}/versions/${id(input, "versionId")}`),
  approve: ratePolicy("rates.approve", "POST", "approve",
    (input) => `/api/charge-rates/${id(input, "rateId")}/versions/${id(input, "versionId")}/approve`),
  successor: ratePolicy("rates.successor", "POST", "create-successor",
    (input) => `/api/charge-rates/${id(input, "rateId")}/versions/${id(input, "versionId")}/successor`)
});

export const AGREEMENT_POLICIES = Object.freeze({
  list: agreementPolicy("agreements.list", "GET", "read",
    (input) => `/api/charge-agreements${query(input)}`,
    ["q", "customerId", "tradeLaneId", "originLocationId", "destinationLocationId",
      "equipmentTypeId", "lifecycle", "validOn", "page", "size"]),
  create: agreementPolicy("agreements.create", "POST", "create", () => "/api/charge-agreements"),
  detail: agreementPolicy("agreements.detail", "GET", "read",
    (input) => `/api/charge-agreements/${id(input, "agreementId")}${query(input)}`,
    ["agreementVersionId"]),
  update: agreementPolicy("agreements.update", "PUT", "update",
    (input) => `/api/charge-agreements/${id(input, "agreementId")}`),
  approve: agreementPolicy("agreements.approve", "POST", "approve",
    (input) => `/api/charge-agreements/${id(input, "agreementId")}/versions/${id(input, "versionId")}/approve`),
  successor: agreementPolicy("agreements.successor", "POST", "create-successor",
    (input) => `/api/charge-agreements/${id(input, "agreementId")}/versions`),
  suspend: agreementPolicy("agreements.suspend", "POST", "suspend",
    (input) => `/api/charge-agreements/${id(input, "agreementId")}/suspend`),
  expire: agreementPolicy("agreements.expire", "POST", "expire",
    (input) => `/api/charge-agreements/${id(input, "agreementId")}/expire`)
});

export const MANUAL_CASE_POLICIES = Object.freeze({
  list: defineChargeRoutePolicy({
    routeId: "manual-cases.list",
    method: "GET",
    requiredCapability: capability("charge-manual-cases", "read"),
    accessClass: "MANUAL_EVIDENCE",
    bodyMode: "NONE",
    idempotencyMode: "NONE",
    assertionMode: "SUBJECT_ASSERTION_V1",
    backendAccept: JSON_MEDIA_TYPE,
    maxResponseBytes: 512 * 1024,
    timeoutMs: 2500,
    queryKeys: ["status", "reasonCode", "bookingRef", "openedFrom", "openedTo", "page", "size"],
    bodyFields: [],
    backendPath: (input) => `/api/manual-pricing-cases${query(input)}`
  }),
  detail: defineChargeRoutePolicy({
    routeId: "manual-cases.detail",
    method: "GET",
    requiredCapability: capability("charge-manual-cases", "read"),
    accessClass: "MANUAL_EVIDENCE",
    bodyMode: "NONE",
    idempotencyMode: "NONE",
    assertionMode: "SUBJECT_ASSERTION_V1",
    backendAccept: JSON_MEDIA_TYPE,
    maxResponseBytes: 512 * 1024,
    timeoutMs: 2500,
    queryKeys: [],
    bodyFields: [],
    backendPath: (input) => `/api/manual-pricing-cases/${id(input, "caseId")}`
  })
});

/**
 * Legacy DTO compatibility is isolated and is never selected by W2 pages.
 * Actor authority is reconstructed by the proxy from the signed session.
 */
export const LEGACY_AGREEMENT_POLICIES = Object.freeze({
  list: defineChargeRoutePolicy({
    ...AGREEMENT_POLICIES.list,
    routeId: "legacy-agreements.list",
    assertionMode: "NONE",
    backendAccept: JSON_MEDIA_TYPE,
    backendPath: (input) => `/api/charge-agreements${query(input)}`
  }),
  create: defineChargeRoutePolicy({
    ...AGREEMENT_POLICIES.create,
    routeId: "legacy-agreements.create",
    bodyMode: "AGREEMENT_ACTOR_COMPAT",
    assertionMode: "NONE",
    backendAccept: JSON_MEDIA_TYPE,
    backendMutationContentType: JSON_MEDIA_TYPE
  })
});

export function routeIdentifiers(
  values: Readonly<Record<string, SafeIdentifier>>
): Readonly<Record<string, SafeIdentifier>> {
  return Object.freeze({ ...values });
}
