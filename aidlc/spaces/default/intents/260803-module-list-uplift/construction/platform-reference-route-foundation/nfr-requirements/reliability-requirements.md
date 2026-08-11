# Reliability Requirements - U01 Platform and Reference Route Foundation

## Source Alignment

These requirements scope `requirements.md` NFR-005, FR-019, and FR-021 to U01. The failure surface comes from this unit's `business-logic-model.md` (the canonical read pipeline's failure steps and route workflows) and `business-rules.md` (its provider-truth and failure rules, safe-navigation rules). `technology-stack.md` bounds availability claims to the local Compose topology.

U01 has no mutation path, so its reliability scope is read degradation, route resilience, and context preservation — the recovery grammar the other three units inherit.

## Availability Posture

U01 asserts **no** availability target, SLA, SLO, error budget, RTO, or RPO. Identity and the Reference service own their own availability; U01 owns only its behaviour when they are unavailable. It adds no persistence, so it has no data of its own to back up or restore.

## Read Degradation Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U01-01 | `ReadResult<T>` is mapped exhaustively to a route state; no response falls through to a generic error. | An unmapped provider response producing an untyped state. |
| REL-U01-02 | Identity outage maps to retryable `unavailable`/503 with zero provider calls and a safe message and reference. | A provider call on the outage path, or an outage rendering as a denial. |
| REL-U01-03 | Last-known truth renders only when the authorized owning provider supplies it with source and time. | Stale content served from browser memory, storage, or a cache. |
| REL-U01-04 | Where no trustworthy persisted view exists, the route shows provider error rather than fabricated or client-cached truth. | Any placeholder, sample, or remembered data standing in for provider truth. |
| REL-U01-05 | True empty and provider error are visibly distinct states. | An empty set rendering as an error, or an error rendering as empty. |
| REL-U01-06 | Retry is user-triggered and repeats the full pipeline including session and policy. | An automatic retry, or a retry that skips reauthorization. |

## Route and Context Resilience

| ID | Requirement | Falsified by |
| --- | --- | --- |
| REL-U01-07 | Direct navigation and refresh follow the same pipeline and require no prior browser state. | A route that renders only after a list visit. |
| REL-U01-08 | A failure scoped to one prefix leaves other module prefixes available. | A Reference outage taking down the root or another module. |
| REL-U01-09 | Validated list context — filters, page, and invoking-row focus — survives navigation to detail and back. | A return that loses page or focus, or restores an unvalidated value. |
| REL-U01-10 | Invalid or absent return context falls back to the canonical list rather than failing or guessing. | An error page, or navigation to a guessed record. |
| REL-U01-11 | Route state is URL-backed, so a shared or refreshed URL reproduces the same view. | A view reachable only through in-session navigation. |

## Failure-Mode Coverage

Required as live fixtures, not client simulations: Identity outage; DENY; Reference provider outage with trustworthy persisted truth; provider outage without it; not-found for an unknown `setCode` and for an unknown `recordId`; invalid query (duplicate, unknown, malformed, overlong, traversal, encoded separator, out-of-prefix); unsafe return target; true empty set; and partial provider history on the thin detail.

## What U01 Establishes for the Other Units

U01 fixes the recovery grammar the rest of Construction reuses: exhaustive `ReadResult` mapping, the outage-versus-denial distinction, the trustworthy-stale rule, scoped retry, and the safe-return contract. The other units extend it with mutation dispositions, but none of them redefines it. A defect in this grammar is therefore a cross-unit defect, which is why it is proven on the thinnest possible slice first.

## Verification

Route and component tests cover state mapping, context and focus preservation, and safe-return fallback. Live Compose runs exercise every fixture above, including target-scoped failure across prefixes. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass. Evidence feeds the NFR-007 blocking gate at intent exit.
