<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). Fill each section; keep the headings. -->

# Intent Statement — <intent name>

## Context Pack (read before starting)

<Ordered list of the exact repo files any AI session must read before working this intent: the relevant vision/contract docs, gap analyses, prior intents' outputs, and code entry points. This is how Claude/Codex/Kiro know which docs to use — the statement carries its own reading list.>

## Intent

<One paragraph: the business outcome this intent delivers. Phrase as a capability a user or upstream system gains, e.g. "A customer-service agent can confirm a booking and see the container journey open." NOT "build the booking module.">

## Vertical Slice Definition

<Prove this is a vertical slice, not a module or a layer. State the single thin end-to-end path through every layer it touches: UI action → API → domain → persistence → cross-module seam → observable result. Name the thinnest viable version (one leg, one equipment line, one currency) — defer breadth to later intents.>

- **Layers cut through:** UI · API · domain · persistence · <event/integration seam?>
- **Thinnest viable form:** <e.g. single routing leg, single equipment line>
- **Explicitly deferred to later intents:** <multi-leg, rolls, splits, cancellations, …>

## In Scope / Out of Scope

<Bulleted. Out-of-scope items should each name the future intent that will carry them.>

## Actors & Journey

<The user role(s) and/or upstream systems, and the ordered steps of the journey this intent makes work.>

## Cross-Module Seams (must be real)

<Every module boundary this slice crosses, the contract name that governs it, and the note that it must fire for real (real event on the broker / real API call), not a placeholder. Reference the contract file in contracts/ or docs/enterprise-contracts/.>

## Standards Alignment

<Which DCSA / UN-LOCODE / ISO-6346 / industry standards apply to the data in this slice, and the commitment to use those names/shapes in the domain and on the wire.>

## Definition of Done (observed, not "tests pass")

<The concrete behavior you will drive on the running stack and the state you will verify. Example: "On the live stack: create → validate → price → confirm a booking; observe a booking.confirmed event on the broker; observe CMM open a journey; observe the status event return and render in the Booking detail page." Include: exit gate = aidlc-audit + erp-fidelity-audit both green against this live run.>

## Dependencies

<Which CLOSED intents' outputs / knowledge-base entries this consumes. Must not depend on parallel in-flight intents.>

## Suggested Scope & Sizing

<Recommended AI-DLC scope (mvp / feature / enterprise / bugfix / …) and a rough unit count. Justify the scope choice.>

## Open Questions

<Use [Answer]: tags with A–E + X. Example below.>

1. Confirm the thinnest-viable form for this slice.
   - A. Single leg, single equipment line, single currency (recommended)
   - B. Multi-leg from the start
   - C. Include reefer/DG parameters now
   - X. Other
   - `[Answer]:`
