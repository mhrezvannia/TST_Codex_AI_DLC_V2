import { z } from "zod";

const identifier = z.string().trim().min(1).max(64);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const instant = z.string().datetime();
const lifecycle = z.enum(["LEGACY", "DRAFT", "APPROVED", "SUSPENDED", "EXPIRED"]);
const authorityModel = z.enum(["LEGACY", "W2_VERSIONED"]);

export const agreementRateLinkSchema = z.object({
  category: z.enum(["BASE", "SURCHARGE", "LOCAL"]),
  rateVersionId: identifier
}).strict();

export const agreementVersionSchema = z.object({
  agreementVersionId: identifier,
  versionNo: z.number().int().positive(),
  lifecycle,
  rowVersion: z.number().int().nonnegative(),
  sourceAgreementVersionId: identifier.nullable(),
  customerId: identifier,
  tradeLaneId: identifier,
  originLocationId: identifier.nullable(),
  destinationLocationId: identifier.nullable(),
  equipmentTypeId: identifier.nullable(),
  commodityId: identifier.nullable(),
  validFrom: isoDate,
  validTo: isoDate,
  rateLinks: z.array(agreementRateLinkSchema),
  createdBy: z.string(),
  createdAt: instant,
  updatedBy: z.string().nullable(),
  updatedAt: instant.nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: instant.nullable(),
  correlationId: z.string().min(1).max(128)
}).strict().superRefine((value, context) => {
  if (value.validTo < value.validFrom) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["validTo"], message: "End date must be on or after start date" });
  }
  if (value.lifecycle !== "LEGACY") {
    const categories = new Set(value.rateLinks.map((link) => link.category));
    const ids = new Set(value.rateLinks.map((link) => link.rateVersionId));
    if (value.rateLinks.length !== 3 || categories.size !== 3 || ids.size !== 3) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["rateLinks"], message: "Exactly three distinct category links are required" });
    }
  }
});

export const agreementCapabilitiesSchema = z.object({
  canCreate: z.boolean(),
  canUpdate: z.boolean(),
  canApprove: z.boolean(),
  canCreateSuccessor: z.boolean(),
  canSuspend: z.boolean(),
  canExpire: z.boolean()
}).strict();

export const agreementSummarySchema = z.object({
  agreementId: identifier,
  agreementNumber: identifier,
  authorityModel,
  selectedVersion: agreementVersionSchema.nullable(),
  approvedVersion: agreementVersionSchema.nullable(),
  hasDraft: z.boolean(),
  w2AuthorityEligible: z.boolean(),
  readOnly: z.boolean()
}).strict();

export const agreementPageSchema = z.object({
  items: z.array(agreementSummarySchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  canCreate: z.boolean()
}).strict();

export const agreementActivitySchema = z.object({
  activityId: identifier,
  agreementVersionId: identifier,
  action: z.enum(["CREATED", "DRAFT_UPDATED", "SUCCESSOR_CREATED", "APPROVED", "SUSPENDED", "EXPIRED"]),
  actorSubjectId: z.string(),
  occurredAt: instant,
  correlationId: z.string(),
  reason: z.string().nullable(),
  resultingRowVersion: z.number().int().nonnegative()
}).strict();

export const agreementDetailSchema = z.object({
  agreementId: identifier,
  agreementNumber: identifier,
  authorityModel,
  selectedVersion: agreementVersionSchema.nullable(),
  approvedVersion: agreementVersionSchema.nullable(),
  versions: z.array(agreementVersionSchema),
  activity: z.array(agreementActivitySchema),
  capabilities: agreementCapabilitiesSchema,
  w2AuthorityEligible: z.boolean(),
  readOnly: z.boolean()
}).strict();

export const agreementCommercialSchema = z.object({
  customerId: identifier,
  tradeLaneId: identifier,
  originLocationId: identifier,
  destinationLocationId: identifier,
  equipmentTypeId: identifier,
  validFrom: isoDate,
  validTo: isoDate,
  baseRateVersionId: identifier,
  surchargeRateVersionId: identifier,
  localRateVersionId: identifier
}).strict().superRefine((value, context) => {
  if (value.originLocationId === value.destinationLocationId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["destinationLocationId"], message: "Destination must differ from origin" });
  }
  if (value.validTo < value.validFrom) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["validTo"], message: "End date must be on or after start date" });
  }
  if (new Set([value.baseRateVersionId, value.surchargeRateVersionId, value.localRateVersionId]).size !== 3) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["baseRateVersionId"], message: "RateVersion identities must be distinct" });
  }
});

export const agreementFormSchema = z.object({
  agreementNumber: identifier,
  commercial: agreementCommercialSchema,
  reason: z.string().trim().max(512)
}).strict();

export const agreementErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.array(z.union([
    z.object({ field: z.string(), reason: z.string() }).strict(),
    z.object({ path: z.string(), code: z.string(), message: z.string() }).strict()
  ])).default([]),
  correlationId: z.string().optional()
}).strict();

export type AgreementVersion = z.infer<typeof agreementVersionSchema>;
export type AgreementPage = z.infer<typeof agreementPageSchema>;
export type AgreementDetail = z.infer<typeof agreementDetailSchema>;
export type AgreementForm = z.infer<typeof agreementFormSchema>;

export function agreementAppPath(path: string): string {
  return `/charge-agreements${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalAgreementSearchParams(input: URLSearchParams): URLSearchParams {
  const output = new URLSearchParams();
  for (const key of ["customerId", "tradeLaneId", "lifecycle", "validOn"]) {
    const value = input.get(key)?.trim();
    if (value) output.set(key, value);
  }
  const page = bounded(input.get("page"), 1, 1, 1_000_000);
  const size = bounded(input.get("size"), 25, 1, 100);
  output.set("page", String(page - 1));
  output.set("size", String(size));
  return output;
}

function bounded(value: string | null, fallback: number, minimum: number, maximum: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Number(value)));
}
