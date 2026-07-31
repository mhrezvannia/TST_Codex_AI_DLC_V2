import { BoundedStreamError, readBoundedBytes, decodeUtf8Fatal } from "./bounded-stream";
import { chargeErrorResponse } from "./errors";

const ALLOWED_STATUS = new Set([400, 401, 403, 404, 409, 413, 415, 422, 429, 500, 503]);
const SAFE_CODE = /^[A-Z][A-Z0-9_]{0,63}$/;

export async function normalizeChargeResponse(
  provider: Response,
  correlationId: string,
  maximumBytes: number,
  signal?: AbortSignal
): Promise<Response> {
  const contentType = provider.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return chargeErrorResponse(503, "CHARGE_REQUEST_FAILED", "Charge returned an invalid response", correlationId);
  }
  try {
    const bytes = await readBoundedBytes(
      provider.body,
      maximumBytes,
      provider.headers.get("content-length"),
      signal
    );
    const parsed = JSON.parse(decodeUtf8Fatal(bytes));
    if (provider.ok) {
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new SyntaxError("invalid success");
      }
      return Response.json(parsed, {
        status: provider.status,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-correlation-id": correlationId
        }
      });
    }
    const status = ALLOWED_STATUS.has(provider.status) ? provider.status : 503;
    const safe = safeProviderError(parsed, correlationId);
    if (!safe) {
      return chargeErrorResponse(status, "CHARGE_REQUEST_FAILED", "Charge request failed", correlationId);
    }
    return chargeErrorResponse(
      status,
      safe.code,
      safe.message,
      correlationId,
      safe.fields,
      safe.retryAfterSeconds
    );
  } catch (error) {
    const code = error instanceof BoundedStreamError && error.code === "BODY_TOO_LARGE"
      ? "CHARGE_RESPONSE_TOO_LARGE" : "CHARGE_REQUEST_FAILED";
    return chargeErrorResponse(503, code, "Charge returned an invalid response", correlationId);
  }
}

function safeProviderError(value: unknown, correlationId: string): {
  code: string;
  message: string;
  fields: Array<{ path: string; code: string; message: string }>;
  correlationId: string;
  retryAfterSeconds?: number;
} | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.code !== "string" || !SAFE_CODE.test(record.code)
    || typeof record.message !== "string" || record.message.length > 256) return null;
  const fields = Array.isArray(record.fields) ? record.fields.slice(0, 32).flatMap((field) => {
    if (!field || typeof field !== "object" || Array.isArray(field)) return [];
    const item = field as Record<string, unknown>;
    const path = typeof item.path === "string" ? item.path
      : typeof item.field === "string" ? item.field : "";
    const code = typeof item.code === "string" && SAFE_CODE.test(item.code)
      ? item.code : "INVALID";
    const message = typeof item.message === "string" ? item.message
      : typeof item.reason === "string" ? item.reason : "Invalid value";
    return path.length <= 128 && message.length <= 256 ? [{ path, code, message }] : [];
  }) : [];
  const retryAfterSeconds = typeof record.retryAfterSeconds === "number"
    && Number.isInteger(record.retryAfterSeconds)
    && record.retryAfterSeconds >= 1
    && record.retryAfterSeconds <= 300
    ? record.retryAfterSeconds : undefined;
  return { code: record.code, message: record.message, fields, correlationId, ...(retryAfterSeconds
    ? { retryAfterSeconds } : {}) };
}
