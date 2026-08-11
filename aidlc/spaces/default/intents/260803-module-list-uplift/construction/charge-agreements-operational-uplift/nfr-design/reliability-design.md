# Reliability Design - U03 Charge Agreements Operational Uplift

## Source Alignment

This design realizes the REL-U03 requirements in `reliability-requirements.md` using the outcome model, unknown-outcome recovery algorithm, and degradation workflow in `business-logic-model.md`, within the stack in `tech-stack-decisions.md` and the boundaries in `scalability-requirements.md` and `security-requirements.md`. Per the answered Q2, the resilience that actually exists is designed and the rest is explicitly excluded.

**Consumed inputs.** `reliability-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the outcome model and recovery algorithms; `tech-stack-decisions.md` fixes the language and framework properties the exhaustiveness guarantee rests on; `security-requirements.md` supplies the fail-closed ordering that removes partial-execution states; `scalability-requirements.md` establishes that resource exhaustion is not a failure mode of this topology; and `performance-requirements.md` records the deliberate latency cost of the authoritative re-read.

## The Resilience That Exists

U03's reliability does not come from infrastructure patterns. It comes from four structural properties, each of which is testable.

### 1. Fail-closed ordering

Policy precedes provider access on every path. A denied or Identity-unavailable request cannot reach Charge or Reference, so an authorization failure can never partially execute. This is the same ordering the security design specifies; its reliability value is that there is no half-completed state to recover from.

### 2. Exhaustive typed outcomes

Every command reduces to exactly one of nine dispositions, and the reducer switches exhaustively. There is no default branch and no generic error — an unmapped provider response is itself a typed `unexpected` with a boundary discriminator. The design consequence: every failure has a defined UI state, a defined recovery affordance, and a defined retry rule, decided at design time rather than improvised at runtime.

The nine dispositions and their recovery semantics are specified in `business-logic-model.md`; this design's contribution is that TypeScript's exhaustiveness checking makes the completeness a compile-time property rather than a review question.

### 3. Region-scoped containment

Failure is contained to the seam that produced it. Bound rate versions, Reference labels, and the D&D region each resolve independently and fail independently, with a Retry that names its exact owner. Summary and Status history share the one atomic `getAgreement` read and therefore fail together — the design does not claim independence the seam cannot deliver.

The blast radius of any single dependency failure is therefore one region, and verified Agreement truth plus tab and list context survive it.

### 4. Provider-owned idempotency for safe retry

An explicit retry reuses the original server-derived replay key, so the provider's idempotency makes it duplicate-safe. This is what allows retry to be offered at all after an uncertain outcome — but only *after* an authoritative re-read establishes what actually happened.

## Recovery Design

```
command dispatched
  |- definitive response  -> map to disposition -> retain context, offer defined recovery
  `- no definitive answer (timeout/disconnect)
       -> unavailable-unknown-outcome
       -> announce "unknown", NOT success or failure
       -> block retry
       -> reauthorize + authoritative re-read by exact Agreement ID
            |- transition observed      -> accepted-confirmed from the re-read value
            |- state unchanged          -> explicit retry permitted (same replay key)
            |- state changed, mismatched -> conflict; never overwritten
            `- re-read denied/unavailable -> remain unknown; mutation stays disabled
```

The design principle throughout: **uncertainty is a state, not a failure**. Collapsing it into either success or failure is what produces false success or duplicate writes, so it gets its own disposition, its own UI treatment, and its own mandatory verification step.

## Degradation Design

Last-known truth renders only when the provider supplies it with source and `dataUpdatedAt` under current authorization; while shown, every freshness-dependent command is disabled with a precise reason. There is no fallback to browser memory, storage, or a cache — those would be an unowned second source of truth, which is exactly what the no-cache boundary forecloses.

Retry is always user-triggered and scoped to the failed read, region, or command. Nothing auto-refreshes into an implied claim of freshness.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Circuit breaker | Would suppress calls based on recent failure history — but authorization must be evaluated per request regardless, and a tripped breaker would need a fallback response, which can only be a cache or a fabricated state | FR-020; Application Design (no cache) |
| Automatic retry with backoff | Directly contradicts the no-silent-advance rule; an automatic retry of an uncertain command is exactly the duplicate-write risk the unknown-outcome design exists to prevent | NFR-005, BR3-045 |
| Bulkhead / thread-pool isolation | Region containment is already achieved at the call-composition level; a thread-pool bulkhead addresses a resource-exhaustion mode that a ten-user local topology does not exhibit | `scalability-requirements.md` |
| Fallback-to-cache on outage | A cache would be an unowned second source of truth; stale rendering requires provider-supplied source and time | FR-019, FR-020 |
| Health-check-driven failover | Single instance per app in the acceptance topology; no failover target exists | NFR-012, `services.md` |
| Data replication / backup / restore | U03 adds no persistence; provider durability is provider-owned | U03 non-responsibilities |
| Graceful-degradation-to-read-only mode | Already the behaviour when mutation capability or freshness is absent, expressed per command rather than as a global mode | `business-rules.md` BR3-005 |

Circuit breakers and automatic retry are the two most likely to be added by a well-meaning later reader, which is why their exclusion carries an explicit reason rather than silence.

## Failure-Domain Summary

| Failing dependency | Blast radius | User-visible result |
| --- | --- | --- |
| Identity | All U03 routes | Retryable unavailable; zero provider calls |
| Charge provider (detail read) | The record | Provider error, or stale truth with commands disabled if source and time supplied |
| Charge provider (one rate version) | That rate row and the Rates panel | Panel-scoped failure with owned Retry; Summary intact |
| Reference option port | Labels and canonical-validation actions | Raw authorized IDs with `Label unavailable`; affected actions unavailable |
| W3-01 D&D contract | The D&D region only | Honest not-integrated state |
| Queue segment contract | That segment only | Segment unavailable with owner and evidence |

## Verification

Route and component tests cover exhaustive disposition mapping, context and focus retention, and duplicate-submit prevention. Contract tests cover replay-key reuse, version propagation, and the post-acceptance re-read. Live Compose runs exercise every fixture listed in `reliability-requirements.md` §Failure-Mode Coverage. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass.
