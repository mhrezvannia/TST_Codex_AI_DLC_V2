# Reliability Requirements - U02 Charge Domain Routing and BFF

## Reliability boundary

The Charge BFF is stateless and has no data RPO of its own. Its reliability duty
is deterministic routing, fail-closed access, bounded forwarding, safe recovery,
and preservation of existing edge routes. U02 defines no production availability
SLA or fallback authority.

## Routing and restart objectives

- REL-U02-001: `/charge-agreements` returns exact 308 to
  `/charge-agreements/`; list/detail deep links, reloads, route handlers, and
  emitted Next assets retain the base path through nginx.
- REL-U02-002: `/charge-agreements/api/health` returns only the exact minimal
  public schema directly and through nginx; readiness is false for invalid
  required non-local secrets/configuration. Liveness is not proof that protected
  forwarding works.
- REL-U02-003: after a normal isolated-stack app restart with healthy
  dependencies, health and one authenticated protected read succeed within 120
  seconds from restart-command acceptance. This is a local bound, not an SLO.
- REL-U02-004: `/`, `/auth`, `/reference-data`, `/booking`, and `/bookings`
  retain their pre-U02 upstream/path/status behavior. The test operates only on
  `linercore-wave-a` at 18088; 8088 is probe-only via `npm run demo:guard`.

## Failure and recovery matrix

| Failure | Required behavior | Recovery |
| --- | --- | --- |
| invalid session | page safe Auth redirect; BFF 401; no backend call | establish valid session |
| exact capability denial | 403, no protected metadata/backend call | request correct grant |
| cross-origin/media/body/query violation | 403/415/413/400 before forwarding | correct request, deliberate resubmit |
| backend timeout/transport | 503 `CHARGE_SERVICE_UNAVAILABLE`; no fallback success | explicit read retry or operator-confirmed mutation reconciliation |
| malformed 2xx JSON, malformed non-2xx JSON, HTML/other non-JSON, or >512 KiB backend | exact 503 `CHARGE_REQUEST_FAILED`; provider content discarded; bounded abort | repair backend; explicit retry |
| downstream 400/404/409/422/429/500/503 | preserve allowed status and normalized safe fields | domain-specific refresh/correction/retry |
| process stop before forwarding | no downstream effect | explicit retry |
| lost response after mutation forwarding | never assume failure or auto-retry | read authoritative state/receipt, then deliberate retry only if valid |
| bad basePath/proxy config | health/deep-link/asset gate fails; no release | correct config and restart |

The BFF never converts a provider error into 200 module/skeleton data. Page
error reset preserves safe route/query context. Not-found is shown only after
authorization; denied and missing records cannot leak protected distinctions.

## Idempotency and correlation

Read forwarding is naturally repeatable but uses `no-store`. Mutation forwarding
derives a stable opaque key from signed subject, literal route, stable target,
expected version, and one deliberate client UUID only where policy enables it.
That key prevents no duplicate by itself: durable replay is asserted only when
the downstream service persists and returns a receipt. Otherwise optimistic
version/state/uniqueness plus reconciliation are the safety controls.

One selected correlation ID must join browser-facing response, BFF access
decision, fixed backend request/response, downstream authorization, and activity
or no-write evidence. Logs/metrics remain redacted and low-cardinality.

## Verification

Automated tests cover exact/prefix nginx locations, path preservation, assets,
top-level 404 versus protected-record not-found, all failure rows, restart, and
preservation routes. U06 supplies live Compose, Playwright, correlation,
Booking-visible, demo-guard-before/after, audit, and fidelity evidence. Until
observed there, Docker/live status remains unobserved rather than PASS.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`; it preserves their exact route,
failure, idempotency-truthfulness, isolated runtime, and W1-history contracts.
