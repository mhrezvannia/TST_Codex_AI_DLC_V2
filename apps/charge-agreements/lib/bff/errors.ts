import type { ChargeBffError, ChargeFieldError } from "./types";

const SAFE_CODE = /^[A-Z][A-Z0-9_]{0,63}$/;

export function chargeErrorResponse(
  status: number,
  code: string,
  message: string,
  correlationId: string,
  fields: readonly ChargeFieldError[] = [],
  retryAfterSeconds?: number
): Response {
  const safeCode = SAFE_CODE.test(code) ? code : "CHARGE_REQUEST_FAILED";
  const body: ChargeBffError = {
    code: safeCode,
    message: bounded(message, 256, "Charge request failed"),
    fields: fields.slice(0, 32).map((field) => ({
      path: bounded(field.path, 128, ""),
      code: SAFE_CODE.test(field.code) ? field.code : "INVALID",
      message: bounded(field.message, 256, "Invalid value")
    })),
    correlationId,
    ...(retryAfterSeconds && retryAfterSeconds >= 1 && retryAfterSeconds <= 300
      ? { retryAfterSeconds } : {})
  };
  return Response.json(body, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-correlation-id": correlationId
    }
  });
}

function bounded(value: string, maximum: number, fallback: string): string {
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return normalized && normalized.length <= maximum ? normalized : fallback;
}
