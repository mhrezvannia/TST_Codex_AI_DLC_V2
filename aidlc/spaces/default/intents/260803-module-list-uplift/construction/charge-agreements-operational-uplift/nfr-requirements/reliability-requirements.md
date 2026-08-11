# Reliability Requirements - U03 Charge Agreements Operational Uplift

## Source Alignment

These requirements scope `requirements.md` NFR-005, FR-019, and FR-021 to U03. The failure surface comes from `business-logic-model.md` (the degradation workflow, the mutation outcome model, the unknown-outcome recovery algorithm) and `business-rules.md` (BR3-040 through BR3-047 result and recovery rules). `technology-stack.md` bounds availability claims: the acceptance topology is local Compose, so no SLA, SLO, or uptime target is asserted.

## Availability Posture

U03 asserts **no** availability target, SLA, SLO, error budget, RTO, or RPO. The Charge service, Reference service, and Identity each own their own availability; U03 owns only how it *behaves* when they are unavailable. Per NFR-012 no production availability claim is made, and per `technology-stack.md` no managed-service or orchestration guarantee may be inferred.

Backup, restore, and disaster recovery are not U03 concerns: the unit adds no persistence (BR3 §Persistence and Boundary Rules), so it has no data of its own to lose. Provider-owned durability remains with each provider.

## Recovery Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U03-01 | Every recoverable failure retains entered values, form and dialog context, tab, list context, and logical focus. | A failure path that clears a draft or resets the tab. |
| REL-U03-02 | The mutation reducer is exhaustive across all nine dispositions; no response falls through to a generic error. | An unmapped provider response producing an untyped state. |
| REL-U03-03 | No state advances on duplicate submit, conflict, denial, timeout, or unknown outcome. | A lifecycle badge or history row changing before an authoritative re-read. |
| REL-U03-04 | Unknown outcome is presented as neither success nor failure and blocks retry until an authoritative re-read. | A Retry control offered directly from an unknown-outcome state. |
| REL-U03-05 | An explicit retry reuses the original server-derived replay key so the provider's idempotency makes it duplicate-safe. | A retry producing a second provider-side effect. |
| REL-U03-06 | Success is never announced from the submitted command alone. | A success state rendered without a completed re-read. |
| REL-U03-07 | Provider acceptance with a failed confirmation read is reported as accepted-with-confirmation-unavailable, never as confirmed. | An `accepted-unconfirmed` branch rendering submitted values as provider truth. |

## Graceful Degradation

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U03-08 | Last-known business truth renders only when the owning provider supplies it with source and `dataUpdatedAt` under current authorization. | Stale content rendered from browser memory, storage, or a cache. |
| REL-U03-09 | While stale truth is shown, every freshness-dependent command is disabled with a precise reason. | An enabled lifecycle command on a stale record. |
| REL-U03-10 | A separately sourced region failure (a bound rate version, a Reference label, the D&D region) is contained to that region with an exactly owned Retry. | A single region failure blanking the record or removing the tab. |
| REL-U03-11 | Status history shares Summary's read result and claims no independent failure state; incomplete provider `activity` is reported as a provider-signalled partial-history condition. | A "Summary ok, History unavailable" state, which the single `getAgreement` seam cannot produce. |
| REL-U03-12 | Retry is user-triggered and scoped to the failed read, region, or command. | An automatic retry, an auto-refresh presented as freshness, or a blind replay of an uncertain command. |

## Failure-Mode Coverage

The unit's reliability is only as good as the fixtures that exercise it. The following must all be represented as live fixtures, not simulated in the client: provider outage with trustworthy persisted truth; provider outage without it; Identity outage; DENY; not-found; validation rejection; provider lifecycle/policy rejection; stale version conflict; duplicate submission; timeout after dispatch (unknown outcome); malformed provider response; Reference option outage; and an unadmitted queue segment.

## Verification

Reliability evidence comes from route and component tests for context retention, duplicate prevention, and focus, and from live Compose runs exercising each failure fixture above. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass — a design that describes a recovery path the fixtures never trigger has not demonstrated reliability. The evidence feeds the NFR-007 blocking gate at intent exit.
