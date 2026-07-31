# Business Logic Model — U04 Pricing Provider and Manual Cases

## Purpose and Boundary

U04 replaces the brownfield agreement-only `price()` seam with the sole W2 booking-time authority behind existing `POST /pricing-requests`. It consumes U03's W2-only Approved AgreementVersion candidate port, the exact linked U01 RateVersions, U01's standalone Approved RateVersion candidate port, and the U01-owned V4 receipt/manual-case schema. It owns deterministic resolution, calculation, terminal replay, read-only manual evidence APIs, and the Charge manual-evidence page. It does not author migrations, mutate rate/agreement lifecycle, change Booking state, add quote/case workflow, or alter shared UI.

The current compatibility implementation is not retained as authority: it selects mutable legacy `CustomerAgreement` rows by commodity and specificity, may return a variable number of terms, and represents manual handling as an internal `PricingResult` later mapped by the controller. W2 uses only structured W2 versions, never commodity as agreement identity, never specificity tie-breaking, and persists the exact public terminal HTTP body before returning it.

## Canonical Request and Authorization

`requestPricing(request, idempotencyKey, serviceSubject, correlationId)` accepts only the existing media type `application/vnd.api.v1+json`. The controller requires trusted service identity; the current default `booking-service` actor header is removed. For backward policy compatibility, the exact service permission remains resource `charge-agreement`, action `price`; no browser principal may call this provider method. Authorization occurs before candidate reads or receipt writes.

The existing v1 request fields and types remain required. Validation then requires:

1. `Idempotency-Key` exactly equals `bookingRef + ':' + amendmentSeq`;
2. header correlation equals the domain correlation and is 1–128 characters;
3. `dates.effectiveDate` exactly equals `dates.requestedDepartureDate`; only the latter is the business date;
4. `equipmentQuantity` and retained `teu` are positive integers and amendment sequence is non-negative;
5. all existing structural identifiers/booleans are present and syntactically valid; and
6. no server clock, commodity, display label, or browser field substitutes for authority.

A date mismatch is rejected after authorization but before claim: HTTP 422 envelope `PRICING_VALIDATION`, domain reason `EFFECTIVE_DATE_MISMATCH`, with no Charge manual case because it is caller-correctable rather than missing/ambiguous authority. Malformed input is 400 and is not claimed. Other reference/dependency failures preserve existing 422/503 distinctions and create no manual case.

The request hash is SHA-256 lowercase hex over UTF-8 canonical JSON with fields in published contract order, object keys fixed, booleans literal, integers in base-10 without leading zero, dates ISO-8601, and normalized trimmed identifier strings. It includes every request body field, including both date fields and retained `teu`, but excludes transport headers and actor/correlation. Changing any body value under the same key is a conflict.

## Receipt Claim and Terminal Replay

`PricingReceiptRepository.claim(idempotencyKey, requestHash, bookingRef, amendmentSeq, correlationId, now)` provides the existing lease/fencing behavior:

- absent key inserts one `IN_PROGRESS` claim with a generated owner token and ten-second lease;
- same key with different hash returns 409 `IDEMPOTENCY_CONFLICT` without candidate reads or writes;
- same hash with a live lease returns 409 `PRICING_IN_PROGRESS` and the existing positive `Retry-After` guidance;
- same hash with an expired lease may be taken over by one fenced owner; and
- same hash with a W2 terminal row returns stored HTTP status and exact `response_snapshot` bytes. It deterministically derives `Content-Type` from the terminal status—pricing v1 media for 200 and standard `application/json` for 404/422—and derives no other replay header except the existing nonterminal in-progress `Retry-After`. It never resolves, recalculates, regenerates time/correlation, or creates a case.

An untouched pre-V4 legacy terminal row is decoded by the existing legacy result compatibility seam only when its stored shape is complete. It is never silently upgraded or used as W2 enriched evidence. A malformed/incomplete stored receipt fails as 503 `PRICING_UNAVAILABLE`, not a fabricated replay.

## Agreement-First Resolution

`PricingAuthorityResolver.resolve(request)` uses `requestedDepartureDate` and performs these ordered operations:

1. Query `W2AgreementRepository.findApprovedCandidates` by exact active customer, trade lane, POL origin, POD destination, equipment type, and inclusive date. Commodity is not a discriminator.
2. If more than one candidate remains, stop with `AMBIGUOUS_AGREEMENT_AUTHORITY`; tariff is not queried.
3. If exactly one remains, reload that exact immutable Approved AgreementVersion and its exactly three links. Require exact distinct Approved BASE/OFR, SURCHARGE/BAF, and LOCAL/THC RateVersions whose windows cover the agreement and request date and whose applicability still matches. Any impossible missing/unusable linked authority is 503 `PRICING_UNAVAILABLE` plus integrity telemetry, not tariff fallback or an operator-created rate case.
4. If zero agreement candidates remain, execute complete-tariff resolution.

Agreement success sets `pricingBasis=AGREEMENT`, `pricingRef=<agreementVersionId>`, and `agreementVersionId=<same exact ID>`. Source line IDs are the exact linked RateVersion IDs; later rate/agreement successors cannot alter this result.

## Complete Tariff Resolution

Tariff resolution asks the U01 repository for all three effective Approved candidate sets before classifying the result:

| Required authority | Exact filter |
|---|---|
| BASE/OFR | origin + destination + equipment + inclusive requested departure date |
| SURCHARGE/BAF | origin + destination + equipment + inclusive requested departure date |
| LOCAL/POL THC | origin + equipment + inclusive requested departure date; destination is not a discriminator |

Classification has exact precedence. First inspect ambiguity in BASE, SURCHARGE, LOCAL order; the first category with more than one candidate yields its category-specific 422 reason even if another category is missing. Only when no category is ambiguous does any zero-candidate category yield 404 `NO_RATE`. The resolver evaluates no partial price, exposes no intermediate money, and never chooses latest, most specific, cheapest, first, or database order. Approval overlap guards are preventive, but runtime ambiguity remains safely handled.

Exactly one candidate in all three categories yields `pricingBasis=TARIFF`, no `agreementVersionId`, and `pricingRef='TARIFF-' + first24(lowercaseHex(SHA-256(BASE-versionId + '|' + SURCHARGE-versionId + '|' + LOCAL-versionId)))`. The three exact IDs remain independently present on lines.

## Itemised Calculation

`PricingCalculator.calculate(authority, request, pricingRequestId, correlationId, terminalAt)` is framework-free and deterministic:

1. emit exactly three lines in BASE/OFR, SURCHARGE/BAF, LOCAL/THC order;
2. require every source rate to be USD, `PER_CONTAINER`, non-negative, scale at most two, and effective/applicable for the already selected context;
3. use the same positive integer `equipmentQuantity` on every line;
4. calculate `amount = unitRate × equipmentQuantity`, then `setScale(2, HALF_UP)` independently;
5. set legacy category BASE→`FREIGHT`, SURCHARGE→`SURCHARGE`, LOCAL→`LOCAL`;
6. set additive `rateCategory`, `basis`, `quantity`, numeric `unitRate`, and exact `sourceRateVersionId`; and
7. sum the three rounded amounts, set scale two, and emit numeric `total` plus `currency=USD`.

Every W2 200 includes retained `bookingRef`, `pricingBasis`, `pricingRef`, `charges`, and `applicableDndRuleTypes` plus `total`, `currency`, `requestedDepartureDate`, `pricingRequestId`, `correlationId`, `pricedAt`, and agreement version only for agreement pricing. `applicableDndRuleTypes` remains the existing empty list in this slice. All enriched result/line fields are present together; partial enrichment is a provider defect. The application captures one UTC `terminalAt` after resolution and before serialization; it supplies the same value as response `pricedAt` and receipt `completed_at`, then replays it unchanged.

## Atomic Terminal Completion and Manual Case

After a claim, one Charge-datasource transaction completes the fenced receipt. Success serializes the exact 200 provider body first, then writes status `COMPLETED`, terminal code `PRICED`, HTTP 200, schema `pricing.v1`, exact `terminal_pricing_request_id`, response snapshot, correlation, completion time, and no case.

Only missing authority and the four runtime ambiguity reasons create Charge cases. `ManualPricingCaseRepository.createOrGetOpen` uses exact key `manual:v1|<len>:<pricingRequestId>|<len>:<reasonCode>` and inserts, when absent, generated case ID, status OPEN, booking reference, amendment sequence, request hash, correlation, opened time, reason, and safe request-context snapshot. If U01's deterministic V4 backfill already assigned that canonical key to the earliest legacy row, the repository returns that row unchanged even when its new booking/amendment/hash/correlation/time fields are NULL or its snapshot lacks W2 context; it never creates a duplicate or rewrites historical evidence. It then completes the owned receipt in the same transaction with status `MANUAL`, exact domain reason, schema `pricing.v1`, HTTP 404 or 422, exact response snapshot, and the returned case ID. Insert/lookup/receipt failure rolls back the complete terminal transaction; the claim remains recoverable only through lease takeover.

The public error remains the standard JSON envelope. U04 adds optional `reasonCode`, `pricingRequestId`, and `manualCaseId` properties without removing or renaming `code`, `message`, or `correlationId`. `NO_RATE` uses HTTP/code 404 `NO_RATE` and reason `NO_RATE`. Ambiguity uses HTTP 422/code `PRICING_VALIDATION` and one exact ambiguity reason. Booking alone projects either authority failure to `MANUAL_PRICING_REQUIRED`; that string is never Charge terminal authority.

Malformed, denied, date mismatch/other caller validation, idempotency conflict, live in-progress, timeout, dependency unavailable, and circuit-open outcomes create no Charge manual case. A controller exception after terminal commit is safe: identical retry replays the stored response and case identity.

## Manual Evidence Queries

The additive service endpoints are `GET /api/manual-pricing-cases` and `GET /api/manual-pricing-cases/{caseId}`, both default JSON through U02. They require exact human permission `charge-manual-cases:read` before count, search, or lookup. A denial reveals neither record existence nor aggregate count.

List accepts only `status=OPEN`, exact optional `reasonCode` and `bookingRef`, optional UTC `openedFrom/openedTo`, zero-based `page`, and `size` 1–100. Unknown parameters, unsupported status, malformed time, negative page, or invalid size are 400. Results order `opened_at DESC NULLS LAST, case_id ASC`. Detail returns only OPEN evidence: case/request/booking/amendment IDs, reason, request context (lane/POL/POD/equipment/party/commodity flags, dates, quantities), correlation, opened time, request hash, and status. For an unchanged backfilled winner, nullable/unavailable fields remain explicitly absent with `legacyEvidence=true`; the API/UI never parses opaque legacy snapshot JSON to invent them. It returns no rates, unit values, amounts, total, customer label, assignment, notes, resolution, approval, close, or mutation link.

## Failure, Observability, and Tests

Controller mappings retain actual request correlation; `local-correlation` is removed. Security denial is 403; authorized missing case is 404; database/reference/service unavailability is 503. Safe logs include correlation, pricing request ID, basis, source IDs, outcome/reason, replay flag, and elapsed time, but never customer/party, request payload, unit rate, amount, or total. Metrics count latency, basis, terminal outcome, manual fallback by bounded reason, replay, conflict, and in-progress without record IDs as labels.

Blocking unit/integration/contract tests cover agreement precedence, no agreement tariff fallback, every category miss/ambiguity including mixed miss+ambiguity precedence, agreement ambiguity no-fallback, exact line order/rounding/total for quantity 1 and >1, one captured `terminalAt`, date mismatch, request hash, concurrent claim/takeover/fencing, byte-stable success/error replay with derived content type, one-case dedupe including unchanged backfilled winner reuse, transaction rollback, provider/old-consumer fixtures, auth-before-query, redaction, stable NULL-last manual sorting/filtering/detail, and legacy receipt compatibility. U06 owns Compose/live/Playwright proof; this design does not claim it.

## Open Questions

The three route/reason/time questions are resolved by the recorded timeout defaults in `functional-design-questions.md`. No pricing algorithm or persistence ambiguity remains.

## Architecture Review — Iteration 1

The mandatory reviewer verdict was **NOT-READY** and remains part of the record. It identified three blockers: undefined precedence when a tariff category is missing while another is ambiguous; replay claiming media/headers not persisted by U01 V4; and complete-evidence invariants that contradicted mandatory reuse of an incomplete canonical legacy manual-case winner. This revision queries all three categories and gives any ambiguity deterministic BASE→SURCHARGE→LOCAL precedence before `NO_RATE`; replays only stored status/body and derives content type by status; and preserves/reuses legacy winners unchanged with honest unavailable evidence. The nonblocking timestamp clarification is resolved by one captured `terminalAt` shared by `pricedAt` and `completed_at`.

## Architecture Review — Iteration 2

The final permitted independent reviewer verdict is **READY** with no blocking findings. It confirmed all three iteration-1 corrections and consistency with U01 V4 persistence, U02 JSON manual BFF/auth policy, U03 W2-only authority, fenced/atomic completion, and additive pricing-v1 compatibility. Its nonblocking implementation controls are retained in the blocking tests above: isolate pre-V4 legacy receipt decoding from W2 exact-byte replay; assert derived content type for 200/404/422; and integration-test fencing, rollback, and unchanged reuse of an incomplete canonical backfilled winner.

## Upstream Coverage

This model directly consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It realizes FR-301–FR-307, FR-401–FR-407, FR-604, NFR-002–NFR-005, NFR-009/NFR-010, and U04 support for US-06/US-07/US-11/US-12 while preserving U01 migration ownership, U02 routing/session/error policy, U03 W2 agreement authority, W1's explicit waiver, and U05 Booking ownership.
