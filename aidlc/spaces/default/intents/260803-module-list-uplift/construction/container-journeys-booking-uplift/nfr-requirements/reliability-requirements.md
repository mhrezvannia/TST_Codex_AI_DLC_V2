# Reliability Requirements - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

These requirements scope `requirements.md` NFR-005, FR-019, and FR-021 to U04. The failure surface comes from `business-logic-model.md` (the capture outcome model, the four event truths, the degradation workflow) and `business-rules.md` (BR4-050 through BR4-058 result and event-truth rules, BR4-070 through BR4-075 degradation rules). `technology-stack.md` bounds availability claims to the local Compose topology.

U04 is the unit where reliability is most load-bearing, because it is the only one that writes through an asynchronous path it does not own.

## Availability Posture

U04 asserts **no** availability target, SLA, SLO, error budget, RTO, or RPO. CMM, Booking, Reference, and Identity each own their own availability. U04 owns only its behaviour when they are unavailable. It adds no persistence of its own, so it has no data to back up or restore; provider-owned durability stays with each provider.

## Capture Recovery Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U04-01 | The capture reducer is exhaustive across all ten dispositions; no response falls through to a generic error. | An unmapped provider response producing an untyped state. |
| REL-U04-02 | `duplicate` and `out-of-sequence` remain distinct and are never collapsed. | One rejection message serving both. |
| REL-U04-03 | No journey status, timeline entry, or next-move expectation advances before provider acceptance and authoritative re-read. | Any client-side optimistic update. |
| REL-U04-04 | Unknown outcome is presented as neither success nor failure and blocks retry until an authoritative re-read. | A Retry offered directly from an unknown-outcome state. |
| REL-U04-05 | An explicit retry reuses the retained attempt token so the provider's idempotency receipt makes it duplicate-safe. | A retry producing a second recorded movement. |
| REL-U04-06 | Every non-confirmed branch retains entered values, form context, and logical focus. | A failure path clearing the draft. |
| REL-U04-07 | Success is never announced from the submitted command alone. | A success state rendered without a completed re-read. |

## Event-Truth Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U04-08 | Journey persistence, outbox publication, broker delivery, and Booking projection application are rendered only from their own evidence. | Any one being inferred from another. |
| REL-U04-09 | No aggregate or roll-up status is derived across the four truths. | A single "sync status" indicator combining them. |
| REL-U04-10 | Publication and Booking-application status are not shown at all absent an approved public contract. | Either appearing in the UI. |
| REL-U04-11 | History is append-only; no correction, publication, or application status is displayed without an approved contract. | An edited or retracted history entry. |

## Degradation Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U04-12 | Last-known truth renders only with provider source and `dataUpdatedAt` under current authorization. | Stale content from browser memory, storage, or a cache. |
| REL-U04-13 | While stale truth is shown, capture is disabled with a precise reason. | An enabled capture on a stale record. |
| REL-U04-14 | Summary and timeline share the one atomic v2 read and claim no independent failure state. | A "Summary ok, timeline unavailable" state the single seam cannot produce. |
| REL-U04-15 | The Booking-relationship region and location labels fail independently, each with an exactly owned Retry. | A relationship failure blanking the Journey record. |
| REL-U04-16 | The two capture-disable gates — capability plus `captureEnabled`, and location-validation availability — report distinct reasons. | One generic "capture unavailable" message covering both. |
| REL-U04-17 | An absent `bookingId` is surfaced as a provider contract failure, never a search prompt. | A search affordance offered in place of the link. |
| REL-U04-18 | Retry is user-triggered and scoped to the failed read, region, or command. | An automatic retry or a blind replay of an uncertain capture. |

## The Poison/Replay Gap

Both Kafka listeners run with stable consumer groups and concurrency three and have **no** configured error handler, bounded retry policy, dead-letter topic, poison-message ledger, or replay contract. W4 adds no topic and does not invent these controls.

The blast radius is stated rather than mitigated: one poison record can repeatedly block its partition. Other partitions, owning-service persisted truth, synchronous module reads, and the direct Booking-to-Journey lookup remain available, and CMM-to-Booking lag affects Booking's projected movement evidence only — never CMM Journey truth. This is precisely why the four event truths must stay separate in the UI: with no replay contract, an inferred "applied" status could be indefinitely wrong.

**This gap is a hard completion condition.** U04 and W4-01 remain not done until the owners supply verified controls or approve a bounded replacement through change control. Truthful `BLOCKED` labelling is honest reporting, not completion.

## Failure-Mode Coverage

Required as live fixtures, not client simulations: CMM outage with and without trustworthy persisted truth; Identity outage; DENY on read and separately on capture; not-found; validation rejection; duplicate; out-of-sequence; timeout after dispatch; malformed provider response; expired and tampered assertion; expired and tampered attempt token; expired and invalid origin token in both directions; Reference location outage; `captureEnabled=false` with provider reason; Booking relationship present, not-created, denied, and unavailable.

## Verification

Route and component tests cover context retention, duplicate prevention, gate distinction, and focus. Provider tests cover idempotency receipts and sequence rules. Live Compose runs exercise every fixture above. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass. Evidence feeds the NFR-007 blocking gate, which cannot close while the poison/replay exit is open.
