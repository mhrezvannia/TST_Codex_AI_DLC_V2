# Stakeholder Map — W3-01 D&D Rules & Rates

## Stakeholder Roles and Interests

| Stakeholder role | Relationship | Primary interests | Required evidence |
|---|---|---|---|
| Pricing Analyst | Primary user and beneficiary | Maintain correct rule types, free time, daily rates, applicability, validity, and agreement linkage without hidden pricing behavior | Authenticated UI/API journey; immutable version history; clear validation and attribution |
| Charge product decision role | Driver and product decision-maker | Revenue protection, bounded scope, authoritative calculation, and preservation of W2-03 pricing contracts | Stage approvals; scope traceability; live Charge evidence |
| Charge engineering owner | Provider owner | Correct domain authority, additive persistence, calculation fidelity, and safe contract evolution | Domain/API/database correlation; provider verification; regression gates |
| Booking contract owner | Consumer co-signatory | Stable `pricing.dnd-request` / `pricing.dnd-result` semantics that W3-02 can consume without ambiguity | Consumer fixture/Pact review and dual sign-off; no unapproved breaking change |
| Booking Desk Operator | Downstream beneficiary | Future actionable, itemised D&D outcomes without guessed or partial money | W3-02 traceability; provider behavior and failure meanings prepared by W3-01 |
| UI/design-system owner | Consulted boundary owner | LinerCore shell, tokens, responsive patterns, accessibility, and shared-component ownership remain coherent | Design-system mapping and viewport/keyboard/state/theme evidence; no local shell/theme fork |
| Platform/reference-data owner | Consulted dependency owner | Stable port, trade-lane, equipment, currency, charge-code, identity, and Compose foundations | Reference validation and no duplicate master-data authority |
| Quality/security/release reviewer | Independent assurance | Contract fidelity, authorization, auditability, demo safety, and truthful live acceptance | Blocking quality gates, retained live manifest, demo guards, `aidlc-audit`, `erp-fidelity-audit` |
| Finance/revenue assurance | Influencer and indirect beneficiary | Accurate charge evidence, reduced leakage, and dispute traceability without moving invoicing into Charge | Itemised attributable result and future W3-02 invoice traceability |
| External shipper/customer | Indirect beneficiary | Predictable and explainable D&D charges | Downstream Booking/invoice evidence in W3-02; no direct W3-01 workflow claimed |

## Decision Rights

| Decision | Accountable role | Required contributors |
|---|---|---|
| W3-01 product scope and priority | Charge product decision role | Pricing Analyst, Charge engineering, program owner |
| D&D domain rule and rate behavior | Charge product and engineering owners | Pricing Analyst, quality reviewer |
| Shared pricing contract or fixture change | Charge provider owner and Booking consumer owner jointly | Quality/security reviewers |
| Shared shell or design-system evolution | W2-02/UI owner | Charge frontend contributor; program merge owner |
| Reference-data vocabulary or identity change | Platform/reference-data owner | Charge provider owner |
| Stage approval | User at each AI-DLC gate | Stage lead perspectives and named reviewers |
| Release/live acceptance | Charge Driver plus independent release reviewer | Booking contract owner for fixtures; quality/security; UI owner for visual evidence |

Charge may not unilaterally change the shared pricing contract. Booking does not become co-owner of Charge's internal rule or rate authority merely because it co-signs the seam.

## Influence and Dependency Map

- **Direct:** Pricing Analyst -> Charge product decisions -> Charge provider implementation and evidence.
- **Contractual:** Charge provider <-> Booking consumer through additive, dual-signed pricing fixtures.
- **Foundational:** Platform/reference data and W2-02 UI foundations constrain Charge without taking over its domain.
- **Assurance:** Quality, security, and release review independently verify live evidence and audit claims.
- **Downstream:** Booking Desk, Finance, and external customers receive value only after W3-02 consumes the provider capability.
- **Forbidden:** Container Movement Management does not own, interpret, or calculate D&D rules and has no direct Charge integration.

## Communication Requirements

- Present every AI-DLC stage at its explicit approval gate; do not infer approval or autonomy.
- Notify the Booking contract owner before any proposed change to shared D&D request/result shape or semantics; retain both sign-offs with executable fixtures.
- Route shared component or token gaps to the W2-02/UI owner through the program merge protocol; Charge records only its page-specific override.
- Surface W2-03 compatibility risks immediately and keep its approved contracts and live evidence immutable.
- Report live acceptance with exact Compose project, wrapper, demo-guard results, scenario evidence, and audit outputs; an environmental block remains a block, not a pass.
- Park the workflow after User Stories 2.4 is approved and before Refined Mockups 2.5 begins, then wait for the user-directed UI/UX Pro Max run.

## Stakeholder Risks

| Risk | Owner | Mitigation |
|---|---|---|
| Charge and Booking drift on the future D&D seam | Charge + Booking contract owners | Additive executable schema, provider/consumer verification, dual sign-off |
| Scope leaks into Booking trigger/invoice or CMM rules | Charge Driver | Trace every behavior to W3-01 and preserve explicit W3-02/CMM boundaries |
| W2-03 pricing authority is redesigned instead of extended | Charge architecture/product owners | Treat stable version identities, exact agreement links, and additive `pricing.v1` as preserved constraints |
| UI diverges from shared LinerCore patterns | UI owner + Charge frontend | Apply LinerCore master/session guidance at UI-bearing stages and retain required evidence matrix |
| Release claimed from tests or fixtures alone | Release reviewer | Require observed isolated Compose journey, demo guards, and both audits |
