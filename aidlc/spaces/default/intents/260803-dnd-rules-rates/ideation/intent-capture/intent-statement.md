<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). Fill each section; keep the headings. -->

# Intent Statement — W3-01 D&D Rules & Rates

## Context Pack (read before starting)

1. `docs/intents/W3-01-dnd-rules-and-rates.md`
2. `docs/intents/00-INTENT-BACKLOG.md`
3. `docs/aidlc-v2-slicing-playbook.md`
4. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md`
5. `docs/program-vision-document.md` §4, especially the Charge and Container Movement module profiles
6. `aidlc/spaces/default/intents/260721-charge-tariff-agreements/inception/requirements-analysis/requirements.md`
7. `aidlc/spaces/default/intents/260721-charge-tariff-agreements/inception/application-design/decisions.md`
8. `aidlc/spaces/default/intents/260721-charge-tariff-agreements/construction/U01-rate-authority/functional-design/domain-entities.md`
9. `aidlc/spaces/default/intents/260721-charge-tariff-agreements/construction/U03-agreement-authority/functional-design/domain-entities.md`
10. `contracts/openapi/pricing.v1.yaml`

## Intent

W3-01 gives Pricing Analysts an authoritative, maintainable D&D rules-and-rates capability that protects revenue through reproducible calculation. Charge owns the rule types, free time, daily rates, agreement linkage, and evaluation result. Booking and customers benefit downstream when W3-02 consumes the provider contract; W3-01 does not move D&D authority into Booking or Container Movement Management.

## Vertical Slice Definition

A Pricing Analyst defines one of the three MVP D&D rule types and an agreement-linked rate in the authenticated Charge UI. The command crosses the Charge API, domain authority, and service-owned persistence. A caller then supplies the rule type and its bounding movement pair to the internal D&D evaluation API; Charge resolves the approved agreement or tariff basis, applies port-local calendar-day counting, free time, and the daily rate, and returns an itemised result that is observed on the running Compose stack.

- **Layers cut through:** authenticated Charge UI · BFF/API · domain rules and evaluation · service-owned persistence · additive pricing contract fixtures · live acceptance evidence
- **Thinnest viable form:** `IMPORT_DEMURRAGE` (`DISC` to `GTOT`), `IMPORT_DETENTION` (`GTOT` laden to `GTIN` empty), and `EXPORT_DETENTION` (`GTOT` empty to `GTIN` laden); one port; USD; port-local calendar days; flat daily rate after free time
- **Explicitly deferred to later intents:** Booking-triggered D&D pricing and invoice emission (W3-02), working-day/holiday calendars, tiered rates, and customer-specific overrides beyond the approved agreement link

## In Scope / Out of Scope

**In scope**

- D&D rule-type authority expressed as start/end DCSA move-code pairs with empty/laden qualifiers.
- Versioned D&D rates with free days, flat daily rate, port/trade applicability, USD currency, charge-code references, and exact agreement/tariff linkage.
- Charge-owned persistence, administration APIs, and authenticated maintenance screens.
- Deterministic evaluation from supplied bounding movements and timestamps to chargeable days and itemised D&D charge lines.
- Additive provider-side evolution of the approved pricing v1 contract and regenerated fixtures with Charge-provider and Booking-consumer sign-off.
- Live Compose acceptance, regression preservation, and both mandatory audits.

**Out of scope**

- Booking's movement recognition, invocation, retry/manual projection, and invoice emission; W3-02 owns that consumer journey.
- Direct Charge-to-Container Movement integration or any D&D ruleset in Container Movement Management.
- Working-day calendars, port holidays, tiered daily rates, broad revenue-management optimization, and external partner distribution.
- Redesign of W2-03 tariff/agreement authority, the shared authenticated shell, `packages/ui`, navigation, typography, or palette.

## Actors & Journey

1. A Pricing Analyst opens the Charge module through the shared authenticated shell.
2. The analyst creates or versions a D&D rule type and its agreement-linked rate, including free days, daily rate, currency, applicability, and validity.
3. Charge validates DCSA move pairs and W2-03 agreement/rate references, then stores attributable immutable approved authority.
4. A caller submits a start and end movement with timestamps to the Charge-owned evaluation API.
5. Charge calculates elapsed port-local calendar days, subtracts free time without going below zero, applies the approved daily rate, and returns the itemised result with pricing-basis attribution.
6. Live evidence proves zero charge within free time, correct positive charge beyond free time, and correct re-evaluation after an approved rate change.

The Pricing Analyst is the primary beneficiary. The Charge product decision role owns feature choices; Booking's contract owner co-signs shared fixture changes; UI and Platform owners advise within their existing boundaries.

## Cross-Module Seams (must be real)

W3-01 prepares the Charge provider side of `pricing.dnd-request` / `pricing.dnd-result` in `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md`. The additive schema and fixtures must preserve the approved W2-03 `pricing.v1` path, media type, pricing-basis discriminator, `pricingRef`, exact version attribution, error envelope, idempotency, and failure distinctions. Charge and Booking must both review and sign the executable fixtures.

No cross-module runtime call is claimed in W3-01. W3-02 owns the real Booking consumer invocation. Container Movement Management remains completely decoupled from Charge and holds neither D&D rules nor D&D calculations.

## Standards Alignment

- DCSA Track & Trace v2.2 move codes: `DISC`, `GTOT`, and `GTIN`, qualified by `EMPTY` or `LADEN` where required.
- ISO 4217 currency codes; the thin slice uses USD.
- Shared Reference Data identities for charge codes, ports/locations, equipment types, trade lanes, currencies, and parties.
- Existing W2-03 money, authority, and version semantics remain binding: exact decimal values, immutable approved versions, agreement-first resolution with complete tariff fallback, and no partial automatic price.
- The Charge module remains the single D&D rules-and-calculation authority; Booking owns the future trigger and invoice, while Container Movement owns only validated movements.

## Definition of Done (observed, not "tests pass")

On the isolated `linercore-wave-a` Compose stack, using only `scripts/wave-a-compose.mjs` and protecting the manager demo with `npm run demo:guard` before and after:

1. A Pricing Analyst creates, approves, lists, and inspects the three MVP rule types and at least one agreement-linked port rate through the running authenticated Charge UI/API.
2. A live D&D evaluation within free time returns zero chargeable days and no fabricated charge.
3. A live evaluation spanning free time returns the exact remaining chargeable days and itemised USD amount using the approved authority.
4. An approved successor rate changes a later evaluation while retaining the prior rate/version evidence.
5. The provider contract and regenerated `pricing.dnd-request` / `pricing.dnd-result` fixtures match the real engine and carry Charge-provider plus Booking-consumer sign-off.
6. W2-03 pricing behavior, authority order, immutable versions, failure meanings, and Booking-visible contract compatibility remain green.
7. UI evidence covers the required LinerCore responsive, keyboard, state, and theme matrix for every changed screen.
8. Quality gates, `aidlc-audit`, and `erp-fidelity-audit` all pass against the retained live-run evidence.

## Dependencies

- **W2-03 Charge tariffs & agreements — closed 2026-08-02.** W3-01 extends its stable Rate/RateVersion and Agreement/AgreementVersion authority and additive `pricing.v1` contract; it does not replace them.
- W0-02 shared reference identities and W2-01/W2-02 shell/auth/design-system foundations remain inherited closed capabilities.
- W3-02 is a downstream consumer, not a prerequisite. W3-01 must not claim W3-02's live Booking-triggered journey.

## Suggested Scope & Sizing

`feature` at Standard depth and Standard test strategy. The intent is a brownfield vertical feature spanning Charge UI, API, domain, persistence, approved pricing-contract evolution, and live evidence. Initial sizing remains approximately three vertical units: rule-type authority and UI; rate/agreement linkage and UI; evaluation API/engine plus contract and live acceptance. Units Generation must keep each unit vertical and may refine the count.

## Open Questions

The source statement's day-counting question is resolved: **calendar days using port-local dates**; working-day calendars remain deferred.

All Intent Capture framing questions are resolved in `intent-capture-questions.md`. Requirements Analysis must later make time-zone resolution, inclusive/exclusive boundary rules, rate-change effective-date behavior, idempotency, and error semantics executable without changing this approved intent boundary.
