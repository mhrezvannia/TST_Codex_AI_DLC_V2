# Business Overview — LinerCore Charge and Booking Pricing

## Business Domain and Purpose

LinerCore is an enterprise liner-carrier platform. This repository covers identity and access, controlled reference data, customer Booking, Charge agreements and pricing, container movements, event integration, and an authenticated operations UI. The Charge domain is responsible for selecting an applicable commercial authority and returning an auditable, itemised price that Booking can retain and show.

The W2-03 intent is deliberately narrower than a commercial-platform redesign. It must make tariff, surcharge, local-charge, and customer-agreement pricing operational as one vertical slice while preserving the existing Wave A capabilities and ownership boundaries.

## Current Baseline Capability

At baseline `c2f13dd`, the repository already provides:

- Draft customer agreements with terms, lifecycle actions, approval validation, a numeric mutation version, and post-approval immutability.
- Agreement selection using customer, trade lane, commodity, validity, and POL/POD specificity.
- Itemised pricing inside the Charge application layer, with charge code, category, term identifier, basis, quantity, rate, amount, and currency.
- Idempotent pricing requests, manual-pricing case recording, lifecycle outbox events, and HTTP integration from Booking to Charge.
- Booking pricing snapshots, a manual-pricing Booking state, amendment/reconfirmation paths, and a Booking detail surface that can display flattened quoted amounts.
- Controlled identity and reference-data seams, an isolated Compose topology, quality scripts, and contract catalogs.

The baseline is not yet the requested business outcome. Tariffs are represented only as agreement terms; approved versions are not separately addressable immutable records; term applicability is too coarse; the pricing HTTP response discards basis, quantity, and rate; Booking stores an untyped flattened map; and the Charge frontend is a disabled walking skeleton.

## Intended W2-03 Business Outcome

The intended change is a bounded extension of the current seams:

1. A Pricing Analyst manages Charge-owned tariff/rate and agreement records using controlled reference identifiers.
2. An approved agreement/rate version becomes immutable and can be identified as the authority used for pricing.
3. Pricing matches the correct base freight/tariff, surcharge, and origin-local charge for the request context, including equipment and location applicability.
4. Charge returns a real itemised result containing charge code/category, basis, quantity, rate, amount, currency, and pricing-authority/version references.
5. Booking retains and renders that breakdown and can request revision-aware repricing.
6. A no-rate or ambiguous outcome creates a manual case and is represented end to end as `MANUAL_PRICING_REQUIRED` rather than a fabricated zero or generic success.

Release evidence must show this outcome on the isolated `linercore-wave-a` Compose stack and must not disturb the protected manager demo on port 8088.

## Primary Business Workflows

### Agreement and rate governance

- Create a Draft record using Reference Data identifiers.
- Add or revise rate lines and effective windows while Draft.
- Approve only a complete, valid version.
- Treat the approved version as immutable; future changes create a new version rather than rewrite history.
- Derive scheduled/effective/expired presentation from the approved version's validity window.

### Initial Booking pricing

- Booking sends the booking/reference context, dates, locations, equipment, quantity, and amendment sequence to Charge with idempotency and correlation metadata.
- Charge selects applicable agreement or tariff authority, composes base, surcharge, and local-charge lines, records the authority/version used, and returns the itemisation.
- Booking saves the itemisation as a pricing snapshot and shows it to the user.

### Repricing

- A Booking revision triggers an explicit pricing action using revision-aware request identity and business date.
- The new response is retained as a new snapshot with its authority/version; prior evidence is not silently overwritten.

### No-rate handling

- Charge records a manual-pricing case with correlation and request context.
- The contract communicates `MANUAL_PRICING_REQUIRED` explicitly.
- Booking shows a non-success pricing state and does not invent rates or permit the result to masquerade as an automatic quote.

## Users and Responsibilities

| Actor | Responsibility in this slice |
|---|---|
| Pricing Analyst | Create/edit/approve Charge rate and agreement versions; inspect applicability and manual cases |
| Booking user | Request pricing/repricing and inspect the Booking-visible itemised result |
| Charge service | Select the pricing authority, calculate lines, persist evidence, and create manual cases |
| Booking service | Supply Booking context, retain pricing snapshots, and expose pricing state to its UI |
| Reference Data | Supply authoritative identifiers for locations, equipment, charge codes, currency, trade lanes, parties, and commodities |
| Identity/Auth | Supply the authenticated actor and authorization context |

## Ownership and Preservation Boundaries

- W2-03 owns Charge domain pages and may record Charge-specific UI additions only in `design-system/linercore/pages/charge-and-agreements.md`.
- `packages/ui`, the shared shell, navigation, typography, palette, and master design system remain W2-02-owned. Any mounting/proxy change must be minimal and compatibility-preserving.
- Existing W0-01, W0-02, W1-01, W2-01, and W2-02 behavior and evidence must remain intact.
- A historical W1 waiver or blocked result remains explicitly a waiver/block; W2-03 must not relabel it as a real PASS.
- D&D pricing exists in contracts but is not implemented locally and is outside this vertical slice.

## Success and Non-Success Semantics

| Outcome | Required meaning |
|---|---|
| Automatic price | An applicable approved authority produced one or more traceable itemised lines |
| Reprice | A new revision-aware snapshot was calculated and retained with its authority/version |
| `MANUAL_PRICING_REQUIRED` | No unique applicable automatic rate exists; a manual case is recorded and Booking exposes the exception state |
| Runtime acceptance | Live Charge-to-Booking proof, Booking-visible breakdown, Playwright evidence, and green AI-DLC/ERP-fidelity audits on the isolated Wave A stack |

## Known Business Questions

- The canonical pricing business date is not yet decided; current Charge integration uses the wall clock in one client path.
- The precise authority/deprecation relationship between legacy `charge-agreements.yaml` pricing paths and canonical `pricing.v1.yaml` must be resolved.
- Reference-data identifiers and matching semantics for lane, ports, equipment, and local-charge origin-only applicability require explicit requirements.
- The exact layer(s) carrying `MANUAL_PRICING_REQUIRED`—API result/error, Booking status, or both—must be fixed by a translation contract.

