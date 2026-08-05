import type { ChargeRoutePolicy } from "./types";

const ROUTE_ID = /^[a-z0-9][a-z0-9.-]{0,79}$/;

export function defineChargeRoutePolicy(policy: ChargeRoutePolicy): ChargeRoutePolicy {
  if (!ROUTE_ID.test(policy.routeId)) {
    throw new Error("Charge route policy has an invalid routeId");
  }
  if (!policy.requiredCapability.resource || !policy.requiredCapability.action) {
    throw new Error(`Charge route policy ${policy.routeId} has no exact capability`);
  }
  if (policy.maxResponseBytes < 1 || policy.maxResponseBytes > 512 * 1024) {
    throw new Error(`Charge route policy ${policy.routeId} has an invalid response limit`);
  }
  if (policy.timeoutMs < 1 || policy.timeoutMs > 2500) {
    throw new Error(`Charge route policy ${policy.routeId} has an invalid deadline`);
  }
  if (policy.method === "GET" && policy.bodyMode !== "NONE") {
    throw new Error(`Charge route policy ${policy.routeId} cannot read a body`);
  }
  if (policy.method !== "GET" && !policy.backendMutationContentType) {
    throw new Error(`Charge route policy ${policy.routeId} has no fixed mutation media`);
  }
  if (policy.assertionMode === "SUBJECT_ASSERTION_V1"
    && !policy.backendAccept.includes("charge-agreement-v2")
    && !(policy.accessClass === "MANUAL_EVIDENCE" && policy.backendAccept === "application/json")) {
    throw new Error(`Charge route policy ${policy.routeId} assertion has incompatible backend media`);
  }
  return Object.freeze({
    ...policy,
    requiredCapability: Object.freeze({ ...policy.requiredCapability }),
    queryKeys: Object.freeze([...policy.queryKeys]),
    bodyFields: Object.freeze([...policy.bodyFields])
  });
}
