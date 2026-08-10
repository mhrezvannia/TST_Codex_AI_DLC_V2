# Competitive Analysis — W3-04 Booking Request Completeness

## Purpose and Upstream Intent

This analysis applies the approved W3-04 `intent-statement.md` to three solution categories: carrier portals, enterprise forwarding/TMS suites, and the DCSA standards ecosystem. It evaluates operational fidelity rather than broad feature count. The research cutoff is 2026-08-03, and external claims use official primary sources.

W3-04 is not an attempt to compete as a public carrier portal or replace an enterprise TMS. Its relevant question is narrower: what constitutes a credible, commercially usable FCL-dry booking request, and which capabilities should LinerCore own versus reuse?

## Category Comparison

| Category / examples | Demonstrated strengths | Limits relative to W3-04 | Commercial model | W3-04 implication |
|---|---|---|---|---|
| DCSA Booking 2.0 | Defines a standardized booking request, update, confirmation, amendment, decline, and cancellation lifecycle; publishes a data overview with mandatory/conditional/optional attributes and OpenAPI guidance | A standard and implementation guide, not an operator-ready product, shared shell, pricing engine, or internal recovery experience | Public standard; implementation and conformance costs remain with adopters | Use DCSA-aligned names and lifecycle semantics, but keep W3-04’s intentionally thin dry-booking boundary |
| Carrier portals — Maersk, CMA CGM, Hapag-Lloyd | Show origin/destination, contract or price owner, commodity, equipment type/size, quantity, weight, requested departure, sailing selection, rates, deadlines, and booking review/confirmation as normal digital-booking expectations | Carrier-specific products couple booking to their own inventory, rates, terms, and service network; they do not replace LinerCore’s multi-module ownership or internal audit seams | Shipment/transport transaction and rate model; portal access is a sales/service channel rather than a comparable software license | Treat complete fields, schedule choice, quantity, weight, pricing visibility, and review as table stakes—not differentiation |
| Enterprise forwarding/TMS suites — CargoWise, SAP TM | Integrate schedules, rates, eBookings, tracking, carrier updates, charge calculation, exception workflows, and audit history; support broad multimodal and organizational processes | Considerably broader than W3-04; adopting as the core would duplicate or displace the closed LinerCore Booking, Charge, Reference Data, CMM, and shell investments | Enterprise commercial licensing and implementation; official pages reviewed provide no directly comparable W3-04 price card | Benchmark integrated behavior and exception handling, but avoid replacing the existing bounded platform for one completeness slice |

Primary evidence: [DCSA Booking 2.0 introduction](https://dcsa.org/standards/booking/documentation-booking-2/booking-2-introduction), [DCSA Booking 2.0 documentation](https://dcsa.org/standards/booking/documentation-booking-2), [Maersk mandatory booking information](https://www.maersk.com/de-de/support/faqs/mandatory-booking-information), [Maersk new-booking flow](https://www.maersk.com/support/faqs/2025/09/05/how-do-i-make-a-new-booking), [CMA CGM Click & Book guide](https://www.cma-cgm.com/assets/public/documents/Click%20%26%20Book%20guide%202024.pdf), [Hapag-Lloyd Quick Quotes Spot](https://www.hapag-lloyd.com/en/online-business/quotation/quick-quotes-spot.html), [CargoWise Ocean](https://www.cargowise.com/solutions/cargowise-forwarding/ocean/), and [SAP Manage Ocean Freight Bookings](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/9386c8070e854c5cb4ceff469cd8c28e.html).

## Capability Signals

### Commercial field completeness

Maersk’s official mandatory-information page includes locations, service mode, contractual customer, earliest departure, commodity/cargo details, container type/size, number of containers, and weight per container. CMA CGM’s current booking guide similarly asks for container type/size, quantity, weight, and commodity. These sources validate W3-04’s decision to include canonical commercial facts and editable quantity; a pricing-minimum-only record would sit below observed market table stakes.

### Schedule and pricing journey

Carrier flows commonly move from requested departure to available sailings, then expose rate and schedule details before review and submission. Maersk documents vessel selection after shipment details, while Hapag-Lloyd advertises rapid spot quotation and booking confirmation for multiple containers. This supports W3-04’s requested-date-plus-authoritative-voyage-snapshot model and the need to show the exact pricing basis.

### Interoperability and lifecycle

DCSA Booking 2.0 treats booking request and confirmation as part of a larger stateful lifecycle, with synchronous request handling and asynchronous state notification in its published use cases. W3-04 should align names and boundary semantics without pulling later amendment, cancellation, or shipping-instruction scope forward.

### Exception management and auditability

CargoWise’s official ocean material emphasizes direct carrier connectivity, reduced rekeying, exception alerts, and complete transaction audit trails. SAP’s current ocean-booking documentation exposes planned and actual schedule facts and UN/LOCODE-based locations. This supports explicit degraded, retry, conflict, and audit states as credible operational expectations rather than optional polish.

## Strengths, Weaknesses, and White Space

**W3-04 strengths if delivered as intended**

- Exact ownership across Booking, Reference Data, Charge, and CMM instead of duplicated masters or ambiguous attribute bags.
- Explicitly valid absence of a physical container identifier at request and initial confirmation.
- Quantity-aware pricing and confirmation payloads proven on the live stack.
- Input-preserving correction and provider-recovery states inside one governed enterprise shell.
- A narrow, DCSA-aligned dry-booking slice that avoids premature reefer/DG, documentation, and multi-leg complexity.

**W3-04 weaknesses and risks**

- It will not match the breadth of a carrier portal or TMS after one intent: amendments, shipping instructions, eBL, multi-leg, allocation, and special cargo remain deferred.
- Internal-only optimization means external shipper self-service expectations are not yet tested.
- Authoritative voyage cutoffs and party/reference quality are only as reliable as the live upstream sources and their degraded-state handling.

**White space / differentiation**

The evidence does not support differentiating on “online booking” or basic field capture. The credible differentiation is trustworthy operations: the same typed facts survive UI → API → persistence → live validation → exact pricing → confirmation; legacy gaps remain explicit; failures preserve input; and no container assignment or downstream data is fabricated.

## Differentiation Strategy

1. **Position reliability, not novelty.** Describe W3-04 as the smallest commercially trustworthy Booking slice, not a market-first booking feature.
2. **Make provenance visible.** Distinguish customer-entered requested departure from carrier-derived voyage times and deadlines.
3. **Prove contract fidelity.** Treat exact pricing quantity/date mapping and schema-valid confirmation without `equipmentId` as product evidence.
4. **Design recovery as core workflow.** Validation, stale reference, provider error, conflict, duplicate-submit, and degraded-reference states must preserve work and guide action.
5. **Keep the boundary legible.** Do not claim reefer/DG, documentation, amendments, allocation, or external self-service until their owning intents deliver them.

## Research Limitations

- Carrier and vendor sites expose selected workflows and product claims, not complete internal data dictionaries, implementation costs, service-level terms, or customer-specific configurations.
- No authoritative, directly comparable per-feature software price was found; pricing comparisons are therefore qualitative.
- Comparative judgments above are inferences from the cited official capabilities combined with the approved internal `intent-statement.md` and should be revisited if W3-04’s audience changes from internal users to external shippers.

