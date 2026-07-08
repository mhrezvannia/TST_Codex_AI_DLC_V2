# Risk and Sequencing Rationale - Shared Platform MVP

## Source Trace

This rationale uses `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`, and `delivery-planning-questions.md`.

## Sequencing Heuristic

The chosen heuristic is walking-skeleton first, then risk/contract readiness. This follows the team practice that the first Construction Bolt is gated, and it aligns with Cockburn's walking-skeleton idea: prove a thin end-to-end implementation before expanding feature depth.

After the walking skeleton, the plan uses lightweight qualitative WSJF-style reasoning inspired by Reinertsen/SAFe: business value, time criticality, risk reduction, and job size are considered, but no false numeric precision is introduced.

## Scoring Legend

| Rating | Meaning |
|---|---|
| High | Strong factor for earlier attention. |
| Medium | Meaningful but not dominant factor. |
| Low | Lower sequencing pressure. |
| S/M/L/XL | Relative job size from `unit-of-work.md`. |

## Bolt Scoring Summary

| Bolt | Business value | Risk reduction | Time criticality | Job size | Rationale |
|---|---|---|---|---|---|
| Bolt 1 - Gated Walking Skeleton | High | High | High | L | Validates all core layers before full build-out. |
| Bolt 2 - Identity Authorization Service | High | High | High | L | Unblocks protected services/apps and security model. |
| Bolt 3 - Reference Domain/API | High | High | High | XL | Owns canonical data and key invariants; large foundation. |
| Bolt 4 - Event Outbox/Kafka | High | High | High | L | Proves contract/event backbone and freshness path. |
| Bolt 5 - Auth Frontend | Medium | Medium | Medium | M | Makes internal entrypoint usable and validates BFF token safety. |
| Bolt 6 - Reference Data Frontend | High | Medium | Medium | XL | Delivers administrator workflow once backend surfaces exist. |
| Bolt 7 - Contracts/DX | High | High | High | M | Enables downstream contract review without runtime scope creep. |
| Bolt 8 - Local Seed/Compose | Medium | Medium | Medium | M | Stabilizes developer/test reproducibility. |
| Bolt 9 - Quality Gates | High | High | High | L | Prevents regression of APIs, schemas, coverage, and frontend checks. |
| Bolt 10 - Observability/Deployment | High | High | Medium | L | Provides operational readiness and traceability evidence. |

## Topology and Deviation Notes

The full-unit sequence after Bolt 1 respects `unit-of-work-dependency.md`.

Bolt 1 intentionally deviates from a pure unit-by-unit topological path by taking thin validation slices across multiple units. This deviation is justified by `team-practices.md`, which requires a gated walking skeleton for this greenfield MVP. Bolt 1 does not complete all included units; it proves the architecture works before later Bolts complete the units.

## Earliest Risk Items

| Risk | Why early | Mitigation in plan |
|---|---|---|
| Keycloak/authz integration | All protected flows depend on correct authn/authz split. | Bolt 1 slice plus Bolt 2 completion. |
| Reference invariants | Canonical data quality fails if invariants are weak. | Bolt 3 completes aggregate validation. |
| Outbox/Kafka/schema compatibility | Event backbone is a core contract for later modules. | Bolt 1 slice plus Bolt 4 completion and Bolt 7 contracts. |
| BFF token safety | Frontend security baseline is non-negotiable. | Bolt 1 slice plus Bolt 5 completion. |
| CI contract gates | Contract drift is expensive after downstream review. | Bolt 1 smoke path plus Bolt 9 completion. |
| Correlation/observability | Distributed debugging is hard without early telemetry. | Bolt 1 trace slice plus Bolt 10 readiness. |

## Scope Guardrail

Downstream Charge, Booking, and Container Movement modules appear only as future contract consumers. This plan does not include downstream runtime services, UI screens, or implementation stubs.
