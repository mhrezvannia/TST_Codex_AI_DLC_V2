# Feasibility Assessment - W2-03 Charge Tariffs & Agreements

This assessment evaluates the bounded slice in [`intent-statement.md`](../intent-capture/intent-statement.md) against the evidence in [`competitive-analysis.md`](../market-research/competitive-analysis.md), [`market-trends.md`](../market-research/market-trends.md), and [`build-vs-buy.md`](../market-research/build-vs-buy.md).

## Executive Decision

**Conditionally feasible.** The product and technical path is viable on the existing Wave A architecture. Charge already owns agreement lifecycle, approved lookup, idempotent pricing-request handling, itemised pricing result types, manual-pricing cases, and a Booking-facing API. Booking already has a Charge pricing adapter that maps itemised lines into an immutable snapshot-shaped result and distinguishes manual, pending, transient, denied, and validation outcomes. The repository therefore contains the correct seams for an additive W2-03 implementation rather than an umbrella redesign.

Release feasibility remains conditional on live acceptance. The current execution environment cannot access Docker and could not run `npm run demo:guard`; this is a release dependency, not a pass. Completion requires the isolated `linercore-wave-a` stack, demo guards before and after, observed Charge-to-Booking pricing and repricing, the no-rate `MANUAL_PRICING_REQUIRED` path, Playwright evidence, and both audits.

## Technical Viability

| Area | Evidence and assessment | Status |
|---|---|---|
| Charge domain | Existing agreement aggregate, approval lifecycle, pricing request, pricing line/result, manual case, repositories, and REST controllers provide an additive foundation | Feasible |
| Booking consumption | Existing `ChargePricingPortAdapter` calls Charge, preserves line code/category/basis/quantity/amount/currency, and maps manual/transient outcomes | Feasible; live proof required |
| Data ownership | Charge and Booking retain separate service-owned persistence; Shared Platform references are consumed by stable IDs | Feasible |
| Commercial versioning | Approved agreement lifecycle exists, but W2-03 must prove immutable approved agreement and effective tariff/surcharge/local-charge versions rather than in-place edits | Feasible with migration and invariant tests |
| Repricing | Amendment-sequence/idempotency seams exist; W2-03 must persist a new Booking pricing snapshot and retain previous provenance | Feasible with explicit acceptance evidence |
| No-rate behavior | Existing manual result mapping and manual-case storage create the intended seam | Feasible; focal live degraded-path proof required |
| UI | Shared authenticated shell and W2-02 design baseline exist; Charge may add only its owned pages and page-specific design-system record | Feasible within ownership boundary |
| Runtime | Canonical acceptance is local isolated Compose, not AWS | Technically appropriate; currently inaccessible from this sandbox |

## Brownfield and Contract Safety

- Preserve W0-01/W0-02 reference identities and W1/W2 contracts; evolve OpenAPI, examples, provider tests, consumer tests, and persistence additively and in sync.
- Keep Charge authoritative for tariffs, surcharges, local charges, agreements, calculation, and manual cases. Booking owns its pricing snapshots and status projection.
- Use an ordered Flyway migration chain with upgrade/backfill/restart evidence; no destructive database reset counts as migration proof.
- Preserve the W1 historical blocked or waived manifest exactly as history. A new observed W2-03 run may add evidence but must not relabel that earlier result as a real pass.
- Keep timeout, HTTP 503, circuit-open, idempotency-conflict, and pricing-in-progress semantics while making no-rate the focal manual-pricing demonstration.
- Do not alter `packages/ui`, shared shell, navigation, typography, palette, W2-02 master tokens, or unrelated domain pages.

## Security, Compliance, and Data Classification

Customer agreement commercial terms are **confidential business data**. Rate masters, pricing results, and audit/event metadata are **internal to confidential** depending on customer linkage. Actor subject IDs and operational audit records can be personal data; minimize exposure and retain only what the program policy requires.

Required controls are role-based authorization, authenticated subject propagation, least-privilege service credentials, encryption in transit and at rest in non-local environments, append-only or integrity-protected approval/repricing audit evidence, correlation without secrets, and explicit local-only bypass controls. No evidence establishes PCI-DSS, HIPAA, GDPR, SOC 2, or a specific data-residency regime for this intent; none is claimed. Jurisdiction, retention, and certification targets must be supplied before production compliance approval.

## Platform Perspective

The AWS support perspective does not introduce cloud scope. Project rules make the local Compose topology the canonical W2-03 acceptance target. Well-Architected principles still translate into portable constraints: observable state, least privilege, bounded timeouts/circuit breaking, restart-safe persistence, backup/forward-repair thinking, resource measurement, and automated evidence. AWS account structure, region choice, service quotas, cost estimates, and IaC are not release blockers for this local vertical slice because no approved cloud deployment requirement exists.

## Effort and Sequencing

No numeric cost, staffing, or completion date is estimated. Relative effort is **material but bounded**, with the highest-risk work ordered first:

1. Contract and additive-schema proof for effective rate versions and immutable provenance.
2. Charge-owned tariff/surcharge/local-charge and approved agreement behavior.
3. Real calculation, no-rate manual case, and repricing snapshots across Charge and Booking.
4. Charge-only operational UI and Booking-visible itemised breakdown.
5. Isolated live Compose, responsive/keyboard Playwright evidence, and audit gates.

## Feasibility Conditions

Proceed into Inception only if these conditions remain binding:

- the slice stays limited to flat per-container USD pricing for the stated trade-lane/equipment and charge categories;
- every prior-wave contract or behavior change receives producer/consumer impact analysis and synchronized tests;
- Docker access is restored or an authorized environment runs the prescribed isolated acceptance commands;
- observed live evidence, not documents or container startup, determines release completion;
- cloud, optimization, D&D, settlement, public rates, and broader dimension work stays deferred.

## Upstream Alignment

The `intent-statement` supplies the vertical outcome and hard boundaries. `competitive-analysis` and `market-trends` establish versioning, additional-charge separation, repricing, provenance, and manual rating as operational table stakes. `build-vs-buy` establishes the bounded internal build and future adapter seam. This assessment finds no contradiction among them.
