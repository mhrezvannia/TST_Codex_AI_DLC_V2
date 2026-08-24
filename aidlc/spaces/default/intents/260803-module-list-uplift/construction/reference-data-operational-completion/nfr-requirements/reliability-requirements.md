# Reliability Requirements - U02 Reference Data Operational Completion

## Source Alignment

These requirements scope `requirements.md` NFR-005, FR-019, and FR-021 to U02. The failure surface comes from this unit's `business-logic-model.md` (the mutation outcome decision model, the unknown-outcome recovery algorithm, the conflict workflow, the degraded and stale read workflow) and `business-rules.md` (BR2-040 through BR2-046 result and recovery rules, BR2-014 and BR2-015 scoped-failure and stale rules). `technology-stack.md` bounds availability claims to the local Compose topology.

U02 is where W4-01 first has to answer "what happens when a write's outcome is unknown", so its recovery model is the most consequential part of this artifact.

## Availability Posture

U02 asserts **no** availability target, SLA, SLO, error budget, RTO, or RPO. Identity and the Reference service own their own availability. U02 adds no persistence — the create attempt ID is a provider record identity, not a stored idempotency record — so it has no data of its own to back up or restore.

## Mutation Recovery Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U02-01 | The mutation reducer is exhaustive across all nine dispositions; no response falls through to a generic error. | An unmapped provider or transport response producing an untyped state. |
| REL-U02-02 | `accepted-confirmed` requires both provider acceptance and an authoritative `getRecord`; submitted input alone is never success truth. | A success state rendered from the submitted draft. |
| REL-U02-03 | `accepted-unconfirmed` reports persisted-but-unconfirmed with a stable record identity and a Re-read action, never as confirmed detail. | Draft values presented as provider truth on this branch. |
| REL-U02-04 | Unknown outcome is neither success nor known failure and always requires an authoritative exact-ID re-read before any retry. | A Retry offered directly from an unknown-outcome state. |
| REL-U02-05 | A create retry reuses the pre-dispatch attempt ID and is permitted only after an authoritative terminal 404. | A retry issued before terminal absence, or one that allocates a second identity. |
| REL-U02-06 | A same-ID record with different content is treated as conflict or support evidence and is never overwritten. | An overwrite on the same-ID mismatch path. |
| REL-U02-07 | Every non-confirmed branch retains draft values, tab and list context, and logical focus. | A failure path clearing the draft or resetting context. |

## Concurrency Recovery Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U02-08 | A version mismatch retains the draft, announces the conflict, and requires explicit authoritative reconciliation. | A silent overwrite, automatic merge, or automatic resubmit. |
| REL-U02-09 | Reapply is enabled only after an explicit review of current truth and uses the newly read version. | A reapply using the stale expected version. |
| REL-U02-10 | Discarding a draft requires confirmation when dirty. | An unconfirmed discard of entered values. |
| REL-U02-11 | Duplicate activation while pending produces no second provider request. | A provider spy recording two requests under rapid double submission. |

## Read Degradation Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U02-12 | Last-known truth renders only when the authorized owning provider supplies it with source and time; otherwise the route shows provider error. | Stale content from browser memory, storage, or a cache. |
| REL-U02-13 | While stale truth is shown, every mutation command is absent or disabled with a precise freshness reason. | An enabled create or update on a stale record. |
| REL-U02-14 | A History failure is scoped to the History panel when Summary and Attributes remain trustworthy. | A history failure blanking the record or removing other tabs. |
| REL-U02-15 | True empty and filtered empty are distinct, and filtered empty is used only when `includeInactive` is the active filter and the provider response establishes the distinction. | The two states rendering identically, or filtered empty shown without an active filter. |
| REL-U02-16 | Retry is user-triggered and scoped to the failed read, facet, or command, and reauthorizes. | An automatic retry, or one that skips reauthorization. |

## Failure-Mode Coverage

Required as live fixtures, not client simulations: Identity outage; DENY on read, on create, and separately on update; Reference provider outage with trustworthy persisted truth; provider outage without it; not-found on update; validation rejection at the BFF and separately at the provider; version conflict; duplicate submission; timeout after dispatch for both create and update; same-ID matching content; same-ID differing content; terminal absence after an unknown create; malformed provider response; partial history; and a record carrying an uncatalogued attribute.

The same-ID matching, same-ID differing, and terminal-absence fixtures deserve emphasis: they are the three branches that make an unknown create recoverable, and a design that describes them without exercising them has not demonstrated recovery.

## Verification

Route and component tests cover state mapping, draft retention, duplicate prevention, dirty protection, and focus. Contract tests cover exact-version propagation, stable-ID create, the full result-to-HTTP mapping, and the post-acceptance re-read. Concurrency tests prove a stale version cannot overwrite and a create retry cannot duplicate. Live Compose runs exercise every fixture above. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass; evidence feeds the NFR-007 blocking gate at intent exit.
