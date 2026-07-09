# Risk and Sequencing Rationale - Shared Platform Local Functionality

## Context

This rationale consumes `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. It explains the chosen Bolt order using walking-skeleton-first plus risk-first sequencing.

## Heuristic

The selected heuristic is hybrid:

- Walking-skeleton-first because `team-practices` require the first Construction Bolt to prove local runtime across auth, reference-data BFF, backend service, persistence, outbox/status visibility, and smoke evidence.
- Risk-first after the skeleton because the highest current risks are static BFF behavior, missing runtime proof, auth bypass safety, seed apply, contracts, and readiness evidence.
- Lightweight WSJF-style thinking is used qualitatively: business value, risk reduction, dependency enablement, and job size.

## Qualitative Scoring

| Bolt | Value | Risk reduction | Dependency enablement | Job size | Rationale |
| --- | --- | --- | --- | --- | --- |
| B01 Walking Skeleton | High | Very high | Very high | XL | Proves the architecture and unblocks every meaningful later Bolt. |
| B02 Workbench Write UX and Bypass Guard | High | High | Medium | L | Directly addresses "view-only" UI and auth-bypass safety. |
| B03 Seed Apply | Medium/high | Medium | Medium | M | Makes local stack reusable and deterministic. |
| B04 Contracts | Medium/high | Medium/high | Medium | M | Provides downstream readiness evidence before later modules. |
| B05 Readiness/Quality | High | High | High | M | Aggregates proof after functional capabilities exist. |

## DAG Compliance

The Bolt sequence respects `unit-of-work-dependency`:

- B01 includes UOW-01 before the units that depend on runtime packaging.
- B01 includes UOW-03 before UOW-04 and UOW-05 depend on identity authorization.
- B01 includes UOW-04 before UOW-05 and UOW-07 depend on reference-data service core.
- B02 includes UOW-06 after UOW-05 and UOW-11 after UOW-02.
- B03 includes UOW-08 after UOW-02, UOW-03, and UOW-04.
- B04 includes UOW-09 after UOW-04 and UOW-07.
- B05 includes UOW-10 after UOW-01 through UOW-09.

No topological violation is planned.

## Key Risks and Treatments

| Risk | Severity | Earliest Bolt treating it | Treatment |
| --- | --- | --- | --- |
| Java/Maven missing | High | B01 | Prerequisite check and environment blocker reporting. |
| Docker daemon unavailable | High | B01 | Compose readiness blocker and local runbook. |
| Static BFF data hides gaps | High | B01/B02 | B01 replaces BFF service clients; B02 completes UI write flows. |
| Persistence not durable | High | B01 | PostgreSQL adapters for service-owned state. |
| Outbox/event path placeholder | High | B01/B04 | B01 proves status; B04 verifies contract/message behavior. |
| Auth bypass normalized | Medium | B02 | Non-local guard and visible local bypass state. |
| Seed remains validation-only | Medium | B03 | Live API apply mode with idempotency. |
| Contract drift | Medium | B04 | Provider/message checks against running behavior. |
| False readiness | High | B05 | Evidence aggregator separates blocked prerequisites from test failures. |

## Scope Protection

The plan intentionally defers:

- Charge and Customer Agreement runtime implementation.
- Customer Booking runtime implementation.
- Container Movement Management runtime implementation.
- Finance integration.
- Public cloud infrastructure.
- Production deployment.

These remain in the remembered follow-on order after Shared Platform is functional.

## Review

Verdict: READY

Inline fallback review finds the sequencing rationale aligned with `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. It justifies walking-skeleton-first while respecting the unit DAG.

