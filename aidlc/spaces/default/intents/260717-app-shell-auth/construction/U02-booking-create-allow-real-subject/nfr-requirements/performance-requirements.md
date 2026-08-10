# Performance Requirements - U02 Booking Create Allow

## Source Context

These performance requirements consume U02 `business-logic-model.md`, U02 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U02 runs on the existing Next.js/Yarn, Java/Spring, identity-service, booking-service, Docker Compose, Nginx, and PostgreSQL stack.

## Local Acceptance Targets

| ID | Requirement | Measurement |
| --- | --- | --- |
| PERF-01 | Shell `/booking/new` submit through Nginx should receive create success or controlled authorization/business error within 5 seconds p95 in local proof, excluding first cold start. | Scenario transcript timestamps. |
| PERF-02 | Created Booking detail at `/booking/[id]` should load within 3 seconds p95 after create success. | Scenario transcript timestamps. |
| PERF-03 | identity-service authorization call should have a bounded timeout and must not hang the Booking create flow indefinitely. | Code/config review and timeout-path test. |
| PERF-04 | U02 must preserve existing Booking create payload size and BFF command body guard unless a W2-01-specific reason is recorded. | Code/config review. |

## Resource Constraints

- Do not add caches, queues, or new runtime services for the allow path.
- Preserve existing booking-service persistence model and W1 create/detail behavior.
- Avoid client state libraries or styling/runtime dependencies prohibited by NFR-07.

## Benchmark Evidence

U02 evidence records create and detail timings, identity authorization timing where available, actor subject, and correlation id. Performance PASS cannot be claimed if the created Booking is not retrievable from `/booking/[id]`.

## Architecture Review - NFR Requirements

Verdict: READY

Findings:

1. Upstream coverage is sufficient. The NFR set traces to U02 `business-logic-model.md`, `business-rules.md`, W2-01 `requirements.md`, and the active workspace technology stack. The reviewed sources cover the required live path: shell `/booking/new`, Booking BFF create, booking-service authorization, identity-service allow decision, Booking persistence, and shell `/booking/[id]` retrieval.
2. Performance targets are implementable for a local Compose proof. PERF-01 and PERF-02 set bounded create/detail response targets through Nginx while excluding cold start, PERF-03 requires bounded identity authorization timeout behavior, and PERF-04 preserves existing command body/idempotency constraints rather than adding new queues, caches, or runtime services.
3. Security targets are implementable and aligned with U02. The requirements require `local.booking.user`, identity-service authorization before mutation, fail-closed deny/error/timeout handling, server-side actor derivation with no `local-user` fallback, raw tokens remaining server-side, idempotency preservation, and correlation-backed evidence.
4. Scalability and reliability targets are appropriately scoped. U02 keeps authorization state in identity-service, Booking state/idempotency in booking-service, avoids client global stores and new infrastructure, preserves W1 create/detail behavior, and treats create-without-detail or runtime blocker evidence as acceptance failure rather than PASS.
5. Tech-stack constraints resolve to the approved brownfield stack. The NFRs stay within existing Next.js/React/TypeScript, Java/Spring, identity-service, Docker Compose, Nginx, Keycloak, and PostgreSQL surfaces, and explicitly prohibit cloud additions, micro-frontend expansion, and prohibited frontend libraries.
6. Concrete code seams exist for implementation. The current graph shows identity-service `POST /internal/identity/authorize`, Booking BFF `serviceHeaders`, booking-service `BookingApiController.actor`, and `BookingLocalIdentityFilter`; the known `local-user` fallback/filter constraints are covered by the U02 NFRs as changes to make, not unresolved architecture.

Required changes: none.
