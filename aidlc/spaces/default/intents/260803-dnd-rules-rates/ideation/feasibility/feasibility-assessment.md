# Feasibility Assessment - W3-01 D&D Rules & Rates

**Inputs:** [Intent statement](../intent-capture/intent-statement.md), [competitive analysis](../market-research/competitive-analysis.md), [market trends](../market-research/market-trends.md), and [build-vs-buy assessment](../market-research/build-vs-buy.md)

## Verdict

**Feasible with bounded delivery controls.** W3-01 can be delivered as an additive, Charge-owned vertical without changing the approved W2-03 pricing contracts or introducing a new infrastructure service. The primary delivery risks are semantic correctness and evidence quality, not technology availability.

## Existing-platform evidence

- The current repository contains Java service modules for charge agreement, booking, container movement, reference data, and identity, plus TypeScript operational applications. The indexed graph identifies 142 HTTP routes and an established charge-agreement-to-booking boundary.
- The existing Charge pricing application flow enforces authorization, uses an idempotency key, canonicalises the request, persists a claim/receipt, and returns a provider response. That is a viable host for a deterministic D&D provider extension.
- Booking already includes a Charge pricing port adapter. W3-01 need not create a direct Booking-to-Charge persistence dependency; W3-02 can consume the bounded provider contract when its trigger/invoice work begins.
- The approved delivery posture remains Compose-first. No new AWS account, managed calculation service, or production-cloud topology is a prerequisite for this intent.

## Feasible solution boundary

1. Add D&D terms and progressive-rate bands to the Charge-owned pricing model without mutating W2-03 Rate/RateVersion or Agreement/AgreementVersion contracts.
2. Resolve the applicable W2-03 agreement/rate version, evaluate D&D from declared inputs and port-local calendar rules, and return a reproducible explanation.
3. Publish the provider contract additively, with signed producer and consumer fixtures.
4. Provide an operational, LinerCore-consistent UI only for the Charge-side rule/rate management in this intent; do not include W3-02 Booking triggering or invoice issuance.

## Constraints and controls

| Constraint | Feasibility impact | Control |
| --- | --- | --- |
| W2-03 pricing contract preservation | High; a breaking change blocks release. | Additive schema/API change only; regression fixtures protect existing pricing behaviour. |
| Port-local calendar calculation | High correctness risk. | Store/declare the port calendar, timezone and fallback explicitly; test DST, weekend, holiday and zero-charge cases. |
| DCSA-aligned inputs | Medium integration risk. | Use a mapping boundary for event semantics; do not claim DCSA conformance in W3-01. |
| FMC/OSRA billing context | Medium evidence risk. | Retain calculation lineage and explanations for later invoice/dispute flows; do not certify legal compliance from this endpoint. |
| Cross-service contract | High interoperability risk. | Dual-signed OpenAPI fixtures, versioned compatibility checks and no direct consumer persistence access. |
| Local live proof | Hard release condition. | Run Compose acceptance, `aidlc-audit`, and `erp-fidelity-audit` green before completion. |

## Decision

Proceed to Scope Definition with the bounded build. A milestone should be stopped and corrected if any W2-03 pricing fixture changes unexpectedly, a D&D result cannot be replayed from recorded inputs/version lineage, the provider/consumer fixtures diverge, or the live Compose/audit evidence fails.

