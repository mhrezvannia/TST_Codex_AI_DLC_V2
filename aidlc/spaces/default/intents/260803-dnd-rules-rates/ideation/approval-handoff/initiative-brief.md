# Initiative Brief - W3-01 D&D Rules & Rates

**Approved inputs:** [intent statement](../intent-capture/intent-statement.md), [scope document](../scope-definition/scope-document.md), [intent backlog](../scope-definition/intent-backlog.md), [competitive analysis](../market-research/competitive-analysis.md), [feasibility assessment](../feasibility/feasibility-assessment.md), [constraint register](../feasibility/constraint-register.md), [team assessment](../team-formation/team-assessment.md), and [wireframes](../rough-mockups/wireframes.md)

## Intent and value

Deliver a complete Charge-owned D&D Rules & Rates vertical: version-attributable rules, qualifiers, port-local calendar treatment, progressive bands, deterministic provider evaluation, operational LinerCore UI, signed fixtures and live evidence. It protects revenue while preserving W2-03's approved pricing authority and gives W3-02 a bounded future provider contract.

## Evidence and feasibility

Market research establishes explainable D&D calculation and event semantics as operational table stakes. The current Charge pricing provider and Booking adapter make an additive extension feasible without a new service or AWS prerequisite. Risks concentrate in calendar semantics, rate/version lineage, and provider/consumer interpretation.

## Scope and visual concept

In scope: Charge-side model, provider API, evidence-rich evaluation and shared-shell D&D Rules & Rates workspace. Out: Booking triggering/invoice issuance, external calendar provider, DCSA certification and broad invoice compliance. The approved workbench is dense list/filter -> versioned detail tabs -> contextual calculation explanation; it uses LinerCore tokens/primitives and keyboard-first WCAG AA behavior.

## Team and gated delivery

Product/Pricing Analyst owns commercial acceptance; Architecture and Charge maintainer protect W2-03; Developer implements the vertical; QA owns fixtures and live evidence; Design governs UI. You approve every gate. Delivery proceeds risk-first: model/calculator, provider/fixtures, UI, then Compose/audit proof.

## Go/no-go recommendation

**Go to Inception.** Stop or correct if W2-03 changes, a result cannot be replayed from recorded terms/versions/calendar, signed fixtures diverge, or Compose, `aidlc-audit`, or `erp-fidelity-audit` fails.

