import { sessionFromRequest } from "@erp/auth";
import { resolveCorrelationId } from "./correlation";
import { chargeErrorResponse } from "./errors";
import { authenticatedSubjectFromSession, hasCapability } from "./session";
import type {
  ChargeRequestContext,
  ChargeRoutePolicy
} from "./types";

export type ContextResult =
  | Readonly<{ ok: true; context: ChargeRequestContext }>
  | Readonly<{ ok: false; response: Response }>;

export function buildChargeRequestContext(
  request: Request,
  policy: ChargeRoutePolicy
): ContextResult {
  const correlationId = resolveCorrelationId(request.headers.get("x-correlation-id"));
  const session = sessionFromRequest(request);
  const subject = authenticatedSubjectFromSession(session);
  if (!subject) {
    return { ok: false, response: chargeErrorResponse(
      401,
      "CHARGE_AUTH_REQUIRED",
      "Authentication is required",
      correlationId
    ) };
  }
  if (!hasCapability(subject, policy.requiredCapability)) {
    return { ok: false, response: chargeErrorResponse(
      403,
      "CHARGE_ACCESS_DENIED",
      "This Charge operation is not permitted",
      correlationId
    ) };
  }
  return { ok: true, context: Object.freeze({ correlationId, subject }) };
}
