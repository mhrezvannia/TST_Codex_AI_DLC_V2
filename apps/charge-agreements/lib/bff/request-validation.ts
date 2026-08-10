import { readBoundedJson } from "./bounded-stream";
import type {
  ChargeBffConfig,
  ChargeRoutePolicy,
  ClientRequestId,
  SafeIdentifier
} from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:@+-]{0,63}$/;
const AUTHORITY_HEADER = /^(x-(linercore-(actor|subject|service|capability|permission)|actor-subject|role|permission|capability)|idempotency-key)$/i;
const AUTHORITY_BODY = /^(actor|actorSubjectId|subject|subjectId|roles?|permissions?|capabilities?|service(Id|Token)?)$/i;

export type ValidatedBrowserRequest = Readonly<{
  query: URLSearchParams;
  body?: Readonly<Record<string, unknown>>;
  clientRequestId?: ClientRequestId;
}>;

export async function validateBrowserRequest(
  request: Request,
  policy: ChargeRoutePolicy,
  config: ChargeBffConfig,
  signal?: AbortSignal
): Promise<ValidatedBrowserRequest> {
  rejectAuthorityHeaders(request.headers);
  const query = canonicalQuery(new URL(request.url).searchParams, policy.queryKeys);
  if (policy.method === "GET") return Object.freeze({ query });

  validateOrigin(request.headers.get("origin"), config.publicOrigins);
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") throw new RequestValidationError(415, "CONTENT_TYPE_REQUIRED");
  const body = await readBoundedJson(
    request.body,
    config.requestBodyBytes,
    request.headers.get("content-length"),
    signal
  );
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new RequestValidationError(400, "JSON_OBJECT_REQUIRED");
  }
  const record = body as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (AUTHORITY_BODY.test(key)) throw new RequestValidationError(400, "AUTHORITY_FIELD_REJECTED");
    if (!policy.bodyFields.includes(key)) throw new RequestValidationError(400, "UNKNOWN_FIELD");
  }
  const clientRequestId = validateClientRequestId(
    request.headers.get("x-linercore-client-request-id"),
    policy.idempotencyMode === "FORWARD_DERIVED"
  );
  return Object.freeze({ query, body: Object.freeze({ ...record }), ...(clientRequestId
    ? { clientRequestId } : {}) });
}

export function safeIdentifier(value: string): SafeIdentifier {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new RequestValidationError(400, "IDENTIFIER_INVALID");
  }
  if (!SAFE_ID.test(decoded)) throw new RequestValidationError(400, "IDENTIFIER_INVALID");
  return decoded as SafeIdentifier;
}

export function canonicalQuery(input: URLSearchParams, allowed: readonly string[]): URLSearchParams {
  const output = new URLSearchParams();
  for (const key of new Set(input.keys())) {
    if (!allowed.includes(key)) throw new RequestValidationError(400, "QUERY_FIELD_INVALID");
    const values = input.getAll(key);
    if (values.length !== 1) throw new RequestValidationError(400, "QUERY_FIELD_DUPLICATE");
    const rawValue = values[0];
    if (rawValue.length > 256 || /[\u0000-\u001f\u007f]/.test(rawValue)) {
      throw new RequestValidationError(400, "QUERY_VALUE_INVALID");
    }
    const value = rawValue.trim();
    if (value) output.set(key, value);
  }
  output.sort();
  return output;
}

export function rejectAuthorityHeaders(headers: Headers): void {
  for (const [name] of headers) {
    if (AUTHORITY_HEADER.test(name)) {
      throw new RequestValidationError(400, "AUTHORITY_HEADER_REJECTED");
    }
  }
}

function validateOrigin(value: string | null, allowed: ReadonlySet<string>): void {
  if (!value) throw new RequestValidationError(403, "ORIGIN_DENIED");
  let origin: string;
  try {
    origin = new URL(value).origin;
  } catch {
    throw new RequestValidationError(403, "ORIGIN_DENIED");
  }
  if (origin !== value || !allowed.has(origin)) {
    throw new RequestValidationError(403, "ORIGIN_DENIED");
  }
}

function validateClientRequestId(value: string | null, required: boolean): ClientRequestId | undefined {
  if (!value && !required) return undefined;
  if (!value || !UUID.test(value) || value.toLowerCase() !== value) {
    throw new RequestValidationError(400, "CLIENT_REQUEST_ID_INVALID");
  }
  return value as ClientRequestId;
}

export class RequestValidationError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
    this.name = "RequestValidationError";
  }
}
