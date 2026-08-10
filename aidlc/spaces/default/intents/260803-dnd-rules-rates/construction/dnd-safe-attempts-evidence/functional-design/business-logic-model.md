# Business Logic Model - dnd-safe-attempts-evidence

## Source authority and predecessor contract

This design refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. U04 wraps the exact success/historical behavior proved by U01-U03 without changing signed response bytes, calculation or version selection.

The Unit completes transport/security precedence, idempotency races, handled release, durable disposition evidence and authorised no-disclosure query behavior.

## Endpoint precedence pipeline

The servlet/application flow is ordered and observable:

1. `PricingServiceIdentityFilter` checks actor/subject assertion spoofing.
   - spoof -> `400 PRICING_IDENTITY_SPOOF_REJECTED`.
2. Validate trusted service id/token.
   - missing/wrong -> `401 PRICING_SERVICE_IDENTITY_REQUIRED`.
3. Validate safe bounded correlation id.
   - invalid -> `400 PRICING_CORRELATION_INVALID`.
4. Controller validates media type, required `Idempotency-Key` and JSON/schema shape.
   - invalid -> `400 PRICING_BAD_REQUEST`.
5. Application authorizes `charge-agreement:price`.
   - denied -> `403 PRICING_FORBIDDEN`.
6. Receipt state classifies replay, fingerprint conflict, live owner, expired takeover or new ownership.
7. Exact immutable basis/rate/applicability evidence resolves.
   - absent/mismatch -> `404 NO_RATE`.
8. Pair/qualifier/timestamp/semantic rules validate.
   - invalid -> `422 PRICING_VALIDATION`.
9. Required dependency/persistence/evidence authority must remain available.
   - unavailable -> `503 PRICING_UNAVAILABLE`.
10. Exact calculation completes -> `200 DND_PRICED`.

A later layer never replaces an earlier outcome. Body parsing therefore cannot precede the security filter, and application denial cannot hide missing trusted service identity.

## Receipt ownership decision tree

| Observed row | Fingerprint/lease | Action |
| --- | --- | --- |
| No row | n/a | Insert owned `DND_PRICING` claim |
| Completed | Same | Return exact immutable replay; append replay evidence |
| Completed | Different | `409 IDEMPOTENCY_CONFLICT`; append conflict evidence |
| In progress | Lease live | `409 PRICING_IN_PROGRESS`; append in-progress evidence |
| In progress | Lease expired | Attempt database-time takeover with new owner token |
| Completion CAS loses | Winner changed | Classify winner; never publish stale calculation |

For handled application errors after ownership, call one Charge-database transaction `releaseAndAppendOwnedFailure(namespace,key,ownerToken,attemptDraft)`. If the fence still matches, it deletes only the owned in-progress row and appends the final failure disposition atomically; immediate retry may claim. If the fence is lost, it performs neither write, the application classifies the winner, and only then appends the single final disposition actually returned. A crash leaves the lease for takeover. One `attemptId` therefore represents exactly one externally observed disposition.

## Durable evidence workflow

1. Allocate a unique `attemptId` for every provider attempt that reaches the evidencing boundary.
2. Build a disposition-specific record rather than a fake full calculation:
   - success/replay -> result identity, exact source/calculation facts;
   - malformed/auth/validation -> request identity/code/correlation where available, nullable terms/source;
   - no-rate -> echoed applicability and reason, no rate/calculation;
   - conflict/in-progress -> key fingerprint/disposition, no duplicate result;
   - unavailable -> attempt/correlation/outcome and only resolved facts.
3. New success evidence commits in the same transaction as receipt completion.
4. Owned handled-failure evidence commits atomically with release; lost-fence evidence is appended only after winner classification. Replay/pre-claim rejection evidence commits before response.
5. Primary evidence-store failure is the explicit precedence exception: the intended application outcome is not returned, any owned success/failure transaction rolls back, and the endpoint returns `503 PRICING_UNAVAILABLE` without a charge result. Because the failed store cannot record its own failure, emit exactly one bounded high-severity structured fallback log with attempt/correlation/outcome category and no token/raw payload; do not recursively attempt primary audit for this 503. This is the sole documented exception to durable primary evidence for every application-level response.
6. Filter-level rejection retains its required 400/401 when durable evidence is unavailable and uses the same bounded fallback-log channel.

## Authorised evidence query

1. `RateServiceIdentityFilter` protects `/api/charge-dnd-terms` descendants.
2. Application checks `charge-rates:read` before repository access.
3. Search accepts bounded combinations of `attemptId`, correlation, booking/equipment/closing event, outcome/time or nullable terms id.
4. Denied -> 403 no-disclosure with no query/count/identity.
5. Ready -> bounded page of disposition-specific projections.
6. Unavailable -> scoped state with correlation, no guessed/partial page.

Unique `attemptId` lookup remains possible when `dndTermsId` is null.

## General audit API and BFF contract

`GET /api/charge-dnd-terms/audit` accepts these exact single-valued query names: `attemptId`, `correlationId`, `bookingRef`, `equipmentId`, `closingMovementEventId`, `outcome`, `occurredFrom`, `occurredTo`, `dndTermsId`, `page`, `size`, and `sort`.

- `page` is one-based and defaults to 1; `size` defaults to 25 and is restricted to 25 or 50; `sort` is `occurredAt:desc` (default) or `occurredAt:asc`, with `attemptId ASC` as tie-breaker.
- Duplicate or unknown parameters, invalid enums/ids/dates/ranges/pages/sizes/sorts, and incompatible filters return `400 DND_AUDIT_QUERY_INVALID` with stable field errors.
- A query must provide one selective identity (`attemptId`, `correlationId`, `dndTermsId`, or the complete `bookingRef + equipmentId + closingMovementEventId` tuple) or both `occurredFrom` and `occurredTo` spanning at most 31 inclusive days. `outcome` may refine either form but is not selective alone.
- `attemptId` is exclusive of other domain filters. Exact attempt miss is `404 DND_ATTEMPT_NOT_FOUND`; other valid searches return a 200 empty page when unmatched.
- The 200 page is `{items,page,size,totalElements,totalPages,sort}`. Every item has `kind`, `attemptId`, `outcome`, `code`, `status`, `occurredAt`, and the allowed fields for that discriminator.
- Discriminators are `SUCCESS`, `REPLAY`, `NO_RATE`, `VALIDATION`, `MALFORMED`, `AUTHENTICATION`, `FORBIDDEN`, `CONFLICT`, `IN_PROGRESS`, and `UNAVAILABLE`.
- Allowed-null matrix: SUCCESS/REPLAY require result, terms, source and calculation facts; NO_RATE forbids result/terms/rate/calculation but carries parsed echoed applicability; VALIDATION may carry resolved terms/source but forbids result/calculation; MALFORMED/AUTHENTICATION/FORBIDDEN forbid terms/source/result/calculation and may lack parsed identity/correlation; CONFLICT/IN_PROGRESS require key/fingerprint disposition and forbid terms/source/result/calculation; UNAVAILABLE carries only facts resolved before failure and forbids result/calculation.
- Errors use the existing correlated envelope: 400 query invalid, 401 identity required, 403 no-disclosure, 404 exact attempt missing, and 503 `DND_AUDIT_UNAVAILABLE`. A denied request executes no count/query.
- The BFF exposes the same discriminated union, normalizes its own form state, rejects duplicate/unknown values before forwarding, and never invents absent fields.

The Charge-owned UI route is `/charge-agreements/dnd/audit`. It is a secondary operational evidence route inside the existing authenticated Charge Agreements shell, reachable from the D&D terms list and exact correlation/attempt links. It is the minimal navigation required by the approved U04 null-terms lookup DoD; it does not add an evaluation action or shared-shell change.

## Failure and persistence assertions

| Scenario | Result assertion | Database assertion |
| --- | --- | --- |
| Malformed/spoof/auth/denied | Exact precedence code | No calculation/result |
| No-rate/validation/unavailable after claim | Exact 404/422/503 | Evidence recorded; owned claim released; no result |
| Conflict/in-progress | Exact 409 code | Original/winning row only; no duplicate result |
| Same replay | Exact stored 200 bytes | No second result; replay evidence appended |
| Stale owner completion | Winner classified | Stale payload not stored/published |
| Denied audit query | No disclosed identifiers/count | Repository not queried |

## Live scenario set

The guarded stack must exercise every FR-06 class, duplicate/replay/conflict/live-owner/takeover/release race, nullable evidence lookup, denied query and evidence-store failure posture. API responses, attempt/correlation lookup and direct database assertions must agree. Focused tests alone cannot satisfy the U04 DoD.

## Review History - Iteration 1 (superseded)

**Verdict: NOT-READY**

1. **BLOCKER - append-only attempt evidence can disagree with the response after a lost release fence.** The workflow records a handled failure, then calls `releaseOwned`, then reclassifies the winner if release fails. A winning completed/conflicting/in-progress receipt can change the returned status after the attempt row has already been finalized. Define an atomic owner-fenced `releaseAndAppendFinalDisposition` transaction; if the fence is lost, classify first and append the final returned disposition only. The attempt id must identify exactly one externally observed disposition.
2. **BLOCKER - the audit-store failure policy is internally impossible and contradicts the precedence statement.** The document says a later layer never replaces an earlier outcome, but also says any application evidence-write failure replaces success/replay/409/404/422 with `503`. It further requires every application-level attempt to have durable evidence before response, although the store whose failure caused the `503` cannot persist that evidence and only filter-level failures have a fallback. Define the explicit precedence exception and a realizable durability path (for example, an independently durable fallback/outbox), or relax the every-attempt invariant and specify the exact observable gap. Avoid recursive attempts to audit the audit-failure `503`.
3. **BLOCKER - there is no navigable UI composition for null-terms evidence.** The Unit DoD and upstream Unit definition require authorised attempt/correlation lookup when `dndTermsId` is null, and the REST design includes the general `GET /api/charge-dnd-terms/audit` query. `frontend-components.md` places all evidence under `DndTermsDetailPage`, which requires an unrelated terms id, and defines no general audit route or entry point. Add an exact Charge-owned route/composition (or explicitly place it on an existing named route) with search/list/detail navigation for attempt/correlation lookups; otherwise the UI portion of the U04 vertical outcome cannot be reached.
4. **BLOCKER - the general audit API contract is not implementable from this stage.** Specify the exact `GET /api/charge-dnd-terms/audit` query names, selective-identity-or-bounded-time-range rule, page/size limits, sort, duplicate/unknown-parameter behavior, response page/disposition discriminators, allowed-null matrix, not-found/validation/unavailable envelopes, and BFF mapping. Referring generically to descendants and bounded combinations leaves independently implemented controller, BFF and UI contracts free to diverge and does not satisfy the binding field-level contract-fidelity requirement.

The servlet security/controller/application order, exact public codes, no-disclosure authorization, bounded telemetry and UI-platform ownership are otherwise coherent. Required sections/upstream coverage passed; linter/type-check path filtering is not applicable to these Markdown artifacts.

## Review

**Verdict: NOT-READY**

1. **BLOCKER - the exact audit query names conflict with the consumed Application Design contract.** Corrected Functional Design publishes `occurredFrom`/`occurredTo`, while required upstream `component-methods.md` defines `DndEvaluationEvidenceQuery` as `from`/`to`. No explicit approved rename/adapter compatibility rule exists. Select one public contract and align repository query, controller, BFF and UI artifacts; otherwise independently implemented layers will reject each other's parameters.
2. **BLOCKER - the time-range wire format is still ambiguous.** `domain-entities.md` calls `occurredFrom`/`occurredTo` "inclusive instants/dates", leaving implementers to choose RFC 3339 instants versus ISO local dates, timezone interpretation and end-boundary semantics. Specify one exact wire type, normalization/timezone, inclusivity and 31-day calculation rule.
3. **BLOCKER - the frontend evidence union is not exhaustive or name-compatible with the server contract.** The server page defines ten uppercase item discriminators, but `frontend-components.md` defines lower/camel-case views and omits stored `MALFORMED`, `AUTHENTICATION` and `FORBIDDEN` items while adding `denied`, which is the current viewer's no-disclosure state rather than an evidence item. Define an explicit server-to-BFF/UI discriminator mapping and render all ten item kinds; keep route-level denied outside the evidence-item union.

Atomic release/final evidence, the explicit non-recursive audit-store fallback exception, `/charge-agreements/dnd/audit` navigation, pagination/selectivity/no-disclosure rules and shared-shell ownership are otherwise corrected. Required-sections and upstream-coverage passed; linter/type-check remain not applicable.
