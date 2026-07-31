<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). Fill each section; keep the headings. -->

# Intent Statement — W2-03 Charge Tariffs & Agreements

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §4, especially the Charge module profile and ownership boundaries.
2. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md`, including the `pricing.request` / `pricing.result` contract and manual-degradation semantics.
3. `docs/erp-business-ui-gap-analysis.md` Part 1.2, which records the missing tariff, surcharge, and local-charge capability.
4. `docs/intents/W2-03-charge-tariffs-and-agreements.md`, the authoritative vertical-slice statement and answered rate-dimension question.
5. `docs/intents/00-INTENT-BACKLOG.md` and `docs/aidlc-v2-slicing-playbook.md`, which govern dependency, ownership, merge, and vertical-unit rules.
6. `services/charge-agreement-service/`, especially the existing agreement lifecycle, pricing request service, persistence adapters, and pricing endpoint.
7. `services/booking-service/`, especially the live Charge pricing adapter and stored Booking pricing snapshot path established by W1-01.
8. `artifacts/w0-02-live/live-proof-summary.json` and the W0-02 reference-data implementation for charge codes `OFR`, `BAF`, `THC`, equipment types, and USD currency.
9. `design-system/linercore/MASTER.md` and `design-system/linercore/SESSION-PROMPT.md`, the binding Wave A UI contract.
10. `design-system/linercore/pages/charge-and-agreements.md` when it exists; W2-03 may record Charge-specific additions there only.
11. `docs/codex-review-findings.md`, `docs/erp-business-ui-gap-analysis.md`, and `docs/erp-workflow-map.md` for review and journey context.
12. The W1 acceptance evidence: keep the historical blocked manifest and waiver explicit, and treat `artifacts/w1-01-live/w1-real-pass-20260720-verified/manifest.json` as a separate later proof rather than rewriting history.

## Intent

Charge becomes the real booking-pricing authority for the thinnest viable liner-shipping case: a pricing analyst maintains a base tariff, one surcharge, and one local charge, links them through an approved versioned customer agreement, and Booking receives and stores the computed itemised price over the existing synchronous contract. An unmatched booking enters `MANUAL_PRICING_REQUIRED`; no hardcoded or guessed price is accepted.

**Problem statement:** The existing agreement and pricing seam can carry charge terms, but Charge does not yet own maintainable tariff, surcharge, and local-charge data that demonstrably drive a Booking price. This leaves a measured business-capability gap and weakens rate attribution, repricing, and no-rate handling.

**Target customer:** Pricing analysts are the primary maintainers; Booking operators and customer-service users consume the priced or manual-pricing outcome; release reviewers and auditors verify attribution and historical evidence.

**Success metrics:** One live Compose run creates all three rate categories, approves a linked agreement version, produces three matching itemised lines in Booking, changes a rate and produces a new attributable quote without mutating the prior snapshot, and routes an unmatched lane to `MANUAL_PRICING_REQUIRED`. Playwright evidence covers the Charge and Booking views, and both mandated audits exit green.

**Initiative trigger:** W2-03 is the next unblocked Charge-owned Wave A slice after W0-02 and closes the documented hardcoded-pricing gap before W3-01 can build D&D rules and rates on a real pricing authority.

**Initial scope signal:** `feature` at Standard depth and Standard test strategy. The slice is broad enough to cross UI, API, domain, persistence, and Booking integration, but deliberately excludes adjacent pricing products and complex dimensions.

## Vertical Slice Definition

A pricing analyst uses the Charge domain page inside the shared authenticated shell to create a flat USD base ocean-freight tariff for one trade lane and equipment type, one BAF surcharge, and one POL THC local charge. The running Charge API validates W0-02 reference IDs, persists and versions the rates, links them to a customer agreement, and approves the new agreement version. Booking sends the existing live `pricing.request`; Charge matches the approved version and computes `pricing.result` lines from the stored rates; Booking stores and renders the resulting itemised snapshot. A newly approved rate version changes a subsequent reprice while the previous snapshot remains unchanged. A request outside the configured lane produces the contract-true no-rate outcome and a Booking-visible `MANUAL_PRICING_REQUIRED` state.

- **Layers cut through:** Charge UI · Charge API · rate/agreement domain · PostgreSQL persistence and additive migration · live `pricing.request` / `pricing.result` seam · Booking pricing snapshot and detail UI · live acceptance evidence.
- **Thinnest viable form:** one trade lane, one equipment type, flat per-container rates, USD only, one `OFR` tariff line, one `BAF` surcharge, and one POL `THC` local charge.
- **Explicitly deferred to later intents:** D&D rule types and rates (W3-01); D&D pricing and invoice emission (W3-02); multi-currency exchange application (P3-02); multi-leg/transshipment pricing (P2-04); reefer/DG and commodity/weight rate dimensions (P2-06 and later depth); standalone quotations, rebates, public-tariff marketplace, and broader revenue-management optimization.

## In Scope / Out of Scope

**In scope**

- Distinct tariff, surcharge, and local-charge aggregates with lifecycle, validity, version, persistence, and Charge-owned APIs.
- Reference validation against W0-02 charge-code, currency, equipment-type, trade-lane, port/location, customer, and related identifiers without duplicating Shared Platform master data.
- Agreement linkage to rate versions and an immutable approved-version history suitable for quote attribution.
- Real flat per-container price matching and calculation for the selected trade lane and equipment type.
- Contract-true itemised `pricing.result` content with `chargeCode`, category, amount, currency, pricing basis, and pricing reference.
- Booking consumption, stored immutable pricing snapshots, explicit repricing, itemised Booking detail, and `MANUAL_PRICING_REQUIRED` for no matching agreement or tariff.
- Charge-owned operational list/create/detail or edit surfaces inside the shared shell, with required loading, empty, error, denied, validation, success, light/dark, keyboard, and responsive states.
- Additive contract/example/Pact changes with Charge-producer and Booking-consumer review evidence.
- Isolated `linercore-wave-a` Compose acceptance, Playwright proof, and green `aidlc-audit` plus `erp-fidelity-audit`.

**Out of scope**

- D&D rules, rates, charge calculation, or invoicing; these remain W3-01 and W3-02.
- Multi-currency conversion and exchange application; this remains P3-02, although ISO 4217 USD and currency attribution are mandatory here.
- Commodity classes, weight bands, reefer/DG price dimensions, multi-leg routing, quotations as standalone documents, rebates, and public/spot tariff products.
- Redesign of `packages/ui`, the global shell, navigation, authentication, typography, palette, or non-Charge module pages.
- Rewriting or relabeling W0-01, W0-02, W1-01, W2-01, or W2-02 history or evidence.
- Timeout, 503, and circuit-open behavior as the focal live demo; their bilateral-contract semantics must remain preserved and regression-tested.

## Actors & Journey

1. A **pricing analyst** opens the Charge area in the canonical authenticated shell and creates or versions the three Charge-owned rate categories using live Shared Platform references.
2. The analyst creates a new customer-agreement version, links the selected rate versions, validates effective dates, and approves it; approved versions are not edited in place.
3. A **Booking operator** creates or opens a matching booking and requests pricing through the existing W1-01 synchronous seam.
4. Charge resolves the effective approved agreement and rate versions, calculates the three itemised USD lines, and returns their pricing basis and reference.
5. Booking stores an immutable pricing snapshot and shows the line breakdown, total, rate/agreement version evidence, and pricing reference.
6. The analyst creates and approves a changed rate version; the operator reprices, sees the new quote, and can still distinguish the earlier snapshot.
7. The operator prices a booking outside the configured lane; Booking records and displays `MANUAL_PRICING_REQUIRED` without a guessed total.
8. A **release reviewer/auditor** inspects Playwright, API, database, snapshot, and audit evidence from the isolated live stack.

## Cross-Module Seams (must be real)

- **Booking → Charge `pricing.request`:** the existing live `POST /pricing-requests` call remains the synchronous critical-path seam governed by `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md` and the executable OpenAPI. No fixture, local hardcoded result, or cross-database query may replace it.
- **Charge → Booking `pricing.result`:** Charge returns the real itemised breakdown and discriminated pricing basis/reference; Booking consumes the exact frozen field names and persists the evidence it reads.
- **Shared Platform → Charge reference lookups:** Charge consumes stable W0-02 and other reference IDs through owned APIs/contracts and never copies Shared Platform canonical records into a second master-data model.
- **Contract change protocol:** any additive change to `contracts/`, OpenAPI, examples, provider verification, or consumer Pact evidence is append-only and requires explicit Charge-producer and Booking-consumer sign-off.
- **Historical evidence boundary:** W1-01's original blocked manifest and waiver remain explicitly historical. W2-03 may add a new independent live proof but may not transform the prior blocker into a pass.

## Standards Alignment

- Use W0-02 charge codes `OFR`, `BAF`, and `THC` by stable reference identity and surface their readable labels without inventing alternate codes.
- Use ISO 4217 `USD`; amount scale and rounding must be explicit and consistent between stored rates, calculated lines, totals, API JSON, and UI formatting.
- Use the existing canonical trade-lane, equipment-type, customer/party, port/location, and UN/LOCODE-aligned field vocabulary; do not rename bilateral-contract fields.
- Keep Charge as the only canonical owner of tariffs, surcharge definitions, local charges, customer-agreement versions, and price calculation.
- Follow the existing media-type, idempotency, correlation, authorization, error-envelope, and all-or-nothing result semantics of the bilateral contract.
- Apply the LinerCore shared-shell and `@erp/ui` contract. Charge-specific composition may be recorded only in `design-system/linercore/pages/charge-and-agreements.md`.

## Definition of Done (observed, not "tests pass")

On the real isolated `linercore-wave-a` Compose stack, without targeting the protected manager demo or port 8088:

1. `npm run demo:guard` is executed before and after acceptance; any sandbox limitation is recorded as a blocker rather than a pass.
2. A pricing analyst uses the running Charge UI to create one USD tariff (`OFR`), one surcharge (`BAF`), and one POL local charge (`THC`) for the selected trade lane and equipment type.
3. The analyst creates and approves a versioned customer agreement referencing the effective rate versions; API and database evidence identify the immutable approved version.
4. A live Booking follows the preserved W1-01 flow and receives a real `pricing.result`; its stored pricing snapshot and Booking detail show three itemised lines whose amounts, categories, charge codes, currency, total, pricing basis, and pricing reference match the defined rates.
5. A new effective rate version is approved and the Booking is repriced; the new snapshot reflects the changed value while the earlier snapshot remains unchanged and attributable.
6. A booking outside the configured trade lane follows the no-rate path and visibly enters `MANUAL_PRICING_REQUIRED` with no fabricated total.
7. Playwright captures the real Charge maintenance and Booking breakdown/manual workflows, keyboard operation, focus, required async/error states, and 375px, 768px, 1024px, and 1440px layouts in light and dark themes.
8. Relevant unit, integration, migration-upgrade, contract/Pact, API, UI, and production-build checks pass without regressions to W0-01, W0-02, W1-01, W2-01, or W2-02.
9. `aidlc-audit` and `erp-fidelity-audit` both exit green against this observed live run. Evidence lives under a new W2-03 artifact path and does not rewrite W1 acceptance records.

## Dependencies

- **Closed W0-02:** consumes the live charge-code and equipment-type reference sets and the existing currency model/API, including `OFR`, `BAF`, `THC`, and USD.
- **Closed W1-01:** consumes the live Booking-to-Charge pricing request path and Booking pricing snapshot/detail foundation. The original W1 blocked manifest and 2026-07-17 waiver remain explicit; the later W1 real-pass manifest remains separate evidence.
- **Closed W0-01:** preserves shared messaging/outbox and platform foundations where touched; W2-03 does not replace them.
- **Closed W2-01:** consumes the canonical authenticated shell and subject propagation without changing shell/auth ownership.
- **W2-02 shared baseline:** consumes the common Wave A `@erp/ui` implementation and binding design contract from baseline `c2f13dd`. W2-02 acceptance is still pending in the program backlog and is not misrepresented as closed or made a reason to redesign its owned files.
- **Branch ancestry:** implementation remains on `intent/W2-03-charge-tariffs-and-agreements` from `c2f13dd`, with `c96b5b3` confirmed as an ancestor.

## Suggested Scope & Sizing

Use AI-DLC `feature` scope with Standard depth and Standard test strategy. The slice requires the full lifecycle because it changes persisted money data, a bilateral synchronous contract, two operator-visible module surfaces, and live Compose acceptance. Plan roughly four vertical units: (1) create and use a base tariff end to end; (2) add surcharge and local-charge lines to the same live quote; (3) version and approve rate-linked agreements with immutable attribution; (4) reprice and handle no-rate through the live Booking consumer. Each unit must carry its domain, migration, API, UI, test, and observable evidence rather than becoming a horizontal layer batch.

## Open Questions

1. Confirm the thinnest-viable rate dimensions for this slice.
   - A. Trade lane × equipment type with flat per-container USD rates (recommended)
   - B. Add commodity class now
   - C. Add weight bands now
   - X. Other (please specify)
   - `[Answer]:` A — trade lane × equipment type with flat per-container USD rates; commodity and weight dimensions are deferred.

All Intent Capture decisions are recorded in `intent-capture-questions.md`; no unanswered question blocks the next stage.
