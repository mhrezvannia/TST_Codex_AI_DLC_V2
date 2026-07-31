# Functional Design Questions - U03 Authorized Degraded Journey Access

These questions specialize U03 from `unit-of-work.md` and
`unit-of-work-story-map.md` while preserving `requirements.md`, `components.md`,
`component-methods.md`, and `services.md`. They do not reopen decisions already
fixed by Application Design.

## Q1. Authorization and denial evidence

Which exact application-boundary behavior should govern fresh list, detail, and
capture requests?

- A. The use case evaluates the authenticated subject against the exact read or capture permission on every request; denial returns 403 `CMM_AUTHORIZATION_DENIED`, records actor/resource/action/reason/correlation audit, serves no newly requested data, and creates no movement/lifecycle/history/outbox/Booking effect. (recommended)
- B. REST alone checks roles and the application use case trusts the adapter.
- C. Cache the last successful authorization briefly so reads survive Identity outages.
- X. Other (please specify)

[Answer]: A - Per-request enforcement (Recommended)

## Q2. Identity unavailable behavior

How should Identity unavailability differ from a valid authorization denial?

- A. Fail every fresh list/detail/capture request closed with a retryable dependency-unavailable outcome and correlation; do not serve new journey data or evaluate capture, while already-rendered browser content may remain visibly stale and non-interactive. (recommended)
- B. Return the same 403 denial code and presentation as insufficient permission.
- C. Permit read-only access from cached entitlements but block capture.
- X. Other (please specify)

[Answer]: A - Fail closed (Recommended)

## Q3. Reference Data unavailable after authorization

After Identity authorizes the request but Reference Data freshness cannot be
confirmed, what exact read/capture split should apply?

- A. List/detail return persisted CMM facts with `freshness=last-known`, dependency reason, observed-at time, and Retry; UI disables capture, and direct capture returns a retryable Reference Data unavailable outcome before the idempotency claim with zero attempt/request/rejection/domain/outbox rows. (recommended)
- B. Fail the entire page and all API reads until Reference Data recovers.
- C. Allow capture against persisted reference values but mark the result provisional.
- X. Other (please specify)

[Answer]: A - Last-known reads (Recommended)

## Q4. UI state and recovery contract

Which Container Movement-owned component behavior should make denial and
degradation implementable without changing the shared shell or `packages/ui`?

- A. Reuse the U01 list/detail routes with an inline freshness/status strip, disabled capture panel plus reason, persistent focused error summary for direct denial/outage, and Retry that re-runs fresh authorization then reference checks; loading, empty/not-found, retryable error, denied, and degraded states keep keyboard/screen-reader semantics and never rely on color. (recommended)
- B. Replace the detail page with a global outage page whenever either dependency fails.
- C. Add new shared-shell navigation and global state for dependency health.
- X. Other (please specify)

[Answer]: A - Inline owned states (Recommended)
