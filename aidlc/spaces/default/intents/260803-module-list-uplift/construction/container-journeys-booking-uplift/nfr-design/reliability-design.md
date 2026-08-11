# Reliability Design - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

This design realizes the REL-U04 requirements in `reliability-requirements.md` using the capture outcome model, four-truths model, and degradation workflow in `business-logic-model.md`, within the stack in `tech-stack-decisions.md` and the boundaries in `scalability-requirements.md` and `security-requirements.md`. Per Q2, the resilience that exists is designed and the rest explicitly excluded.

U04 is the unit where reliability is most load-bearing, because it is the only one that writes through a path whose downstream it does not own.

**Consumed inputs.** `reliability-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the outcome model and recovery algorithms; `tech-stack-decisions.md` fixes the language and framework properties the exhaustiveness guarantee rests on; `security-requirements.md` supplies the fail-closed ordering that removes partial-execution states; `scalability-requirements.md` establishes that resource exhaustion is not a failure mode of this topology; and `performance-requirements.md` records the deliberate latency cost of the authoritative re-read.

## The Resilience That Exists

### 1. Fail-closed ordering, twice

Read authorization precedes any CMM or Reference call; capture authorization is a second, independent decision before any token is minted. An unauthorized capture therefore produces no token, no provider call, and no partial state.

### 2. Exhaustive typed outcomes, with duplicate and sequence kept apart

Ten dispositions, exhaustively switched, no default branch. `duplicate` and `out-of-sequence` are deliberately distinct: one means "this already happened", the other means "this cannot happen yet". Collapsing them would tell an operator to correct input when the correct action is to do nothing — a usability failure with data consequences.

### 3. Two independent capture gates

Capture requires the capability **and** provider `captureEnabled`, and separately requires location validation to be available. Each gate reports its own reason. A single "capture unavailable" message would leave an operator unable to tell "you lack permission" from "the provider says not yet" from "we cannot verify locations right now" — three different situations with three different next actions.

### 4. Provider-owned idempotency with token lifecycle

The attempt token carries a server-generated key; the provider's idempotency receipt makes an explicit retry duplicate-safe. Definitive validation or conflict issues a replacement token; an unknown outcome retains the original so an eventual retry lands on the same key.

### 5. Four truths, never rolled up

Journey persisted, published to outbox, delivered by broker, applied to Booking projection are rendered only from their own evidence. **No aggregate status is derived** — and with no replay contract in place, an inferred "applied" could be indefinitely wrong. This is the clearest case in the intent where a convenience feature would be a correctness defect.

## Recovery Design

```
capture dispatched
  |- definitive response -> map to one of ten dispositions -> retain context, defined recovery
  `- no definitive answer (timeout/disconnect)
       -> unavailable-unknown-outcome
       -> announce "unknown", NOT success or failure
       -> retain attempt token, block retry
       -> reauthorize + authoritative Journey re-read
            |- movement observed        -> accepted-confirmed from the re-read
            |- not observed             -> explicit retry permitted (same token, same key)
            |- observed but different   -> conflict; never overwritten
            `- re-read denied/unavailable -> remain unknown; capture stays disabled
```

Uncertainty is a state, not a failure. No journey status, timeline entry, or next-move expectation advances anywhere in the client before provider acceptance **and** authoritative re-read.

## Degradation Design

Last-known truth renders only with provider source and `dataUpdatedAt` under current authorization, and capture is disabled with a precise reason while it is shown. Summary and timeline share the one atomic read and fail together — the design claims no independence the seam cannot deliver. The Booking-relationship region and location labels are separate calls and fail independently, each with an exactly owned Retry.

An absent `bookingId` is surfaced as a provider contract failure, never a search prompt — the failure mode of guessing is a wrong link, which is worse than no link.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Circuit breaker | Authorization must be evaluated per request regardless, and a tripped breaker needs a fallback response — which could only be a cache or a fabricated state | FR-020; Application Design (no cache) |
| Automatic retry with backoff | Contradicts no-silent-advance; auto-retrying an uncertain capture is precisely the duplicate-write risk the unknown-outcome design prevents | NFR-005, BR4-049 |
| Bulkhead / thread-pool isolation | Region containment is achieved at call composition; resource exhaustion is not a failure mode of a ten-user local topology | `scalability-requirements.md` |
| Fallback-to-cache on outage | Unowned second source of truth; stale rendering requires provider source and time | FR-019, FR-020 |
| Health-check-driven failover | One instance per app; no failover target exists. `/api/health` is a container check, not a readiness proxy | NFR-012 |
| Data replication / backup / restore | U04 adds no persistence | U04 non-responsibilities |
| **Kafka retry / DLQ / replay design** | W4 adds no topic and must not invent messaging controls it does not own. Designing one here would create the appearance of a control that does not exist in the running system | `services.md`; the recorded BLOCKED exit |
| Compensating transactions / saga | CMM capture is a single aggregate command; there is no distributed transaction to compensate | `services.md` orchestration section |

The Kafka row is the most important exclusion in this artifact: the gap is real, it is a hard completion condition, and the correct response is to leave it visibly open rather than to design around it.

## Failure-Domain Summary

| Failing dependency | Blast radius | User-visible result |
| --- | --- | --- |
| Identity | All U04 routes and capture | Retryable unavailable; zero provider calls |
| CMM service (detail) | The Journey record and its timeline together | Provider error, or stale truth with capture disabled if source and time supplied |
| CMM service (relationship lookup from Booking) | The Booking page's relationship region only | Scoped Retry; Booking page intact |
| Reference location port | Labels, and capture's second gate | Raw authorized IDs; capture disabled with its own reason |
| Provider `captureEnabled=false` | Capture only | Provider's `captureDisabledReason` shown |
| Kafka partition blocked by a poison record | Booking's projected movement evidence only | CMM Journey truth, synchronous reads, and direct lookup remain correct and available |
| Assertion key material | All v2 calls | Fail closed; no fallback to v1 or default JSON |

## Verification

Route and component tests cover exhaustive disposition mapping, the two distinct capture gates, context and focus retention, and duplicate-submit prevention. Contract tests cover token replacement versus retention, idempotency-key forwarding, and the post-acceptance re-read. Provider tests cover idempotency receipts and sequence rules. Live Compose runs exercise every fixture in `reliability-requirements.md` §Failure-Mode Coverage, including a blocked-partition scenario demonstrating the stated blast radius. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass — and the poison/replay exit keeps U04 and the intent not done regardless of what else passes.
