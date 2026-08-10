import { RATE_POLICIES } from "./bff/policies";
import { proxyCharge } from "./bff/proxy-charge";
import { safeIdentifier } from "./bff/request-validation";
import type { ChargeRoutePolicy, SafeIdentifier } from "./bff/types";
import type { RateAction, RateProxyMethod } from "./rates";

/**
 * U01 compatibility adapter. It recognizes only the existing fixed Rate route
 * shapes and delegates to the shared U02 policy engine; unknown backend paths
 * fail before any network call.
 */
export function proxyRate(
  request: Request,
  backendPath: string,
  method: RateProxyMethod,
  requiredAction: RateAction
): Promise<Response> {
  const selected = selectRatePolicy(backendPath, method, requiredAction);
  return proxyCharge(request, selected.policy, {
    identifiers: selected.identifiers,
    query: selected.query
  });
}

export function hasRateCapability(permissions: string[], requiredAction: RateAction): boolean {
  return permissions.some((permission) => {
    const [resource, action = "read", scope] = permission.split(":");
    return resource === "charge-rates" && action === requiredAction && scope === undefined;
  });
}

function selectRatePolicy(
  backendPath: string,
  method: RateProxyMethod,
  action: RateAction
): {
  policy: ChargeRoutePolicy;
  identifiers?: Readonly<Record<string, SafeIdentifier>>;
  query?: URLSearchParams;
} {
  const parsed = new URL(backendPath, "http://fixed.internal");
  if (parsed.origin !== "http://fixed.internal") throw new Error("Unknown Rate route");
  if (parsed.pathname === "/api/charge-rates") {
    if (method === "GET" && action === "read") {
      return { policy: RATE_POLICIES.list, query: parsed.searchParams };
    }
    if (method === "POST" && action === "create" && !parsed.search) {
      return { policy: RATE_POLICIES.create };
    }
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments[0] !== "api" || segments[1] !== "charge-rates" || !segments[2]) {
    throw new Error("Unknown Rate route");
  }
  const identifiers: Record<string, SafeIdentifier> = {
    rateId: safeIdentifier(segments[2])
  };
  if (segments.length === 3 && method === "GET" && action === "read") {
    return { policy: RATE_POLICIES.detail, identifiers, query: parsed.searchParams };
  }
  if (segments[3] === "versions" && segments[4]) {
    identifiers.versionId = safeIdentifier(segments[4]);
    if (segments.length === 5 && method === "PUT" && action === "update" && !parsed.search) {
      return { policy: RATE_POLICIES.update, identifiers };
    }
    if (segments.length === 6 && segments[5] === "approve"
      && method === "POST" && action === "approve" && !parsed.search) {
      return { policy: RATE_POLICIES.approve, identifiers };
    }
    if (segments.length === 6 && segments[5] === "successor"
      && method === "POST" && action === "create-successor" && !parsed.search) {
      return { policy: RATE_POLICIES.successor, identifiers };
    }
  }
  throw new Error("Unknown Rate route");
}
