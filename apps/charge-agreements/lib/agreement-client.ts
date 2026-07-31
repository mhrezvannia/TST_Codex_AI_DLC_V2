import {
  agreementAppPath,
  agreementDetailSchema,
  agreementErrorSchema,
  agreementPageSchema,
  type AgreementDetail,
  type AgreementForm,
  type AgreementPage,
  type AgreementVersion
} from "./agreements";

export class AgreementClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fields: Record<string, string> = {}
  ) {
    super(message);
    this.name = "AgreementClientError";
  }
}

export function listAgreements(query: URLSearchParams): Promise<AgreementPage> {
  return request(`/api/agreements?${query}`, agreementPageSchema, { cache: "no-store" });
}

export function getAgreement(id: string, versionId?: string): Promise<AgreementDetail> {
  const query = versionId ? `?agreementVersionId=${encodeURIComponent(versionId)}` : "";
  return request(`/api/agreements/${encodeURIComponent(id)}${query}`, agreementDetailSchema, { cache: "no-store" });
}

export function createAgreement(form: AgreementForm): Promise<AgreementDetail> {
  return mutate("/api/agreements", "POST", form);
}

export function updateAgreement(detail: AgreementDetail, version: AgreementVersion, form: AgreementForm): Promise<AgreementDetail> {
  return mutate(`/api/agreements/${encodeURIComponent(detail.agreementId)}`, "PUT", {
    agreementVersionId: version.agreementVersionId,
    expectedRowVersion: version.rowVersion,
    commercial: form.commercial,
    reason: form.reason
  });
}

export function createAgreementSuccessor(detail: AgreementDetail, source: AgreementVersion, form: AgreementForm): Promise<AgreementDetail> {
  return mutate(`/api/agreements/${encodeURIComponent(detail.agreementId)}/successor`, "POST", {
    sourceAgreementVersionId: source.agreementVersionId,
    commercial: form.commercial,
    reason: form.reason
  });
}

export function executeAgreementAction(
  action: "approve" | "suspend" | "expire",
  detail: AgreementDetail,
  version: AgreementVersion,
  reason: string
): Promise<AgreementDetail> {
  const path = action === "approve"
    ? `/api/agreements/${encodeURIComponent(detail.agreementId)}/versions/${encodeURIComponent(version.agreementVersionId)}/approve`
    : `/api/agreements/${encodeURIComponent(detail.agreementId)}/${action}`;
  return mutate(path, "POST", action === "approve"
    ? { expectedRowVersion: version.rowVersion, reason }
    : { agreementVersionId: version.agreementVersionId, expectedRowVersion: version.rowVersion, reason });
}

async function mutate(path: string, method: "POST" | "PUT", body: unknown): Promise<AgreementDetail> {
  return request(path, agreementDetailSchema, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function request<T>(
  path: string,
  schema: { parse(value: unknown): T },
  init: RequestInit
): Promise<T> {
  const response = await fetch(agreementAppPath(path), init);
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const parsed = agreementErrorSchema.safeParse(payload);
    const fields = parsed.success
      ? Object.fromEntries(parsed.data.fields.map((fieldError) => (
        "field" in fieldError
          ? [fieldError.field, fieldError.reason]
          : [fieldError.path, fieldError.message]
      )))
      : {};
    throw new AgreementClientError(
      parsed.success ? parsed.data.message : "Agreement request failed",
      response.status,
      parsed.success ? parsed.data.code : "AGREEMENT_REQUEST_FAILED",
      fields
    );
  }
  return schema.parse(payload);
}
