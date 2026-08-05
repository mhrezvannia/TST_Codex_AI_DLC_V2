# Functional Design Questions — U02 Charge Domain Routing and BFF

## Interaction Mode

Questions were limited to routing/security decisions that change observable behavior. The user did not return an alternative during the response window for Q1-Q3, so each clearly marked recommended continuation was applied. Q4-Q8 are resolved by binding upstream contracts and are recorded to prevent later implementation drift.

## Batch 1 — Authentication, correlation, and replay seam

### Q1. What should an unauthenticated Charge page request do?

- A. Redirect to `/auth/sign-in` with a validated same-origin Charge return URL; BFF/API requests still return 401 JSON. **(Recommended)**
- B. Render the same denied page used for an authenticated user without permission.
- C. Return raw 401 behavior for pages and BFF calls.

[Answer]: A — page requests redirect through the existing Auth surface with a base-path-constrained `returnUrl`; BFF calls return 401. (Recommended continuation applied after no alternative response.)

### Q2. Which correlation-ID policy should the BFF use?

- A. Propagate only a safe bounded inbound/nginx ID; otherwise mint a UUID and echo it. **(Recommended)**
- B. Always mint a new BFF UUID.
- C. Trust any inbound value unchanged.

[Answer]: A — accept only `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`; otherwise use `createCorrelationId()`. (Recommended continuation applied after no alternative response.)

### Q3. How should administration mutations expose an idempotency seam?

- A. Validate a client request UUID, derive a subject/operation-scoped opaque key at the BFF, and forward it only to service operations that opt in. **(Recommended)**
- B. Forward the browser's `Idempotency-Key` unchanged.
- C. Use no replay key and rely only on optimistic state.

[Answer]: A — derive `charge-ui:v1:<sha256>` from length-prefixed subject, route policy, stable target, expected version, and client request UUID. This is an honest forwarding seam: service-backed replay is claimed only by an endpoint that persists/recognizes the key. (Recommended continuation applied after no alternative response.)

## Binding Contract Resolutions

### Q4. May the BFF expose a generic browser-selected backend path?

[Answer]: No. Route handlers select a compile-time `ChargeRoutePolicy`; browser path/query input is parsed through that policy and cannot choose host, scheme, or arbitrary backend path.

The same policy owns backend media. JSON is the default, while U03 Agreement administration policies set exact `application/vnd.linercore.charge-agreement-v2+json` for backend Accept and mutation Content-Type. This is a compile-time domain-policy override, not browser negotiation; LEGACY compatibility policies remain explicit JSON-only entries.

### Q5. What is disclosed when manual-case capability is absent?

[Answer]: Return 403 `CHARGE_ACCESS_DENIED` with correlation only. Do not disclose case existence, counts, Booking reference, reason, timestamps, or distinguish unknown from protected case IDs. `charge-manual-cases:read` is explicit Pricing capability; Charge read alone is insufficient.

### Q6. Is the base-path health route authenticated?

[Answer]: No. `/charge-agreements/api/health` is a minimal public liveness response containing service/status only. It discloses no session, dependency, commercial, build-secret, or environment data.

### Q7. How are backend failures normalized?

[Answer]: Preserve allowed HTTP status and safe typed code/message/fields/correlation; replace malformed, HTML, oversized, stack-bearing, or secret-bearing payloads with a standard safe Charge code. Never convert a non-2xx into a successful skeleton/fallback payload.

### Q8. Which route-level UI states does U02 own?

[Answer]: Charge-local `loading.tsx`, `error.tsx`, `not-found.tsx`, and authenticated denied composition under the existing App Router/base path. Domain data/forms remain U01/U03/U04-owned; shared shell, navigation, tokens, typography, palette, and `packages/ui` remain unchanged.

## Mandatory Ambiguity Scan

- Business logic: edge mount, session derivation, capability mapping, correlation, origin/body checks, actor stripping/injection, replay forwarding, timeout, and error normalization are explicit.
- Data: request context, route policy, error envelope, return URL, correlation, and client request token shapes are explicit; U02 creates no commercial persistence.
- UI: all four U02 route-state pages were queried through `ui-ux-pro-max`; loading, recovery, not-found return context, denied non-disclosure, focus, live regions, reduced motion, and responsive behavior are covered.
- Integration: nginx preservation, basePath assets/deep links, Compose health, Wave A 18088, manager 8088 exclusion, and regression routes are explicit.
