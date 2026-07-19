# Performance Design - U02 Booking Create Allow

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It implements the local Compose/Nginx performance design for shell `/booking/new` create and `/booking/[id]` detail retrieval with a real authorized subject.

## Design Decisions

| Decision | Design | Requirement coverage |
| --- | --- | --- |
| PERF-D01 | Keep the create path synchronous: browser -> Nginx -> `apps/shell`/Booking BFF -> booking-service -> identity-service -> booking-service persistence. | PERF-01, PERF-03 |
| PERF-D02 | Apply a bounded identity-service authorization timeout so create never hangs indefinitely; deny/error/timeout map to controlled fail-closed error. | PERF-03, REL-01 |
| PERF-D03 | Preserve existing Booking create payload size, validation, idempotency, and command body guard. | PERF-04, SEC-07 |
| PERF-D04 | After create success, route directly to `/booking/[id]` and load that detail without broad list reloads or unbounded polling. | PERF-02, SCALE-04 |
| PERF-D05 | Do not add cache, queue, CDN, background worker, or new runtime service for U02. | SCALE-03, NFR-07 |

## Latency Budget

| Segment | Local target | Notes |
| --- | --- | --- |
| Shell `/booking/new` render and submit through Nginx | Part of 5 second p95 create target | Excludes first container cold start. |
| Booking BFF validation/header creation | Request-local and synchronous | Actor, correlation, and idempotency are derived server-side. |
| booking-service authorization adapter to identity-service | Bounded inside 5 second p95 create target | Timeout fails closed before mutation. |
| booking-service persistence and response | Part of 5 second p95 create target | Uses existing W1 create behavior. |
| Shell `/booking/[id]` detail load | 3 second p95 after create success | Must retrieve persisted Booking by id/reference. |

## Optimization Strategy

- Keep create form state local to the existing Booking UI surface; do not introduce client global stores.
- Derive actor and correlation once per request and pass through existing service-header seams.
- Preserve existing idempotency behavior so duplicate submit handling stays in booking-service.
- Avoid broad list reloads after create; navigate to the created detail route and load only the required detail.
- Avoid dependencies prohibited by `tech-stack-decisions.md`: Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Preservation Boundary

U02 NFR Design preserves prior merged work by explicit boundary:

| Prior work | U02 NFR boundary |
| --- | --- |
| W0-01 platform/eventing | Do not redesign eventing, outbox, messaging, telemetry, or platform correlation infrastructure. U02 only carries existing correlation id through create/detail evidence. |
| W0-02 reference-data | Do not change reference-data seed/completeness surfaces or migrate reference-data UI. U02 consumes existing Booking create/detail behavior that may depend on reference data through stable interfaces only. |
| W1-01 Booking | Preserve existing Booking create/detail/idempotency behavior and W1 waiver wording. U02 adds real-subject authorization and shell routing only; it does not redefine Booking fields, validation semantics, or W1 live-proof status. |
| W2-02 design-system foundation | Do not add a broad design-system foundation or new styling stack. U02 may consume existing primitives/patterns and must record any design-system gap without taking ownership of W2-02. |

## Measurement Design

U02 evidence should record:

- Route opened through Nginx at `/booking/new`.
- Submit start/end timestamps.
- Actor subject and correlation id.
- identity-service authorization timing and allow decision where available.
- Created Booking id/reference.
- `/booking/[id]` detail start/end timestamps and retrieval result.

Performance PASS is not valid if create succeeds without retrievable detail, if Docker/Compose cannot start, or if evidence relies on direct app ports instead of the accepted Nginx route.

