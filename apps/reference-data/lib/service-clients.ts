import { isLocalBypassEnabled } from "@erp/auth";
import {
  defaultPermissionState,
  getReferenceSet,
  type PermissionState,
  type ReferenceRecordView,
  type ReferenceSetDescriptor,
  referenceSetDescriptors,
  type ReferenceSetId
} from "./reference-data";

const DEFAULT_IDENTITY_SERVICE_URL = "http://localhost:8082";
const DEFAULT_REFERENCE_DATA_SERVICE_URL = "http://localhost:8083";
const REQUEST_TIMEOUT_MS = 5000;

type ServiceResult<T> =
  | { ok: true; status: number; correlationId: string; data: T }
  | { ok: false; status: number; correlationId: string; error: string; detail?: unknown };
type ServiceFailure = Extract<ServiceResult<unknown>, { ok: false }>;

type AuthorizationDecision = {
  result?: "ALLOW" | "DENY";
  reasonCode?: string;
  correlationId?: string;
};

type BackendReferenceRecord = {
  id?: string | { value?: string };
  set?: ReferenceSetId;
  code?: string | { value?: string };
  displayName?: string;
  status?: "ACTIVE" | "INACTIVE";
  updatedAt?: string;
  updatedBy?: { subjectId?: string; displayName?: string };
  changeReason?: string;
  attributes?: Record<string, string>;
  correlationId?: string;
};

type BackendReferencePage = {
  records?: BackendReferenceRecord[];
  page?: number;
  size?: number;
  total?: number;
};

export type BffReferencePage = {
  set: ReferenceSetId;
  records: ReferenceRecordView[];
  page: number;
  size: number;
  total: number;
  correlationId: string;
};

export function correlationIdFrom(request: Request, fallback = "ref-bff-local"): string {
  return request.headers.get("x-correlation-id") ?? `${fallback}-${crypto.randomUUID()}`;
}

export function isLocalAuthBypassEnabled(): boolean {
  return isLocalBypassEnabled(process.env, ["AUTH_BYPASS", "REFERENCE_DATA_AUTH_BYPASS"]);
}

export async function resolveReferenceDataPermissions(
  request: Request,
  correlationId: string,
  action: "read" | "create" | "update" = "read"
): Promise<ServiceResult<PermissionState>> {
  if (isLocalAuthBypassEnabled()) {
    return {
      ok: true,
      status: 200,
      correlationId,
      data: {
        canRead: true,
        canWrite: true,
        requestedArea: "reference-data",
        correlationId,
        reason: "Local auth bypass is enabled for non-production development."
      }
    };
  }

  const tokenReference = request.headers.get("authorization")
    ?? request.headers.get("x-token-reference")
    ?? process.env.LOCAL_REFERENCE_DATA_TOKEN
    ?? "";

  if (!tokenReference) {
    return {
      ok: true,
      status: 200,
      correlationId,
      data: defaultPermissionState(correlationId)
    };
  }

  const decision = await serviceJson<AuthorizationDecision>(
    serviceUrl("IDENTITY_SERVICE_URL", DEFAULT_IDENTITY_SERVICE_URL),
    "/internal/identity/authorize",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requestId: correlationId,
        correlationId,
        tokenReference,
        resource: "reference-data",
        action,
        scope: null,
        caller: "apps-reference-data"
      })
    },
    correlationId
  );

  if (!decision.ok) {
    return decision;
  }

  const allowed = decision.data.result === "ALLOW";
  return {
    ok: true,
    status: 200,
    correlationId,
    data: {
      canRead: true,
      canWrite: allowed,
      requestedArea: "reference-data",
      correlationId: decision.data.correlationId ?? correlationId,
      reason: allowed ? "identity-service allowed reference-data write." : decision.data.reasonCode ?? "authorization denied"
    }
  };
}

export async function listReferenceSets(correlationId: string): Promise<ServiceResult<ReferenceSetDescriptor[]>> {
  const result = await serviceJson<string[]>(
    serviceUrl("REFERENCE_DATA_SERVICE_URL", DEFAULT_REFERENCE_DATA_SERVICE_URL),
    "/reference-sets",
    { method: "GET" },
    correlationId
  );
  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    status: result.status,
    correlationId,
    data: result.data
      .map((id) => getReferenceSet(id))
      .filter((set): set is ReferenceSetDescriptor => Boolean(set))
  };
}

export async function listReferenceRecords(
  set: ReferenceSetId,
  request: Request,
  correlationId: string
): Promise<ServiceResult<BffReferencePage>> {
  const url = new URL(request.url);
  const backendPath = new URLSearchParams({
    includeInactive: String(url.searchParams.get("includeInactive") === "true"),
    page: url.searchParams.get("page") ?? "0",
    size: url.searchParams.get("size") ?? "25"
  });

  const result = await serviceJson<BackendReferencePage>(
    serviceUrl("REFERENCE_DATA_SERVICE_URL", DEFAULT_REFERENCE_DATA_SERVICE_URL),
    `/reference-sets/${set}/records?${backendPath.toString()}`,
    { method: "GET" },
    correlationId
  );
  if (!result.ok) {
    return result;
  }

  const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
  const records = (result.data.records ?? [])
    .map((record) => normalizeReferenceRecord(record, set, correlationId))
    .filter((record) => search.length === 0
      || record.code.toLowerCase().includes(search)
      || record.displayName.toLowerCase().includes(search));

  return {
    ok: true,
    status: result.status,
    correlationId,
    data: {
      set,
      records,
      page: result.data.page ?? 0,
      size: result.data.size ?? records.length,
      total: search.length === 0 ? result.data.total ?? records.length : records.length,
      correlationId
    }
  };
}

export async function getReferenceRecord(
  set: ReferenceSetId,
  id: string,
  correlationId: string
): Promise<ServiceResult<{ record: ReferenceRecordView; correlationId: string }>> {
  const result = await serviceJson<BackendReferenceRecord>(
    serviceUrl("REFERENCE_DATA_SERVICE_URL", DEFAULT_REFERENCE_DATA_SERVICE_URL),
    `/reference-sets/${set}/records/${encodeURIComponent(id)}`,
    { method: "GET" },
    correlationId
  );
  if (!result.ok) {
    return result;
  }

  return { ok: true, status: result.status, correlationId, data: { record: normalizeReferenceRecord(result.data, set, correlationId), correlationId } };
}

export async function mutateReferenceRecord(
  set: ReferenceSetId,
  method: "POST" | "PUT",
  id: string | null,
  body: unknown,
  correlationId: string
): Promise<ServiceResult<unknown>> {
  const version = method === "PUT" ? "?version=1" : "";
  const path = id
    ? `/reference-sets/${set}/records/${encodeURIComponent(id)}${version}`
    : `/reference-sets/${set}/records`;

  return serviceJson(
    serviceUrl("REFERENCE_DATA_SERVICE_URL", DEFAULT_REFERENCE_DATA_SERVICE_URL),
    path,
    {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    },
    correlationId
  );
}

export async function getReferenceRecordHistory(
  set: ReferenceSetId,
  id: string,
  correlationId: string
): Promise<ServiceResult<{ history: unknown; correlationId: string }>> {
  const result = await serviceJson<unknown>(
    serviceUrl("REFERENCE_DATA_SERVICE_URL", DEFAULT_REFERENCE_DATA_SERVICE_URL),
    `/reference-sets/${set}/records/${encodeURIComponent(id)}/history`,
    { method: "GET" },
    correlationId
  );
  if (!result.ok) {
    return result;
  }

  return { ok: true, status: result.status, correlationId, data: { history: result.data, correlationId } };
}

export function serviceErrorResponse(result: ServiceFailure): Response {
  return Response.json(
    {
      error: result.error,
      detail: result.detail,
      correlationId: result.correlationId
    },
    { status: result.status }
  );
}

export function asReferenceSetId(rawSet: string): ReferenceSetId | null {
  const normalized = rawSet.toUpperCase();
  return referenceSetDescriptors.some((set) => set.id === normalized) ? normalized as ReferenceSetId : null;
}

export function mutationCommand(input: {
  set: ReferenceSetId;
  code: string;
  displayName: string;
  attributes?: Record<string, string>;
  reason?: string;
  correlationId: string;
  actorSubjectId?: string;
  operation: "create" | "update";
}) {
  return {
    set: input.set,
    code: input.code,
    displayName: input.displayName,
    attributes: input.attributes ?? {},
    actorSubjectId: input.actorSubjectId ?? "local.reference.admin",
    actorDisplayName: input.actorSubjectId ?? "Local Reference Admin",
    operation: input.operation,
    reason: input.reason ?? input.operation,
    correlationId: input.correlationId
  };
}

export function normalizeReferenceRecord(record: BackendReferenceRecord, fallbackSet: ReferenceSetId, correlationId: string): ReferenceRecordView {
  const set = record.set ?? fallbackSet;
  const descriptor = getReferenceSet(set);
  return {
    id: valueOf(record.id) ?? `${set}-${valueOf(record.code) ?? "unknown"}`.toLowerCase(),
    set,
    code: valueOf(record.code) ?? "UNKNOWN",
    displayName: record.displayName ?? valueOf(record.code) ?? "Unknown reference record",
    status: record.status ?? "ACTIVE",
    updatedAt: record.updatedAt ?? new Date(0).toISOString(),
    updatedBy: record.updatedBy?.displayName ?? record.updatedBy?.subjectId ?? "system",
    relationship: record.attributes?.relationship ?? record.changeReason ?? "",
    classification: descriptor?.sensitive ? "Confidential" : "Internal",
    eventStatus: "unknown",
    correlationId: record.correlationId ?? correlationId
  };
}

async function serviceJson<T>(
  baseUrl: string,
  path: string,
  init: RequestInit,
  correlationId: string
): Promise<ServiceResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "x-correlation-id": correlationId,
        ...(init.headers ?? {})
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    const data = await safeJson(response);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        correlationId,
        error: "upstream service rejected request",
        detail: data
      };
    }
    return { ok: true, status: response.status, correlationId, data: data as T };
  } catch (error) {
    return {
      ok: false,
      status: 503,
      correlationId,
      error: "upstream service unavailable",
      detail: error instanceof Error ? error.message : String(error)
    };
  }
}

function serviceUrl(envName: "IDENTITY_SERVICE_URL" | "REFERENCE_DATA_SERVICE_URL", fallback: string): string {
  return (process.env[envName] ?? fallback).replace(/\/+$/, "");
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function valueOf(value: string | { value?: string } | undefined): string | undefined {
  return typeof value === "string" ? value : value?.value;
}
