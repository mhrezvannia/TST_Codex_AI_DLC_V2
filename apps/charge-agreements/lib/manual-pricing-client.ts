import {
  canonicalManualSearchParams,
  manualCasePageSchema,
  manualCaseSchema,
  manualPricingAppPath,
  type ManualCase,
  type ManualCasePage
} from "./manual-pricing";

export class ManualPricingClientError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ManualPricingClientError";
  }
}

export async function listManualCases(input: URLSearchParams): Promise<ManualCasePage> {
  const query = canonicalManualSearchParams(input);
  return request(`/api/manual-cases?${query}`, manualCasePageSchema);
}

export async function getManualCase(caseId: string): Promise<ManualCase> {
  return request(`/api/manual-cases/${encodeURIComponent(caseId)}`, manualCaseSchema);
}

async function request<T>(path: string, schema: { parse(value: unknown): T }): Promise<T> {
  const response = await fetch(manualPricingAppPath(path), { cache: "no-store" });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null && "message" in payload
      ? String(payload.message)
      : "Manual pricing evidence could not be loaded";
    throw new ManualPricingClientError(message, response.status);
  }
  return schema.parse(payload);
}
