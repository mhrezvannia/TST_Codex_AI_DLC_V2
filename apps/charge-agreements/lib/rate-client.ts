import {
  rateAppPath,
  rateDetailSchema,
  ratePageSchema,
  type RateDetail,
  type RateForm,
  type RatePage,
  type RateVersion
} from "./rates";

type RateErrorPayload = {
  message?: unknown;
  fields?: unknown;
};

export class RateClientError extends Error {
  readonly fields: Record<string, string>;
  readonly status: number;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = "RateClientError";
    this.status = status;
    this.fields = fields;
  }
}

export async function loadRatePage(query: URLSearchParams): Promise<RatePage> {
  return requestRate<RatePage>(`/api/rates?${query.toString()}`, ratePageSchema, { cache: "no-store" });
}

export async function loadRateDetail(rateId: string): Promise<RateDetail> {
  return requestRate<RateDetail>(
    `/api/rates/${encodeURIComponent(rateId)}`,
    rateDetailSchema,
    { cache: "no-store" }
  );
}

export async function saveRateDraft(input: {
  detail?: RateDetail;
  draft?: RateVersion;
  form: RateForm;
}): Promise<RateDetail> {
  const editing = Boolean(input.detail && input.draft);
  const path = editing
    ? `/api/rates/${encodeURIComponent(input.detail!.rateId)}/versions/${encodeURIComponent(input.draft!.versionId)}`
    : "/api/rates";
  const body = editing
    ? { ...input.form, expectedRowVersion: input.draft!.rowVersion }
    : input.form;
  return requestRate<RateDetail>(path, rateDetailSchema, {
    method: editing ? "PUT" : "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

export async function executeRateCommand(
  kind: "approve" | "successor",
  rateId: string,
  version: RateVersion
): Promise<RateDetail> {
  return requestRate<RateDetail>(
    `/api/rates/${encodeURIComponent(rateId)}/versions/${encodeURIComponent(version.versionId)}/${kind}`,
    rateDetailSchema,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(kind === "approve" ? { expectedRowVersion: version.rowVersion } : {})
    }
  );
}

async function requestRate<T>(
  path: string,
  schema: { parse(value: unknown): T },
  init: RequestInit
): Promise<T> {
  const response = await fetch(rateAppPath(path), init);
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = payload as RateErrorPayload;
    const fields = Array.isArray(error.fields)
      ? Object.fromEntries(error.fields.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const field = Reflect.get(item, "field");
        const reason = Reflect.get(item, "reason");
        return typeof field === "string" && typeof reason === "string" ? [[field, reason]] : [];
      }))
      : {};
    throw new RateClientError(
      typeof error.message === "string" ? error.message : "Rate request failed",
      response.status,
      fields
    );
  }
  return schema.parse(payload);
}
