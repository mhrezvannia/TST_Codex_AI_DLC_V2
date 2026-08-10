# Performance Design - U03 Booking Deny

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It implements local Compose/Nginx performance design for the authenticated `local.reference.admin` deny flow inside the shell.

## Design Decisions

| Decision | Design | Requirement coverage |
| --- | --- | --- |
| PERF-D01 | Keep the deny path synchronous: shell `/booking` -> Booking BFF -> booking-service -> identity-service -> 403/denied shell state. | PERF-01, SEC-02 |
| PERF-D02 | Apply bounded identity-service authorization timeout so unauthorized users do not remain in indefinite loading. | PERF-02, REL-02 |
| PERF-D03 | Render a lightweight denied state inside the shell frame; do not substitute an empty list or hidden route as a shortcut. | PERF-01, REL-01 |
| PERF-D04 | Do not poll, loop, or automatically retry authorization after a deny decision. | PERF-03, SCALE-02 |
| PERF-D05 | Do not add policy-admin UI, cache, CDN, queue, or new authorization infrastructure for U03. | SCALE-03, NFR-07 |

## Latency Budget

| Segment | Local target | Notes |
| --- | --- | --- |
| Nginx to protected shell `/booking` | Part of 3 second p95 deny target | Excludes first container cold start. |
| Booking BFF actor/correlation preparation | Request-local and synchronous | Uses authenticated `local.reference.admin`. |
| booking-service to identity-service deny check | Bounded inside 3 second p95 target | Timeout maps to fail-closed authorization error. |
| Denied shell render | Part of 3 second p95 deny target | One visible denied state with safe recovery actions. |

## Optimization Strategy

- Keep denied UI static/lightweight once the deny response returns.
- Avoid global client authorization state and repeated polling.
- Preserve existing Booking read/action request shape; only map deny into an explicit shell state.
- Capture deny timing and correlation in evidence rather than adding performance instrumentation services.
- Avoid dependencies prohibited by `tech-stack-decisions.md`: Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Preservation Boundary

U03 NFR Design preserves prior merged work by explicit boundary:

| Prior work | U03 NFR boundary |
| --- | --- |
| W0-01 platform/eventing | Do not redesign eventing, outbox, messaging, telemetry, or platform correlation infrastructure. U03 only carries existing correlation id through deny evidence. |
| W0-02 reference-data | Do not change reference-data seed/completeness surfaces or migrate reference-data UI. U03 preserves `local.reference.admin` semantics relevant to reference-data work while proving it lacks Booking access. |
| W1-01 Booking | Preserve existing Booking read/action behavior and W1 waiver wording. U03 changes denied-state mapping and real-subject authorization only; it does not redefine Booking fields, queries, create/detail/action flows, or W1 live-proof status. |
| W2-02 design-system foundation | Do not add a broad design-system foundation or new styling stack. U03 may consume existing primitives/patterns and must record any gap without taking ownership of W2-02. |

## Measurement Design

U03 evidence should record:

- Route opened through Nginx at `/booking`.
- Authenticated subject `local.reference.admin`.
- Authorization request action/resource and deny decision timing where available.
- Deny response status/state.
- Shell denied-state render timestamp.
- Correlation id and safe decision reference.

Performance PASS is not valid if the denied path is represented by an empty list, hidden route, direct app port evidence, or a W1 waiver rewrite.

