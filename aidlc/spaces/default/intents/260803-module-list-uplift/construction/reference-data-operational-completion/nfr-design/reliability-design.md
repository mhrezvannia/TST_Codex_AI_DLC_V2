# Reliability Design - U02 Reference Data Operational Completion

## Source Alignment

This design realizes the REL-U02 requirements in `reliability-requirements.md` using the mutation outcome model, unknown-outcome recovery algorithm, conflict workflow, and degraded read workflow in `business-logic-model.md`, within the stack in `tech-stack-decisions.md` and the boundaries in `scalability-requirements.md` and `security-requirements.md`. Per Q2, only the resilience that exists is designed.

U02 is where W4-01 first answers "what happens when a write's outcome is unknown". That answer is inherited and extended by U03 and U04, so getting it right here matters beyond this unit.

**Consumed inputs.** `reliability-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the outcome model and recovery algorithms; `tech-stack-decisions.md` fixes the language and framework properties the exhaustiveness guarantee rests on; `security-requirements.md` supplies the fail-closed ordering that removes partial-execution states; `scalability-requirements.md` establishes that resource exhaustion is not a failure mode of this topology; and `performance-requirements.md` records the deliberate latency cost of the authoritative re-read.

## The Resilience That Exists

### 1. Fail-closed ordering, per command

Read, create, and update each evaluate policy before provider access. An authorization failure cannot partially execute because the provider is unreachable past the policy branch.

### 2. Exhaustive typed outcomes

Nine dispositions, exhaustively switched, no default branch. An unmapped provider response is itself a typed `unexpected` with a boundary discriminator (`BFF` vs `PROVIDER_PROTOCOL`), so even the unforeseen has a defined state and a defined recovery.

### 3. Stable identity before dispatch

This is the design decision that makes unknown outcomes recoverable at all. The BFF allocates a UUID **before** the create request leaves, and uses the provider's existing PUT-by-ID `version=0` seam. Because the attempt has an identity the client chose, an exact-ID re-read can answer "did this happen?" — which a provider-allocated identity could not.

Browser-facing semantics stay POST; the identity allocation is invisible to the client and unavailable to it.

### 4. Explicit reconciliation over silent resolution

A version mismatch never merges, overwrites, or resubmits. It retains the draft, shows current provider truth, and requires the user to choose. The design accepts more user friction in exchange for never losing an edit silently.

## Recovery Design

```
command dispatched
  |- definitive response -> map to disposition -> retain draft/context, defined recovery
  `- no definitive answer (timeout/disconnect)
       -> unavailable-unknown-outcome
       -> freeze submitted draft, stable target identity, correlation
       -> announce "unknown", NOT success or failure
       -> reauthorize read, then fetch the EXACT id
            (attemptRecordId for create; recordId for update)
            |- create: matching persisted content   -> observed success
            |- create: same id, different content   -> conflict/support; never overwritten
            |- create: authoritative terminal 404   -> explicit retry may reuse the same id
            |- update: version/content shows applied -> accepted-confirmed from the re-read
            `- still indeterminate                  -> mutation stays disabled; reference guidance
```

The three create branches are the heart of it, and each must be exercised as a live fixture — a design that describes them without testing them has not demonstrated recovery.

## Degradation Design

Last-known truth renders only when the authorized owning provider supplies it with source and time; while shown, every mutation command is absent or disabled with a precise freshness reason. No fallback to browser memory, storage, or cache.

History failure is scoped to its panel when Summary and Attributes remain trustworthy. True empty and filtered empty are distinct states, with filtered empty used only when `includeInactive` is active and the provider response establishes the distinction — conflating them would tell an operator their filter found nothing when the set is genuinely empty.

Retry is user-triggered, scoped to the failed read, facet, or command, and always reauthorizes.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Circuit breaker | Authorization is per-request regardless, and a tripped breaker needs a fallback response — only a cache or a fabricated state could serve one | FR-020; Application Design (no cache) |
| Automatic retry with backoff | Auto-retrying a command whose outcome is unknown is exactly the duplicate-write risk the recovery design prevents; retry must follow an authoritative re-read and a human decision | BR2-042, BR2-046, NFR-005 |
| Bulkhead / thread-pool isolation | Addresses resource exhaustion, not a failure mode of a ten-user local topology | `scalability-requirements.md` |
| Fallback-to-cache on outage | Unowned second source of truth | FR-019, FR-020 |
| Health-check-driven failover | One instance per app; no failover target | NFR-012 |
| Data replication / backup / restore | U02 adds no persistence; the attempt ID is a provider record identity, not a stored idempotency record | `business-rules.md` persistence boundary |
| Compensating transactions / saga | Each command is a single provider operation; there is no distributed transaction to compensate | `services.md` orchestration section |
| Optimistic UI with rollback | Would render unconfirmed input as truth and then retract it — precisely the false-success failure the disposition model exists to prevent | BR2-036 |
| Auto-save / draft recovery persistence | Drafts are transient; persisting them would outlive the authorization that permitted them | `business-rules.md` persistence boundary |

The last two are the ones most likely to be proposed as "better UX", which is why each carries an explicit reason.

## Failure-Domain Summary

| Failing dependency | Blast radius | User-visible result |
| --- | --- | --- |
| Identity | All U02 routes and commands | Retryable unavailable, 503, zero provider calls |
| Reference provider (read) | The requested route | Provider error, or stale truth with commands disabled if source and time supplied |
| Reference provider (history facet) | The history panel only | Scoped failure; Summary and Attributes intact |
| Reference provider (during command) | The command only | One of nine dispositions; draft and context always retained |
| Network after dispatch | The command's certainty, not its outcome | Unknown state; exact-ID re-read required before retry |
| Catalog fixture drift | Release, not runtime | Build-time failure blocking release |
| Shared shell package | All four apps | Cross-unit; W2-02-owned |

The catalog-drift row is deliberate: it is the one failure U02 moves *out* of runtime and into the build, which is the strongest form of containment available.

## Verification

Route and component tests cover exhaustive disposition mapping, draft retention, dirty protection, duplicate prevention, and focus. Contract tests cover exact-version propagation, stable-ID create, result-to-HTTP mapping, and the post-acceptance re-read. Concurrency tests prove a stale version cannot overwrite and a create retry cannot duplicate. Live Compose runs exercise every fixture in `reliability-requirements.md` §Failure-Mode Coverage — including all three create-recovery branches. Per NFR-011 an unexercised failure branch is BLOCKED evidence, not a pass.
