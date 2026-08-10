import type { Capability as AuthCapability } from "@erp/auth";

export const CHARGE_BASE_PATH = "/charge-agreements" as const;
export const JSON_MEDIA_TYPE = "application/json" as const;
export const AGREEMENT_V2_MEDIA_TYPE =
  "application/vnd.linercore.charge-agreement-v2+json" as const;

export type Capability = Readonly<AuthCapability>;
export type AccessClass = "PUBLIC_HEALTH" | "COMMERCIAL" | "MANUAL_EVIDENCE";
export type BodyMode = "NONE" | "JSON" | "AGREEMENT_ACTOR_COMPAT";
export type IdempotencyMode = "NONE" | "FORWARD_DERIVED";
export type AssertionMode = "NONE" | "SUBJECT_ASSERTION_V1";
export type ChargeHttpMethod = "GET" | "POST" | "PUT";

export type AuthenticatedSubject = Readonly<{
  subjectId: string;
  subjectType: "user";
  displayName: string;
  capabilities: readonly Capability[];
}>;

export type ChargeRequestContext = Readonly<{
  correlationId: string;
  subject: AuthenticatedSubject;
  clientRequestId?: string;
  replayKey?: string;
}>;

export type SafeIdentifier = string & { readonly __safeIdentifier: unique symbol };
export type SafeCorrelationId = string & { readonly __safeCorrelationId: unique symbol };
export type SafeReturnUrl = string & { readonly __safeReturnUrl: unique symbol };
export type ClientRequestId = string & { readonly __clientRequestId: unique symbol };
export type ReplayKey = string & { readonly __replayKey: unique symbol };

export type ChargeRouteInput = Readonly<{
  identifiers?: Readonly<Record<string, SafeIdentifier>>;
  query?: URLSearchParams;
}>;

export type ChargeRoutePolicy = Readonly<{
  routeId: string;
  method: ChargeHttpMethod;
  requiredCapability: Capability;
  accessClass: Exclude<AccessClass, "PUBLIC_HEALTH">;
  bodyMode: BodyMode;
  idempotencyMode: IdempotencyMode;
  assertionMode: AssertionMode;
  backendAccept: typeof JSON_MEDIA_TYPE | typeof AGREEMENT_V2_MEDIA_TYPE;
  backendMutationContentType?: typeof JSON_MEDIA_TYPE | typeof AGREEMENT_V2_MEDIA_TYPE;
  maxResponseBytes: number;
  timeoutMs: number;
  queryKeys: readonly string[];
  bodyFields: readonly string[];
  backendPath: (input: ChargeRouteInput) => string;
}>;

export type ChargeFieldError = Readonly<{
  path: string;
  code: string;
  message: string;
}>;

export type ChargeBffError = Readonly<{
  code: string;
  message: string;
  fields: readonly ChargeFieldError[];
  correlationId: string;
  retryAfterSeconds?: number;
}>;

export type ChargeBffConfig = Readonly<{
  basePath: typeof CHARGE_BASE_PATH;
  chargeOrigin: string;
  referenceOrigin: string;
  publicOrigins: ReadonlySet<string>;
  chargeServiceToken: string;
  referenceServiceToken: string;
  referenceServiceId: string;
  assertionSecret: string;
  assertionKid: string;
  protectedPermits: number;
  referencePermits: number;
  permitWaitMs: number;
  chargeDeadlineMs: number;
  referenceDeadlineMs: number;
  egressDeadlineMs: number;
  requestBodyBytes: number;
  chargeResponseBytes: number;
  referenceResponseBytes: number;
}>;

export type ChargeConfigurationReadiness =
  | Readonly<{ ready: true; config: ChargeBffConfig }>
  | Readonly<{ ready: false; code: "CHARGE_CONFIGURATION_INVALID" }>;
