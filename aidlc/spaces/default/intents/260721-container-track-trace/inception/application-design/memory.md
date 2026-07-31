# Application Design Memory

## Interpretations

- 2026-07-21T18:36:36Z - Preserve the existing CMM service and aggregate seam; the approved brownfield intent says to refactor the existing journey intake rather than replace it, while new typed collaborators may narrow its responsibilities.
- 2026-07-21T18:36:36Z - Treat the AWS support perspective as a portability and operational-quality review only; the approved slice targets the canonical on-premises Compose topology and explicitly excludes public-cloud expansion.
- 2026-07-21T18:36:36Z - Treat RTK as unavailable for this intent because the binding Enterprise Technical Environment prohibits it; use server-rendered reads and focused local client state unless the user explicitly changes the standard.
- 2026-07-21T19:13:57Z - Last-known is business/reference freshness, never cached authorization; Identity must authorize every new read, while Reference Data outage after authorization can leave persisted route facts readable and capture disabled.

## Deviations

- 2026-07-21T18:36:36Z - Reject ui-ux-pro-max Enterprise Gateway, marketing, alternate palette/font, chart-first, and spinner-first recommendations; retain its dense operational, responsive table, validation, and accessibility guidance under the LinerCore master authority.

## Tradeoffs

- 2026-07-21T18:36:36Z - Prefer additive evolution at verified ports over new services or synchronous shortcuts; this minimizes regression risk while retaining explicit domain, persistence, event, Booking projection, authorization, and UI boundaries.
- 2026-07-21T19:13:57Z - Store an immutable idempotency disposition plus append-only per-attempt evidence; this adds persistence shape but makes accepted, rejected, replayed, conflicting-fingerprint, and concurrent outcomes implementable without double advancement.
- 2026-07-21T19:13:57Z - Fence outbox completion with worker, claim token, and monotonically increasing version; safe at-least-once redelivery is preferred to stale-worker state corruption.

## Open questions

- 2026-07-21T18:36:36Z - Confirm the seven unresolved architecture choices recorded in application-design-questions.md before producing component and ADR artifacts.
- 2026-07-21T19:13:57Z - None after iteration-1 review resolution; pending independent reviewer iteration 2.
- 2026-07-21T19:18:55Z - Reviewer iteration 2 exhausted the two-iteration limit with a NOT-READY verdict. The builder remediated every listed ownership, result-type, idempotency-replay, frontend-payload, and capture-attempt write-set mismatch, and both required sensors pass for all five outputs; no third independent READY verdict exists, so the approval gate must preserve that qualification explicitly.
