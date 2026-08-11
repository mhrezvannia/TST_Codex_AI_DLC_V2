# Reliability Design - U01 Platform and Reference Route Foundation

## Source Alignment

This design realizes the REL-U01 requirements in `reliability-requirements.md` using the read pipeline and route workflows in `business-logic-model.md`, within the stack in `tech-stack-decisions.md` and the boundaries in `scalability-requirements.md` and `security-requirements.md`. Per Q2, only the resilience that exists is designed.

U01 has no mutation path, so its reliability design is read degradation, route resilience, and context preservation — and, because it is the walking skeleton, it **fixes the recovery grammar** that U02, U03, and U04 extend rather than redefine.

**Consumed inputs.** `reliability-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the outcome model and recovery algorithms; `tech-stack-decisions.md` fixes the language and framework properties the exhaustiveness guarantee rests on; `security-requirements.md` supplies the fail-closed ordering that removes partial-execution states; `scalability-requirements.md` establishes that resource exhaustion is not a failure mode of this topology; and `performance-requirements.md` records the deliberate latency cost of the authoritative re-read.

## The Recovery Grammar U01 Establishes

Four properties, each inherited unchanged by the other units.

### 1. Exhaustive `ReadResult` mapping

Every read reduces to exactly one of `ok`, `invalid-query`, `not-found`, `denied`, `stale`, or `unavailable`, switched exhaustively with no default branch. Each has a defined route state, a defined recovery affordance, and defined focus behaviour. TypeScript's exhaustiveness checking makes completeness a compile-time property rather than a review question.

### 2. The outage-versus-denial distinction

Both fail closed and both make zero provider calls, but they are never conflated: denial is terminal for that subject and offers no retry; outage is transient and offers one. Collapsing them would either invite pointless retries against a permission failure or hide a recoverable outage behind a permission message.

### 3. The trustworthy-stale rule

Last-known truth renders only when the authorized owning provider supplies it with source and time. Where no such view exists, the route shows provider error rather than fabricated or remembered content. Browser memory, storage, and cached authorization are never fallback truth — which is what makes "stale" a provider-attested state rather than a client convenience.

### 4. Scoped, user-triggered retry

Retry repeats the full pipeline including session resolution and the policy decision. Nothing auto-refreshes into an implied claim of freshness, and no retry skips reauthorization.

## Route Resilience Design

Direct navigation and refresh follow the same pipeline and require no prior browser state — every route is reachable cold. Route state is URL-backed, so a shared or refreshed URL reproduces the same view; this is a reliability property as much as a usability one, because it means recovery from any failure is "reload the URL" rather than "retrace the navigation".

Validated list context — supported filters, page, and invoking-row focus — survives navigation to detail and back. Invalid or absent context falls back to the canonical list rather than failing or guessing at a record.

Failure is target-scoped at the edge: a Reference outage leaves other module prefixes serving. This is the property U04's new mount later relies on.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Circuit breaker | Authorization must be evaluated per request regardless, and a tripped breaker needs a fallback response — which could only be a cache or a fabricated state | FR-020; Application Design (no cache) |
| Automatic retry with backoff | Retry must reauthorize and be user-triggered; an automatic retry would repeat a policy decision the user never asked to repeat and could mask a persistent outage | REL-U01-06, FR-020 |
| Bulkhead / thread-pool isolation | Addresses resource exhaustion, which a ten-user local topology does not exhibit; edge target-scoping already contains cross-module failure | `scalability-requirements.md` |
| Fallback-to-cache on outage | Unowned second source of truth; stale rendering requires provider source and time | FR-019, FR-020 |
| Health-check-driven failover | One instance per app; no failover target exists | NFR-012, `services.md` |
| Data replication / backup / restore | U01 adds no persistence; Reference durability is provider-owned | U01 non-responsibilities |
| Graceful degradation to read-only mode | U01 is already read-only; there is no mutation to disable | U01 scope |
| Compensating transactions | No writes at all | U01 scope |

Circuit breakers and automatic retry are the two a later reader is most likely to add, so their exclusion carries an explicit reason rather than silence — particularly here, since a change to the skeleton's grammar would propagate to every unit.

## Failure-Domain Summary

| Failing dependency | Blast radius | User-visible result |
| --- | --- | --- |
| Identity | All U01 routes | Retryable unavailable, 503, zero provider calls |
| Reference provider | The requested route | Provider error, or stale truth with source and time if supplied |
| Reference provider (history facet on detail) | The history panel only | Scoped panel failure; Summary and identity intact |
| Shared shell package | All four apps | Cross-unit; W2-02-owned, recorded as the intent's largest correlated surface |
| Edge (Reference location) | `/reference-data*` only | Other module prefixes continue serving |

## Verification

Route and component tests cover exhaustive state mapping, context and focus preservation, and safe-return fallback. Live Compose runs exercise every fixture in `reliability-requirements.md` §Failure-Mode Coverage, including target-scoped failure across prefixes and direct refresh under each state. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass; evidence feeds the NFR-007 blocking gate at intent exit.
