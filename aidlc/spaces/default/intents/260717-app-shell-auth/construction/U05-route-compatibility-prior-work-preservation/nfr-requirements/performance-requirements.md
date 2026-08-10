# Performance Requirements - U05 Route Compatibility and Preservation

## Source Context

These performance requirements consume U05 `business-logic-model.md`, U05 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U05 covers `/bookings*` compatibility and preservation checks.

## Local Acceptance Targets

| ID | Requirement | Measurement |
| --- | --- | --- |
| PERF-01 | `/bookings`, `/bookings/new`, and `/bookings/[id]` compatibility redirect/resolution should complete within 1 second p95 locally, excluding auth redirect and cold start. | Browser/network timing. |
| PERF-02 | Canonical `/booking*` target pages retain the relevant U01/U02 route timing targets after compatibility resolution. | Scenario timings. |
| PERF-03 | Preservation diff review completes as a deterministic file/path report and does not require broad full-suite reruns unless prior-work files are touched. | Evidence artifact review. |

## Resource Constraints

- Compatibility routing should not add new runtime services.
- Route mapping should be static or deterministic, not database-backed.
- Preservation proof should be targeted and auditable, avoiding unrelated refactors.

## Evidence

U05 evidence records old route, canonical target, status code or internal resolution result, actor/correlation where relevant, and preservation verification outcome.

## Architecture Review - 2026-07-18

Status: READY

Required changes: none.

Findings:

- Upstream coverage is adequate. The NFR set traces U05 to `/bookings`, `/bookings/new`, and `/bookings/[id]` compatibility with canonical `/booking`, `/booking/new`, and `/booking/[id]`, and it preserves the protected shell route/session/actor guard requirements from prior units.
- Performance targets are implementable for this slice. `PERF-01` gives a measurable local p95 target, excludes auth redirect and cold start explicitly, and the resource constraints keep compatibility routing static rather than service- or database-backed.
- Security requirements are concrete enough to build and test: legacy routes must run through the same protected shell behavior, must not reach Booking as `local-user`, must avoid open redirects through fixed mappings, and must keep correlation evidence.
- Scalability and reliability targets are scoped correctly. The route aliases are deterministic, do not duplicate Booking data loading, and preservation checks remain evidence-time work rather than runtime dependencies.
- Prior-work preservation is covered for W0-01, W0-02, W1-01, and W2-02 through scoped diff review, W2-01-specific touch reasons, and targeted verification for touched files; W1's waiver remains BLOCKED at `compose-start`.
- Tech-stack constraints are explicit and enforceable: U05 stays on existing Next.js/Nginx mechanisms, adds no broad rewrites or W4-01 migration scope, and prohibits Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, and Moment.js.
