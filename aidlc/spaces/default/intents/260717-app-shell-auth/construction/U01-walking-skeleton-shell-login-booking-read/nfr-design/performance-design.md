# Performance Design - U01 Walking Skeleton

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It implements local Compose/Nginx performance targets for the U01 protected shell and Booking read path.

## Design Decisions

| Decision | Design | Requirement coverage |
| --- | --- | --- |
| PERF-D01 | Keep the existing synchronous browser -> Nginx -> `apps/shell` -> Booking BFF -> booking-service read path. | PERF-01, PERF-02 |
| PERF-D02 | Preserve the existing Booking BFF backend fetch timeout at 2500 ms for U01 unless code generation records a W2-01-specific reason. | PERF-03, REL-03 |
| PERF-D03 | Do not add cache, CDN, queue, background worker, or new runtime service for U01. | PERF-04, SCALE-03 |
| PERF-D04 | Capture route timing in U01 evidence for auth redirect/return and authenticated `/booking` read. | PERF-01, PERF-02 |

## Latency Budget

| Segment | Local target | Notes |
| --- | --- | --- |
| Nginx to shell protected route | Part of 3 second p95 route target | Excludes first container cold start. |
| Auth redirect/return | Part of 3 second p95 proof transcript target | Keycloak availability is runtime evidence, not a new performance service. |
| Shell to Booking BFF/server read | Part of 3 second p95 authenticated `/booking` target | Actor resolution is request-local. |
| Booking BFF to booking-service | Bounded by existing 2500 ms timeout | Failure maps to recoverable error with correlation id. |

## Optimization Strategy

- Use server-side rendering and existing Next.js App Router patterns; avoid broad client state.
- Keep actor resolution as a cheap request-scoped operation from the safe session summary.
- Preserve existing Booking read/list query behavior; do not redesign booking-service queries in U01.
- Avoid adding dependencies prohibited by `tech-stack-decisions.md`: Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Preservation Boundary

U01 NFR Design preserves prior merged work by explicit boundary:

| Prior work | U01 NFR boundary |
| --- | --- |
| W0-01 platform/eventing | Do not redesign eventing, outbox, messaging, telemetry, or platform correlation infrastructure. U01 only carries or records the existing correlation id needed for the shell-to-Booking read proof. |
| W0-02 reference-data | Do not change reference-data seed/completeness surfaces or migrate reference-data UI. U01 consumes existing Booking read behavior that may depend on reference data through stable interfaces only. |
| W1-01 Booking | Preserve existing Booking read/list behavior and W1 waiver wording. U01 changes shell/session actor propagation only; it does not redefine Booking fields, query semantics, create/detail/action flows, or W1 live-proof status. |
| W2-02 design-system foundation | Do not add a broad design-system foundation or new styling stack. U01 may consume existing primitives/patterns and must record any gap without taking ownership of W2-02. |

## Measurement Design

U01 evidence should record:

- Route opened through Nginx.
- Auth redirect/return timestamps.
- Authenticated `/booking` request start/end timestamps.
- Booking BFF/backend correlation id.
- Timeout/error state if booking-service is unavailable.

Performance PASS is not valid if Docker/Compose cannot start; record a W2-01 blocker instead.

## Architecture Review - 2026-07-18

Status: NOT-READY.

Finding AR-01: The NFR design set does not explicitly preserve the W0-01, W0-02, W1-01, and W2-02 boundaries required for U01. The reviewed artifacts preserve several local-scope boundaries in prose, including no cache/CDN/new runtime service, no cloud scope, existing Booking read/list behavior, and existing auth reuse, but they do not name the W0-01/W0-02/W1-01/W2-02 preservation contracts. Code generation would have to infer which prior surfaces are protected from change, so the design is not implementable without architectural clarification.

Required change: add an explicit preservation-boundary statement tying U01 NFR design to W0-01, W0-02, W1-01, and W2-02 before approval.

## Architecture Review - Iteration 2 - 2026-07-18

Status: READY.

The iteration-1 blocker is resolved. The U01 NFR design set now explicitly scopes W2-01 as a local Compose/Nginx app-shell/auth walking skeleton, preserves W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation boundaries, keeps the W1 live-proof waiver as BLOCKED at `compose-start`, and avoids AWS/cloud/CDN/cache/new runtime services and prohibited frontend dependencies.
