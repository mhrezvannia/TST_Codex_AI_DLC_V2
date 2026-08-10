import { BoundedStreamError } from "./bounded-stream";
import { chargeConfigurationReadiness } from "./config";
import { chargeErrorResponse } from "./errors";
import {
  FairSemaphore,
  FairSemaphoreCapacityError,
  type PermitLease
} from "./fair-semaphore";
import {
  finishTrackedController,
  isChargeDraining,
  linkAbortSignal,
  responseWithPermit,
  trackedAbortController
} from "./lifecycle";
import { deriveReplayKey } from "./replay-key";
import { buildChargeRequestContext } from "./request-context";
import {
  RequestValidationError,
  safeIdentifier,
  validateBrowserRequest
} from "./request-validation";
import { normalizeChargeResponse } from "./response-normalizer";
import { issueSubjectAssertion } from "./subject-assertion";
import type { ChargeRouteInput, ChargeRoutePolicy, SafeIdentifier } from "./types";

const protectedPool = new FairSemaphore(20);

export type ProxyChargeInput = Readonly<{
  identifiers?: Readonly<Record<string, string>>;
  query?: URLSearchParams;
}>;

export async function proxyCharge(
  request: Request,
  policy: ChargeRoutePolicy,
  input: ProxyChargeInput = {}
): Promise<Response> {
  const contextResult = buildChargeRequestContext(request, policy);
  if (!contextResult.ok) return contextResult.response;
  const { context } = contextResult;
  const readiness = chargeConfigurationReadiness();
  if (!readiness.ready || isChargeDraining()) {
    return chargeErrorResponse(503, "CHARGE_CONFIGURATION_INVALID",
      "Charge forwarding is not ready", context.correlationId);
  }
  const config = readiness.config;
  const controller = trackedAbortController();
  const unlinkRequest = linkAbortSignal(request.signal, controller);
  const deadline = setTimeout(() => controller.abort(), policy.timeoutMs);
  let lease: PermitLease | null = null;
  let transferred = false;
  try {
    const identifiers = parseRouteIdentifiers(input.identifiers);
    lease = await protectedPool.acquire(config.permitWaitMs, controller.signal);
    if (!lease) {
      return chargeErrorResponse(503, "CHARGE_CAPACITY_EXHAUSTED",
        "Charge forwarding capacity is busy", context.correlationId);
    }
    const validated = await validateBrowserRequest(request, policy, config, controller.signal);
    const routeInput: ChargeRouteInput = Object.freeze({
      identifiers,
      query: input.query ?? validated.query
    });
    const backendPath = policy.backendPath(routeInput);
    const headers = backendHeaders(policy, config, context.subject.subjectId, context.correlationId, backendPath);
    let bodyRecord = validated.body;
    if (policy.bodyMode === "AGREEMENT_ACTOR_COMPAT") {
      bodyRecord = Object.freeze({ ...(validated.body ?? {}), actorSubjectId: context.subject.subjectId });
    }
    if (policy.idempotencyMode === "FORWARD_DERIVED" && validated.clientRequestId) {
      const expectedVersion = typeof bodyRecord?.expectedVersion === "string"
        || typeof bodyRecord?.expectedVersion === "number"
        ? bodyRecord.expectedVersion : undefined;
      headers.set("idempotency-key", deriveReplayKey({
        subjectId: context.subject.subjectId,
        routeId: policy.routeId,
        targetId: Object.values(identifiers ?? {})[0],
        expectedVersion,
        clientRequestId: validated.clientRequestId
      }));
    }
    const provider = await fetch(`${config.chargeOrigin}${backendPath}`, {
      method: policy.method,
      headers,
      ...(policy.method === "GET" ? {} : { body: JSON.stringify(bodyRecord ?? {}) }),
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal
    });
    const normalized = await normalizeChargeResponse(
      provider,
      context.correlationId,
      policy.maxResponseBytes,
      controller.signal
    );
    clearTimeout(deadline);
    const browserResponse = responseWithPermit(
      normalized,
      lease,
      config.egressDeadlineMs,
      () => {
        unlinkRequest();
        controller.abort();
        finishTrackedController(controller);
      }
    );
    transferred = true;
    return browserResponse;
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return chargeErrorResponse(error.status, error.code, validationMessage(error.code), context.correlationId);
    }
    if (error instanceof FairSemaphoreCapacityError) {
      return chargeErrorResponse(503, "CHARGE_CAPACITY_EXHAUSTED",
        "Charge forwarding capacity is busy", context.correlationId);
    }
    if (error instanceof BoundedStreamError) {
      const status = error.code === "BODY_TOO_LARGE" ? 413 : 400;
      return chargeErrorResponse(status, error.code, "Charge request body is invalid", context.correlationId);
    }
    if (error instanceof SyntaxError && error.message === "JSON_INVALID") {
      return chargeErrorResponse(400, "JSON_INVALID", "Charge request body must be valid JSON", context.correlationId);
    }
    return chargeErrorResponse(503, "CHARGE_SERVICE_UNAVAILABLE",
      "Charge service is unavailable", context.correlationId);
  } finally {
    clearTimeout(deadline);
    if (!transferred) {
      unlinkRequest();
      lease?.release();
      controller.abort();
      finishTrackedController(controller);
    }
  }
}

function parseRouteIdentifiers(
  values: Readonly<Record<string, string>> | undefined
): Readonly<Record<string, SafeIdentifier>> | undefined {
  if (!values) return undefined;
  return Object.freeze(Object.fromEntries(
    Object.entries(values).map(([name, value]) => [name, safeIdentifier(value)])
  ));
}

function backendHeaders(
  policy: ChargeRoutePolicy,
  config: Extract<ReturnType<typeof chargeConfigurationReadiness>, { ready: true }>["config"],
  subjectId: string,
  correlationId: string,
  backendPath: string
): Headers {
  const headers = new Headers({
    accept: policy.backendAccept,
    "x-correlation-id": correlationId,
    "x-linercore-service-id": "charge-agreements-bff",
    "x-linercore-service-token": config.chargeServiceToken
  });
  if (policy.backendMutationContentType) {
    headers.set("content-type", policy.backendMutationContentType);
  }
  if (policy.assertionMode === "SUBJECT_ASSERTION_V1") {
    headers.set("x-linercore-subject-assertion", issueSubjectAssertion({
      kid: config.assertionKid,
      secret: config.assertionSecret,
      subjectId,
      method: policy.method,
      path: backendPath.split("?", 1)[0],
      correlationId
    }).headerValue);
  } else {
    headers.set("x-actor-subject", subjectId);
  }
  return headers;
}

function validationMessage(code: string): string {
  const messages: Record<string, string> = {
    AUTHORITY_HEADER_REJECTED: "Authority headers are derived from the signed session",
    AUTHORITY_FIELD_REJECTED: "Authority fields are derived from the signed session",
    ORIGIN_DENIED: "The mutation origin is not allowed",
    CONTENT_TYPE_REQUIRED: "Charge mutations require application/json",
    CLIENT_REQUEST_ID_INVALID: "A canonical client request UUID is required",
    QUERY_FIELD_INVALID: "The query contains an unsupported field",
    QUERY_FIELD_DUPLICATE: "Query fields must be single-valued",
    IDENTIFIER_INVALID: "The route identifier is invalid",
    UNKNOWN_FIELD: "The request contains an unsupported field"
  };
  return messages[code] ?? "The Charge request is invalid";
}

export const protectedForwardingPoolForTests = protectedPool;
