# Business Logic Model - dnd-version-trigger-governance

## Source authority and predecessor contract

This design refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. U02 consumes U01's migration, additive contract, generated fixtures and signed compatibility manifest unchanged.

U02 consumes U01's minimum real fresh Standard-pricing snapshot/representative-trigger path, then completes lifecycle breadth for all three rule types, immutable successors, AgreementVersion relationships, duplicate/unavailable handling, owned-release behavior and replay governance while preserving byte-identical W2 replay.

## Workflow A - revise, approve and create successor

1. Detail selects the exact requested `dndTermsVersionId`; omission selects the latest presentation version.
2. Only the current Draft exposes Edit/Approve when server capabilities permit.
3. Draft update checks aggregate id, version membership and expected row version; it derives bounds/side and validates references again.
4. Approval obtains the transaction-scoped advisory lock for the canonical length-prefixed applicability key.
5. Under the lock, the repository tests inclusive effective-window overlap against Approved versions.
6. No conflict -> persist Approved state plus activity atomically. Conflict -> retain Draft and return field errors plus authorised conflicting version/window.
7. `Create successor` requires an Approved source and no existing Draft. It creates a distinct linked Draft; effective dates and reason require explicit input and the source remains immutable.

State flow:

```text
Draft --revise--> Draft
Draft --approve under lock--> Approved
Approved --create successor--> Approved source + linked Draft successor
```

There is no Approved -> Draft transition and no in-place mutation of Approved facts.

## Workflow B - AgreementVersion relationship

1. The existing Agreement detail resolves an exact `agreementVersionId` from its route/query contract.
2. The Charge BFF calls `/api/charge-dnd-terms/relationships/agreement-versions/{agreementVersionId}`.
3. Service authorization checks `charge-rates:read` before any relationship query.
4. The bounded query returns one discriminator:
   - `ready(items)` with exact term/version links;
   - `empty`;
   - `denied` with no count/identity;
   - `unavailable(correlationId)` while known Agreement facts remain readable.
5. Relationship items are read-only and link to canonical D&D detail history; they provide no second approval/edit action.

## Workflow C - fresh Standard-pricing trigger enrichment

1. Existing `PricingApplicationService` uses the minimum U01-proved enrichment/persistence seam on a fresh `STANDARD_PRICING` claim and performs unchanged Agreement-first/Tariff-fallback selection.
2. `DndTriggerMetadataResolver` receives the resolved authority, original pricing request and exact source versions.
3. It derives `pricingBasisVersionId`, `pricingEffectiveDate`, import port=POD and export port=POL, then queries exact Approved applicable terms once.
4. Results contain at most one item per fixed type, ordered import demurrage, import detention, export detention. Each item contains only rule type and fixed code/qualifier bounds.
5. Success renders the enriched `pricing.v1` terminal bytes and stores immutable original-request evidence before Standard completion.
6. Stored replay bypasses enrichment and returns exact bytes even after successor activation.
7. Duplicate authority or repository failure before completion:
   - record bounded outcome evidence;
   - call `PricingRequestRepository.releaseOwned(key, ownerToken)` qualified to `STANDARD_PRICING`;
   - true release -> immediate retry may claim;
   - false release -> read and classify the winning claim/receipt before responding.
8. Process crash does not run handled release; existing bounded lease/takeover remains authoritative.

## Validation and decision tables

| Condition | Result |
| --- | --- |
| Draft expected row version stale | `409 DND_TERMS_VERSION_CONFLICT` |
| Approved direct update | Denied/no mutation |
| Existing Draft when successor requested | `409 DND_TERMS_DRAFT_EXISTS` |
| Inclusive overlap | `422 DND_TERMS_OVERLAP` |
| No applicable D&D terms for fresh pricing | Empty `applicableDndRuleTypes`, complete exact basis evidence |
| One per applicable type | Ordered metadata-only items |
| More than one applicable version | `503 PRICING_UNAVAILABLE`, owned claim released/reclassified |
| Stored Standard replay | Original bytes; no current D&D query |

## Transaction and concurrency boundaries

- Draft mutations and activity are one Charge transaction with optimistic row version.
- Approval lock, overlap test, state change and activity are one transaction.
- Reference/Identity calls occur before database locks.
- Fresh Standard receipt enrichment and terminal rendering happen before receipt completion.
- Owner-fenced release cannot delete a different namespace, key, owner or terminal receipt.
- U02 produces runtime/replay evidence only; it neither edits U01 migrations nor regenerates the bilateral fixture/signoff set.

## Live scenarios

The U02 DoD observes all three fixed types, successor history, AgreementVersion ready/empty/denied/unavailable states, a fresh successor trigger and an older byte-identical Standard replay after restart. Focused tests cover overlap and claim races but cannot replace the guarded running-stack evidence.

## Review History - Iteration 1 (superseded)

**Verdict: NOT-READY**

1. **BLOCKER - runtime-enrichment ownership makes the predecessor Unit unbuildable.** U02 says it consumes U01, yet it exclusively owns the fresh `/pricing-requests` enrichment that creates the W3-era `STANDARD_PRICING` receipt required by U01's live D&D provider proof. This is a behavioral dependency from U01 back to U02 despite the declared U01 -> U02 DAG. Assign the representative enrichment/persistence path to U01 and leave all-type/successor/failure breadth here, or revise the Units/DAG/DoDs consistently.
Lifecycle, overlap locking, direct history selection, AgreementVersion no-disclosure states, stable routes, and exclusive W2-02 shell/Dialog ownership are otherwise coherent. Required sections/upstream coverage passed; linter/type-check path filtering is not applicable to these Markdown artifacts.

## Review

**Verdict: NOT-READY**

1. **BLOCKER - U01/U02 enrichment ownership still contradicts required upstream decomposition.** This artifact correctly consumes a minimum U01 producer path, but approved `unit-of-work.md` still assigns Standard-pricing enrichment and typed evidence completion exclusively to U02. Until that upstream ownership is reconciled, the same code path has two incompatible slice owners and U01's predecessor DoD remains dependent on U02 in planning/code-generation inputs.
2. **BLOCKER - U02's handled Standard-enrichment failure path still uses the superseded non-atomic sequence.** Workflow C records outcome evidence, calls `PricingRequestRepository.releaseOwned`, and only afterward classifies the winner when release loses. Unlike corrected U03/U04, it does not use an owner-fenced atomic release-plus-final-evidence operation, so recorded evidence can disagree with the externally returned replay/conflict/in-progress disposition. Use the namespace-qualified atomic operation for the Standard claim, or write nothing on a lost fence, classify first, and append exactly the final returned disposition. Update Q2/business rules consistently.

Lifecycle, overlap, trigger ordering, immutable replay and AgreementVersion/UI boundaries are otherwise implementable. Required-sections and upstream-coverage passed; linter/type-check remain not applicable.
