# Functional Design Questions - U03 Agreement Pricing

## Q1. Amendment Identity Contract

Application Design requires `amendmentSeq` in typed pricing quantities, but `contracts/openapi/pricing.v1.yaml` and the bilateral contract currently omit it. Which shape is binding?

A. Add required integer `quantities.amendmentSeq` to the OpenAPI and provider/consumer DTOs; keep `Idempotency-Key = bookingRef:amendmentSeq` as the independently validated duplicate guard (Recommended)
B. Keep amendment sequence only inside the idempotency header and remove the Application Design requirement
C. Add a new top-level `amendmentSeq` field instead of placing it in `quantities`
X. Other (please specify)

[Answer]: A. Add required integer `quantities.amendmentSeq` to the OpenAPI and provider/consumer DTOs; keep `Idempotency-Key = bookingRef:amendmentSeq` as the independently validated duplicate guard (Recommended)

## Q2. Ambiguous Agreement Selection

How should Charge behave when more than one approved, active agreement has the same highest customer/trade-lane/commodity specificity for the effective date?

A. Reject automatic pricing with 422 `PRICING_VALIDATION`, persist one Charge manual diagnostic, and return no charges; duplicate commercial authority must be corrected explicitly (Recommended)
B. Select the agreement with the latest validity start date, then lowest stable agreement ID
C. Select whichever candidate the database returns first
X. Other (please specify)

[Answer]: A. Reject automatic pricing with 422 `PRICING_VALIDATION`, persist one Charge manual diagnostic, and return no charges; duplicate commercial authority must be corrected explicitly (Recommended)

## Q3. Charge Category and D&D Metadata

The existing `ChargeTerm` has no contract `category`, and no current agreement model owns `applicableDndRuleTypes`. What should U03 persist and return?

A. Add required `category` to each Charge term and pricing line; return a deterministically ordered, itemized USD result, and return an empty `applicableDndRuleTypes` array for W1 until the later D&D agreement model owns real trigger metadata (Recommended)
B. Infer category from charge-code text and hard-code all three D&D rule types
C. Return a generic category and omit `applicableDndRuleTypes`
X. Other (please specify)

[Answer]: A. Add required `category` to each Charge term and pricing line; return a deterministically ordered, itemized USD result, and return an empty `applicableDndRuleTypes` array for W1 until the later D&D agreement model owns real trigger metadata (Recommended)

## Source Context

Questions refine U03 from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. Source verification covers the existing `ChargeAgreementApplicationService.price`, active-agreement specificity selection, `ChargeTerm`, manual-pricing persistence, Booking's active-lookup client, and `contracts/openapi/pricing.v1.yaml`.
