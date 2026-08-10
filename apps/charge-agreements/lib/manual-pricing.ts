import { z } from "zod";

export const manualReasonSchema = z.enum([
  "NO_RATE",
  "AMBIGUOUS_AGREEMENT_AUTHORITY",
  "AMBIGUOUS_BASE_RATE",
  "AMBIGUOUS_SURCHARGE_RATE",
  "AMBIGUOUS_LOCAL_RATE"
]);

const datesSchema = z.object({
  effectiveDate: z.string(),
  requestedDepartureDate: z.string()
}).strict();

const quantitiesSchema = z.object({
  equipmentQuantity: z.number().int().positive(),
  teu: z.number().int().positive(),
  amendmentSeq: z.number().int().nonnegative()
}).strict();

export const manualCaseSchema = z.object({
  caseId: z.string().min(1),
  pricingRequestId: z.string().min(1),
  reasonCode: manualReasonSchema,
  status: z.literal("OPEN"),
  bookingRef: z.string().nullable(),
  amendmentSeq: z.number().int().nonnegative().nullable(),
  requestHash: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
  correlationId: z.string().nullable(),
  openedAt: z.string().nullable(),
  requestContext: z.object({
    tradeLane: z.string(),
    pol: z.string(),
    pod: z.string(),
    equipmentType: z.string(),
    partyId: z.string(),
    commodityCode: z.string(),
    reeferIndicator: z.boolean(),
    dgIndicator: z.boolean(),
    dates: datesSchema,
    quantities: quantitiesSchema
  }).strict().nullable(),
  legacyEvidence: z.boolean()
}).strict();

export const manualCasePageSchema = z.object({
  items: z.array(manualCaseSchema).max(100),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  size: z.number().int().min(1).max(100)
}).strict();

export type ManualCase = z.infer<typeof manualCaseSchema>;
export type ManualCasePage = z.infer<typeof manualCasePageSchema>;

export function canonicalManualSearchParams(input: URLSearchParams): URLSearchParams {
  const output = new URLSearchParams();
  output.set("status", "OPEN");
  for (const key of ["reasonCode", "bookingRef", "openedFrom", "openedTo"]) {
    const value = input.get(key)?.trim();
    if (value) output.set(key, value);
  }
  const browserPage = bounded(input.get("page"), 1, 1, 1_000_000);
  output.set("page", String(browserPage - 1));
  output.set("size", "25");
  return output;
}

export function manualPricingAppPath(path: string): string {
  return `/charge-agreements${path.startsWith("/") ? path : `/${path}`}`;
}

function bounded(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
