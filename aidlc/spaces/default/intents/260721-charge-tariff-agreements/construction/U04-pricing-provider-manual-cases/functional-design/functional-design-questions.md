# Functional Design Questions — U04 Pricing Provider and Manual Cases

## Decision Record

The user was offered three non-blocking design choices with a 60-second auto-resolution window and supplied no answer. The documented recommended defaults therefore apply; they do not expand the approved scope.

1. How is a manual-case detail deep-linked without inventing an additional owned route?
   - A. Use `/charge-agreements/manual-pricing?case=<caseId>` and render the selected evidence in-page. **(Selected by recorded timeout default)**
   - B. Add a nested `/charge-agreements/manual-pricing/<caseId>` route.
2. How specific is the stored ambiguity reason while the public HTTP envelope remains `PRICING_VALIDATION`?
   - A. Persist `AMBIGUOUS_AGREEMENT_AUTHORITY`, `AMBIGUOUS_BASE_RATE`, `AMBIGUOUS_SURCHARGE_RATE`, or `AMBIGUOUS_LOCAL_RATE`. **(Selected by recorded timeout default)**
   - B. Persist one generic ambiguity reason.
3. What does `pricedAt` mean on an identical idempotent replay?
   - A. It is the UTC timestamp of the first successful terminal completion and replays unchanged. **(Selected by recorded timeout default)**
   - B. It is regenerated at replay time.

## Consequences

- The Charge-owned route list remains unchanged and browser history/back-forward can select one case by canonical query state.
- Operators receive category-specific evidence without exposing commercial values; Booking receives the same safe reason through an additive error field.
- An idempotent replay is byte-for-byte stable at the response-body level, including `pricedAt`, correlation, pricing request ID, and manual case ID.

## Resolved Ambiguities

No unresolved route, reason taxonomy, timestamp, public error, quantity, authority-order, or replay decision remains. This unit uses positive `quantities.equipmentQuantity` for all three `PER_CONTAINER` lines, as required by FR-102 and FR-304; `quantities.teu` remains an unchanged v1 request field but is not used by this thin slice.
