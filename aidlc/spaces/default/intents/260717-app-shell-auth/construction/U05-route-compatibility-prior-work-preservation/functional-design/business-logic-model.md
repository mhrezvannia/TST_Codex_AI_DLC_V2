# Business Logic Model - U05 Route Compatibility and Preservation

## Source Context

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U05 proves old `/bookings*` URLs remain usable while canonical shell routes are `/booking*`, and it captures preservation evidence for W0-01, W0-02, W1-01, and W2-02.

## Workflow

| Step | Component | Processing | Output |
| --- | --- | --- | --- |
| 1 | Browser/Nginx | User opens `/bookings`, `/bookings/new`, or `/bookings/[id]`. | Compatibility request. |
| 2 | Shell/Nginx route adapter | Redirect or internally resolve to `/booking`, `/booking/new`, or `/booking/[id]`. | Canonical shell route. |
| 3 | Shell protected route | Reuse authenticated session and actor propagation from prior units. | Protected shell context. |
| 4 | Booking mounted UI | Run preserved list/detail/create behavior inside shell. | Existing Booking behavior visible. |
| 5 | Preservation check | Review W2-01 diff for W0-01/W0-02/W1-01/W2-02 touches. | Preservation record. |
| 6 | Targeted verification | Run targeted checks for any touched prior-work file. | Evidence tied to touch reason. |
| 7 | W1 waiver check | Confirm W1 live-proof waiver remains BLOCKED at `compose-start`. | Explicit waiver reference. |

## Route Mapping

| Compatibility route | Canonical route | Required behavior |
| --- | --- | --- |
| `/bookings` | `/booking` | Redirect or resolve to shell Booking list. |
| `/bookings/new` | `/booking/new` | Redirect or resolve to shell Booking create. |
| `/bookings/[id]` | `/booking/[id]` | Redirect or resolve to shell Booking detail. |

## Preservation Checks

| Prior work | U05 rule | Evidence |
| --- | --- | --- |
| W0-01 platform/eventing | Do not redesign eventing, outbox, messaging, or telemetry. | Diff review and targeted tests only if touched. |
| W0-02 reference-data | Consume stable lookup interfaces; do not alter seed/completeness surfaces or migrate UI. | Diff review and targeted verification for any reference-data touch. |
| W1-01 Booking | Preserve list/detail/create/action semantics; shell/session actor changes only. | Live list/detail/create checks inside shell. |
| W2-02 design-system foundation | Consume existing primitives; do not build broad foundation. | Diff review for design-system files. |

## Failure Paths

| Failure | Behavior |
| --- | --- |
| `/bookings*` returns standalone Booking outside shell | U05 fails; compatibility must land in shell route context. |
| Compatibility loses actor propagation | U05 fails; protected calls still require session actor. |
| Prior-work file touched without W2-01 reason | U05 fails until reason and targeted verification are recorded. |
| W1 waiver rewritten as PASS | U05 fails; waiver must remain BLOCKED at `compose-start`. |

## Traceability

| Requirement/story | U05 behavior |
| --- | --- |
| FR-04, FR-09, US-03, US-04 | Booking route compatibility and mounted behavior inside shell. |
| NFR-06, NFR-10 | Prior-work preservation through scoped diff and targeted checks. |
| NFR-07 | Route/adapter frontend work stays in approved stack. |
| Acceptance Criteria 8, 10, 11 | W1 waiver stays explicit; W0/W1/W2 preservation is evidence-backed. |

## Architecture Review - 2026-07-18

Status: READY

Required changes: none.

Findings:

- No blocking findings. The artifacts cover `/bookings`, `/bookings/new`, and `/bookings/[id]` compatibility to canonical `/booking`, `/booking/new`, and `/booking/[id]` routes while keeping shell chrome, breadcrumbs, protected session, and actor propagation in scope.
- Upstream preservation coverage is explicit for W0-01, W0-02, W1-01, and W2-02 through scoped diff review, W2-01-specific touch reasons, and targeted verification for touched prior-work files.
- W1 live-proof waiver handling is preserved as BLOCKED at `compose-start`; the design does not rewrite it to PASS or drop it from evidence.
- NFR-07 constraints are implementable because the frontend rules stay within existing Next.js, React, and TypeScript patterns and explicitly prohibit broad state, styling, or legacy-library additions.
- Scope is contained. The design consumes W2-02 primitives without rebuilding the foundation and does not introduce W4-01 migration work, reference-data migration, charge agreement migration, or container movement migration.
