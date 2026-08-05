import { z } from "zod";

export const rateCategorySchema = z.enum(["BASE", "SURCHARGE", "LOCAL"]);
export const rateLifecycleSchema = z.enum(["DRAFT", "SCHEDULED", "EFFECTIVE", "EXPIRED"]);
export const rateVersionLifecycleSchema = z.enum(["DRAFT", "APPROVED"]);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const identifier = z.string().trim().min(1).max(64);
const correlation = z.string().trim().min(1).max(128);
const money = z.union([z.string(), z.number()]).transform((value) => String(value));

export const rateVersionSchema = z.object({
  versionId: identifier,
  versionNo: z.number().int().positive(),
  lifecycle: rateVersionLifecycleSchema,
  presentationState: rateLifecycleSchema,
  basis: z.literal("PER_CONTAINER"),
  currencyId: identifier,
  currency: z.literal("USD"),
  unitRate: money,
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  originLocationId: identifier,
  destinationLocationId: identifier.nullable(),
  equipmentTypeId: identifier,
  rowVersion: z.number().int().nonnegative(),
  sourceVersionId: identifier.nullable(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().nullable(),
  updatedAt: z.string().datetime().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.string().datetime().nullable(),
  correlationId: correlation
}).strict();

export const rateActionsSchema = z.object({
  canEdit: z.boolean(),
  canApprove: z.boolean(),
  canCreateSuccessor: z.boolean()
}).strict();

export const rateActivitySchema = z.object({
  activityId: identifier,
  versionId: identifier,
  versionNo: z.number().int().positive(),
  action: z.enum(["RATE_CREATED", "RATE_DRAFT_UPDATED", "RATE_SUCCESSOR_CREATED", "RATE_VERSION_APPROVED"]),
  actorSubjectId: z.string(),
  occurredAt: z.string().datetime(),
  correlationId: correlation,
  reason: z.string().nullable(),
  resultingRowVersion: z.number().int().nonnegative()
}).strict();

export const rateDetailSchema = z.object({
  rateId: identifier,
  category: rateCategorySchema,
  chargeCodeId: identifier,
  chargeCode: z.enum(["OFR", "BAF", "THC"]),
  versions: z.array(rateVersionSchema),
  activities: z.array(rateActivitySchema),
  actions: rateActionsSchema,
  evaluatedAsOf: isoDate
}).strict();

export const rateListItemSchema = z.object({
  rateId: identifier,
  category: rateCategorySchema,
  chargeCodeId: identifier,
  chargeCode: z.enum(["OFR", "BAF", "THC"]),
  latestVersion: rateVersionSchema,
  selectedSummaryVersion: rateVersionSchema,
  effectiveApprovedVersion: rateVersionSchema.nullable(),
  hasDraft: z.boolean(),
  versionCount: z.number().int().positive(),
  actions: rateActionsSchema,
  evaluatedAsOf: isoDate
}).strict();

export const ratePageSchema = z.object({
  items: z.array(rateListItemSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  canCreate: z.boolean(),
  evaluatedAsOf: isoDate
}).strict();

export const rateErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.array(z.object({ field: z.string(), reason: z.string() }).strict()).default([]),
  correlationId: z.string().optional()
}).strict();

export const rateFormSchema = z.object({
  category: rateCategorySchema,
  chargeCodeId: identifier,
  chargeCode: z.enum(["OFR", "BAF", "THC"]),
  unitRate: z.string().regex(/^(0|[1-9]\d*)(\.\d{1,2})?$/, "Use a non-negative amount with at most two decimals"),
  currencyId: identifier,
  currency: z.literal("USD"),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
  originLocationId: identifier,
  destinationLocationId: z.string().trim().max(64).nullable(),
  equipmentTypeId: identifier
}).strict().superRefine((value, context) => {
  const expectedCode = { BASE: "OFR", SURCHARGE: "BAF", LOCAL: "THC" }[value.category];
  if (value.chargeCode !== expectedCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["chargeCode"], message: `${value.category} requires ${expectedCode}` });
  }
  if (value.category === "LOCAL" && value.destinationLocationId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["destinationLocationId"], message: "Local rates have no destination" });
  }
  if (value.category !== "LOCAL" && !value.destinationLocationId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["destinationLocationId"], message: "Destination is required" });
  }
  if (value.effectiveTo < value.effectiveFrom) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["effectiveTo"], message: "End date must be on or after start date" });
  }
});

export type RateCategory = z.infer<typeof rateCategorySchema>;
export type RateLifecycle = z.infer<typeof rateLifecycleSchema>;
export type RateVersion = z.infer<typeof rateVersionSchema>;
export type RateDetail = z.infer<typeof rateDetailSchema>;
export type RateListItem = z.infer<typeof rateListItemSchema>;
export type RatePage = z.infer<typeof ratePageSchema>;
export type RateForm = z.infer<typeof rateFormSchema>;
export type RateAction = "read" | "create" | "update" | "approve" | "create-successor";
export type RateProxyMethod = "GET" | "POST" | "PUT";

export function rateAppPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/charge-agreements${normalized}`;
}

export function canonicalRateSearchParams(input: URLSearchParams): URLSearchParams {
  const output = new URLSearchParams();
  for (const key of ["q", "category", "lifecycle", "asOf", "originId", "destinationId", "equipmentTypeId"]) {
    const value = input.get(key)?.trim();
    if (value) output.set(key, value);
  }
  const browserPage = boundedInteger(input.get("page"), 1, 1, 1_000_000);
  const size = boundedInteger(input.get("size"), 25, 1, 100);
  output.set("page", String(browserPage - 1));
  output.set("size", String(size));
  return output;
}

export function safeRateReturnTo(
  value: string | null | undefined,
  fallback = "/charge-agreements/rates"
): string {
  if (!value) return fallback;
  try {
    const parsed = new URL(value, "http://internal.local");
    return parsed.origin === "http://internal.local"
      && parsed.pathname.startsWith("/charge-agreements/rates")
      ? `${parsed.pathname}${parsed.search}` : fallback;
  } catch {
    return fallback;
  }
}

function boundedInteger(value: string | null, fallback: number, minimum: number, maximum: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Number(value)));
}
