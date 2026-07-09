# Risk And Sequencing Rationale - LinerCore Enterprise

## Source Context

This rationale consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`, and `delivery-planning-questions.md`.

The approved approach is hybrid: walking-skeleton-first for Bolt 1, then risk-first WSJF-style sequencing.

## Heuristic

The remaining Bolts use a lightweight WSJF-style score:

```text
score = (business value 30 + time criticality 10 + risk reduction 40 + dependency unblocking 20) / job size
```

Interpretation:

- Risk reduction has the highest weight because the program contains new services, new contracts, Kafka/SR, Keycloak, D&D, UI conversion, and full local runtime.
- Dependency unblocking is weighted heavily because later enterprise flows cannot proceed if contracts, runtime, auth, reference data, or service boundaries fail.
- Business value remains explicit because Booking, pricing, CMM, D&D, and UI all deliver visible user outcomes.
- Job size prevents large late-stage packages from hiding integration risk.

## Scoring Summary

| Bolt | Business value | Time criticality | Risk reduction | Dependency unblocking | Job size | Relative score | Rationale |
|---|---:|---:|---:|---:|---:|---:|---|
| B01 | 30 | 10 | 40 | 20 | XL | Highest by mandate | Team practice requires first enterprise skeleton; it proves architecture. |
| B02 | 20 | 10 | 35 | 20 | L | High | Contracts/runtime/auth/reference unblock every later unit. |
| B03 | 25 | 8 | 35 | 18 | XL | Medium-high | Charge pricing is required before Booking confirmation and D&D. |
| B04 | 30 | 8 | 35 | 18 | XL | Medium-high | Booking lifecycle is central and greenfield. |
| B05 | 25 | 8 | 32 | 16 | XL | Medium | CMM is greenfield and needed for status and D&D inputs. |
| B06 | 30 | 8 | 35 | 18 | L | High | Async event loop proves cross-module lifecycle. |
| B07 | 25 | 7 | 40 | 12 | XL | Medium | D&D ownership split is high risk but depends on earlier status/pricing seams. |
| B08 | 25 | 6 | 25 | 10 | XL | Medium | UI is high value but must consume real APIs and events. |
| B09 | 20 | 8 | 30 | 18 | L | High | Deterministic seed/migration/devex makes all later evidence repeatable. |
| B10 | 20 | 10 | 40 | 20 | XL | Medium-high | Final evidence and Operation readiness cannot complete until flows exist. |

## Sequencing Rationale

### B01 First

B01 is first because `team-practices.md` mandates an enterprise walking skeleton. It intentionally bundles runtime, contracts, auth, reference data, minimal Charge, Booking, CMM, UI, and observability evidence. It is not a Shared Platform-only continuation.

### B02 Before Deep Domain Completion

B02 completes foundation work after the skeleton. This reduces recurring blockers for all later domain mobs: local runtime, contracts, Keycloak/JWT, Kafka/SR, reference events, and authorization.

### B03 Through B05 Complete Domain Cores

B03, B04, and B05 complete Charge, Booking, and CMM domain cores after shared foundations. They can overlap only where the AI-DLC autonomy ladder and dependency evidence allow it. Their order favors Charge and Booking before CMM because Booking pricing and confirmation must stabilize before full movement status and D&D workflows can be trusted.

### B06 Closes The Booking-CMM Loop

B06 completes both `booking.confirmed` and `containermovement.status` event paths. This is placed after domain cores because it needs real producer and consumer behavior, not schema-only stubs.

### B07 Handles D&D After Pricing And Status Are Real

B07 follows pricing and movement-status integration because Booking must trigger D&D from real movement evidence and Charge must calculate from real D&D rules. This protects the boundary rule: Booking triggers, Charge calculates, CMM reports.

### B08 Completes UI After Real APIs Exist

B08 completes the enterprise web app after enough real backend behavior exists to avoid fake prototype business logic. Skeleton UI arrives in B01, but full workflow UI waits for real APIs/events.

### B09 And B10 Close Local Repeatability And Operation Evidence

B09 completes deterministic seed/migration/devex after service schemas stabilize. B10 completes CI/CD, observability, E2E Flow 1 through Flow 5, and Operation readiness evidence.

## Dependency Deviations

The plan does not violate `unit-of-work-dependency.md`. B01 is a composite walking-skeleton Bolt that includes dependencies and dependent skeleton slices together. Later Bolts respect the unit DAG by completing prerequisite units before dependent completion claims.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| First Bolt becomes too large because the enterprise skeleton crosses many units | High | High | Keep B01 to one deterministic happy path plus minimal evidence; defer full completion to later Bolts. |
| Contract markdown is mistaken for executable readiness | Medium | High | B02 and B10 require executable OpenAPI, Avro, AsyncAPI, Pact, message-pact, and Schema Registry checks. |
| Booking or UI copies pricing/D&D logic | Medium | Critical | Boundary tests and code review enforce Charge ownership. |
| CMM decides D&D relevance | Medium | Critical | Boundary tests enforce CMM reports status only. |
| Docker/Kafka/SR/Keycloak local blockers are hidden | High | High | Runtime council owns blockers; no readiness claim without health and E2E evidence. |
| Claude UI prototype logic leaks into implementation | Medium | Medium | B08 uses mockups for visual baseline only; real service APIs own behavior. |
| DCSA/EDI expertise unavailable | Medium | Medium | First release uses deterministic movement fixtures and flags DCSA edge cases for expert review. |
| Observability is bolted on too late | Medium | High | B01 includes minimal correlation evidence; B10 completes full observability and SLO evidence. |

## Success Criteria

- Bolt 1 proves a real enterprise walking skeleton, not a document or mock.
- Each later Bolt has a concrete confidence hypothesis and Definition of Done.
- Every Bolt preserves explicit module boundaries from `components.md`.
- No completion claim is allowed without tests, contracts, local runtime evidence, and observability appropriate to the Bolt.

