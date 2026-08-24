# Scope Definition - W3-01 D&D Rules & Rates

**Inputs:** [Intent statement](../intent-capture/intent-statement.md), [feasibility assessment](../feasibility/feasibility-assessment.md), and [constraint register](../feasibility/constraint-register.md)

## In scope

- Additive Charge-owned D&D rule types, qualified DCSA bounding pairs, flat daily rates after free time, and deterministic port-local calendar-date evaluation.
- Provider API and dual-signed compatibility fixtures that preserve W2-03 pricing contracts and version lineage.
- Charge-side operational UI following LinerCore, plus live Compose acceptance and both required audits.

## Out of scope

- Booking-side triggering, invoice creation, disputes/waivers, external holiday-provider integration, DCSA certification, and invoice-level multi-jurisdiction compliance.
- Progressive/tiered rates, working-day/holiday-exclusion calendars, generic combined rules, and arbitrary movement-pair authoring.
- Replacing W2-03 models/contracts, marketplace distribution, prediction/optimisation, or an external market launch.

## Delivery boundary and exit

Sequence risk-first: model/calculator, provider/fixtures, UI/live acceptance. Any W2-03 regression, non-reproducible charge, missing fixture, failed Compose acceptance, `aidlc-audit`, or `erp-fidelity-audit` is a release blocker. No artificial date overrides this evidence threshold.
