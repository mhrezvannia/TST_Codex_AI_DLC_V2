# Performance Design - U03 Agreement Authority

## Design decision and boundary

U03 uses bounded synchronous application commands, indexed PostgreSQL reads,
one Charge datasource transaction per committed mutation, and the existing
post-commit outbox relay. It adds no cache, read replica, CQRS model, new broker,
or new service. The design targets the isolated `linercore-wave-a` fixture and
does not convert local acceptance numbers into production SLOs.

The brownfield seam remains recognizable: the current
`ChargeAgreementApplicationService` already coordinates authorization,
reference validation, `AgreementRepository`, and `OutboxRepository` inside
Spring transaction boundaries. U03 replaces its mutable one-row agreement
logic behind those ports with version-aware commands rather than adding a
parallel application service.

## End-to-end latency budgets

All budgets are measured after the declared warm-up and include unsuccessful
expected outcomes. A per-operation breach fails even if the aggregate is fast.

| Path | Budget allocation | Limit |
| --- | --- | --- |
| vendor list/detail | ingress and validation 75 ms; authorization 100 ms; JDBC/query 350 ms; mapping/serialization 150 ms; contingency 75 ms | p95 <=750 ms |
| create/edit | ingress 75 ms; authorization 100 ms; bounded reference validation 300 ms; rate/link checks and transaction 350 ms; response 75 ms; contingency 100 ms | p95 <=1,000 ms |
| approve/successor | ingress 75 ms; authorization 100 ms; key/header lock plus revalidation and write 550 ms; response 75 ms; contingency 200 ms | p95 <=1,000 ms |
| suspend/expire | ingress 75 ms; authorization 100 ms; optimistic-lock transaction 350 ms; response 75 ms; contingency 400 ms | p95 <=1,000 ms |

The healthy-path percentile workload uses healthy dependencies and a fixed
operation mix. It includes successful commands plus expected domain 4xx
outcomes such as validation, stale-version, overlap, and one-Draft conflicts;
those unsuccessful outcomes remain in the per-operation p95 samples.
Dependency fault injection is a separate deterministic suite because its
approved maximum is two seconds and cannot be mixed into a one-second p95
without making the result depend on fault frequency. Every injected Identity or
Reference timeout must return its typed failure within 2,000 ms, and its samples
remain visible in the same raw evidence bundle under a distinct
`dependency-fault` scenario.

## Request and transaction shape

1. Parse and bound the selected media dialect before allocating domain graphs.
2. Authorize the exact action and obtain one trusted subject decision.
3. Run the five typed Reference Data checks through the shared U01 adapter,
   capped at five concurrent calls per command and 50 service-wide permits.
4. Load the three supplied RateVersion rows in one set query and validate exact
   category, code, lifecycle, coverage, and applicability.
5. Enter the single writer transaction. Approval first acquires the canonical
   authority-key advisory transaction lock; successor first locks the stable
   header; edit and terminal transitions use their exact optimistic version.
6. Re-read every mutable authority input required by the command, persist the
   complete version/link/activity/outbox set, and return the committed view.

No whole mutation is retried automatically. A caller reconciles an uncertain
result through authorized detail/activity/outbox reads and then uses the same
expected-version rules.

## Database query and index plan

The V3 schema owned by U01 supplies or is extended with indexes supporting these
query shapes:

| Query | Required access path |
| --- | --- |
| stable vendor list | `authority_model`, stable `agreement_number`, `agreement_id`; version filters joined through bounded IDs |
| version history/detail | `agreement_id`, `version_no DESC`; links by `(agreement_version_id, rate_category)`; activity by version/time/ID |
| one-Draft lookup | partial or leading index on `agreement_id, lifecycle` for W2 Draft rows |
| approval overlap | W2 lifecycle plus customer/lane/origin/destination/equipment equality before inclusive `valid_from`/`valid_to` range predicates |
| selected Approved version | stable agreement, lifecycle, validity, and `version_no DESC` |

List queries first select at most 100 stable/version identities, then bulk-fetch
selected versions, exact links, and required labels. Detail uses a fixed number
of set queries. Repository tests fail on per-row link/activity queries, full
history materialization for list rows, or a plan that discards the equality-key
prefix on the 10k/50k/150k fixture.

## Pooling and resource budgets

- Reuse the U01 local Hikari posture: minimum idle 2, maximum pool 10, and
  acquisition timeout 2 seconds. Do not create a U03-specific pool.
- Each HTTP command holds at most one connection and one transaction. External
  validation fan-out is bounded before writer work where semantics allow;
  approval's mandatory post-lock revalidation stays inside the measured budget.
- Ten administrative clients therefore consume at most ten writer connections.
  Relay publication holds no connection while waiting for broker acknowledgement.
- Page size is 1-100. Reason text is 1-512 trimmed characters. Version/link
  collections are bounded by the selected stable aggregate and are never loaded
  globally.
- Record Hikari active/pending/acquisition, PostgreSQL lock/deadlock/query plan,
  JVM heap/GC/RSS/CPU, API outcomes, and relay backlog with low-cardinality tags.

The three-cycle quiescence gate from `performance-requirements.md` remains
blocking: cycle-three heap/RSS must satisfy both the relative/absolute bound and
the no-two-successive-growth rule. An OOM, restart, deadlock, acquisition
timeout, N+1 query, or unbounded row set fails the run.

## Verification design

- Seed exactly the declared stable/version/link distribution with a fixed seed.
- Run per-operation warm-ups outside the measured namespace.
- Fix the healthy population exactly as approved: 50 list and 50 detail calls;
  20 each create, edit, approve, successor, suspend, and expire; and 100 legacy
  calls in the checked-in legacy mix. List contains 10 each first page,
  middle/last, customer/lane, lifecycle/validOn, and empty/multi-version; detail
  contains 25 shallow and 25 deep-history calls. Every operation and aggregate
  is calculated separately, so changing outcome proportions invalidates the run.
- Use two independently wired Spring contexts sharing one PostgreSQL
  Testcontainer for the 20-round contention matrix.
- Capture monotonic raw samples and nearest-rank percentiles by operation and
  media dialect; never combine W2 and legacy samples.
- Preserve query plans and exact DB counts/hashes proving that measured commands
  were neither setup calls nor idempotent replays.

## Upstream trace

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. It realizes their latency, contention, bounded-data,
transaction, media, and evidence constraints without claiming U04 pricing or
U06 live acceptance.

## Review

**Verdict: NOT-READY**

### Critical findings

None.

### High-severity findings

1. **The 120-second outbox recovery claim has no closed worst-case calculation.**
   `scalability-design.md` counts a 60-second retry delay and two five-second
   polls, but does not bound retry jitter, claim/mark transaction time,
   scheduling delay, or broker acknowledgement time. With batch size 50 and ten
   in-flight sends, each batch can require five acknowledgement waves. The
   artifacts therefore do not prove that two batches finish inside the remaining
   50 seconds, and `reliability-design.md` repeats the target without closing the
   gap. Specify numeric upper bounds and show the complete inequality for normal
   recovery and lease-expiry recovery.
2. **The shared relay refactor is not implementable or blast-radius bounded.**
   The design introduces claim leases/worker IDs, publish-outside-transaction,
   configurable retries, and separate outcome marking in the shared
   platform-messaging path, but does not define the row state machine, atomic
   claim SQL/locking rule, lease duration, stale-worker fencing, mark
   idempotency, schema/migration ownership, configuration keys/defaults, or
   compatibility behavior for other relay users. A developer must invent these
   correctness rules, and a defect can affect every producer using the shared
   relay rather than only U03.

### Medium-severity findings

1. **The latency acceptance model conflicts with the dependency-failure
   envelope.** Expected unsuccessful outcomes are included in the one-second
   command budgets, while dependency failure may take up to two seconds. No
   fixed sample mix or separate deterministic assertion explains how p95 is
   evaluated, so the same implementation can pass or fail based only on fault
   frequency. Define the measured workload composition and a distinct maximum
   failure-latency assertion.
2. **The BFF-to-service trust mechanism is an unstated security dependency.**
   `security-design.md` requires the service to validate a "trusted internal
   subject/service context" but does not specify the credential or signed-claim
   format, issuer/audience and expiry checks, replay protection, trusted header
   allow-list, or the component that strips browser-supplied identity headers.
   Exact authorization actions are clear, but the identity handoff they depend
   on is not implementable without another architectural decision.

### Low-severity findings

None.

### Validation results

- **PASS - required sections:** each of the five output artifacts has at least
  two H2 headings (counts: performance 7, security 8, scalability 7,
  reliability 7, logical components 6 before this review).
- **PASS - upstream coverage:** every output names all six consumed files:
  `performance-requirements.md`, `security-requirements.md`,
  `scalability-requirements.md`, `reliability-requirements.md`,
  `tech-stack-decisions.md`, and `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present. The only fenced block is a Mermaid diagram.
- **PASS - structural coherence:** all `LC-U03-01` through `LC-U03-14`
  component IDs resolve to the inventory; transaction boundaries, media
  isolation, authoritative PostgreSQL state, and failure containment agree
  across the five artifacts. No circular component dependency was found.
- **FAIL - quantitative coherence and implementability:** the relay recovery
  bound, shared-relay concurrency protocol, failure-latency measurement, and
  service identity handoff remain under-specified as detailed above.

## Review response

The iteration-one findings are resolved across the design set:

1. `scalability-design.md` and `reliability-design.md` now state numeric retry,
   jitter, lease, scheduler, transaction, acknowledgement, and scheduling bounds
   and show complete normal and lease-expiry recovery inequalities.
2. The relay is now explicitly a Charge-local opt-in coordinator using the
   existing Charge outbox columns. Its row states, atomic claim predicate,
   stale-worker fence, idempotent marks, configuration keys, schema ownership,
   rollback switch, and non-Charge compatibility behavior are specified.
3. Healthy command percentiles include healthy-dependency domain failures;
   injected dependency failures are evaluated by a separate deterministic
   2,000 ms maximum assertion in the same evidence bundle.
4. `security-design.md` now specifies the Identity-issued downstream JWT,
   issuer/audience/authorized-party/expiry checks, bounded replay window, and
   browser-header stripping boundary.

## Gate revision

The request-changes gate replaces the underspecified JWT/exchange statement with
the implementable U02-to-U03 request assertion in `security-design.md`, fixes the
exact healthy workload population above, limits the bounded relay to U03-owned
`w2agr-` rows and five lifecycle types, and defines typed retry/permanent
classification plus eight-attempt exhaustion. These are lead corrections after
the reviewer iteration limit; the historical review verdict remains immutable.
- **Sensor note:** equivalent read-only checks were performed; the framework
  sensor dispatcher was intentionally not run because of the known Windows
  EPERM failure.

## Review - Iteration 2

**Verdict: NOT-READY**

### Critical findings

None.

### High-severity findings

1. **The Charge-local relay still has no row-level ownership boundary.**
   `scalability-design.md` says the opt-in coordinator does not change another
   producer, but its claim predicate selects every eligible
   PENDING/RETRYABLE Charge outbox row. No event-family, producer, coordinator,
   or protocol-version predicate distinguishes U03 rows from legacy, U01, or
   U04 Charge rows in the same table. Enabling the service-global Charge
   coordinator can therefore change retry, lease, and terminal-state behavior
   for other Charge events. Disabling it for non-U03 profiles does not contain
   that blast radius in the active U03 deployment. The design must either prove
   the new protocol is the compatible owner of every Charge outbox row or
   define exclusive row selection, coexistence with the old poller, rollout,
   rollback of PROCESSING rows, and single-owner scheduling. This is reinforced
   by `logical-components.md`, which still says LC-U03-02 through LC-U03-14
   extend the shared platform-messaging library, while
   `scalability-design.md` says that implementation is unchanged.

### Medium-severity findings

1. **The revised latency workload is separated correctly but not fully
   specified.** `performance-design.md` now separates dependency-fault samples
   from healthy-path p95, resolving the incompatible one-second/two-second
   envelopes. However, it only says the success/domain-4xx operation mix is
   "fixed"; it does not give the count or percentage of each outcome within
   each per-operation sample. A slow stale/overlap path below five percent can
   disappear from p95, so two test authors can obtain different verdicts.
   Define the exact deterministic outcome matrix or assert the budget
   independently for each outcome class.
2. **Downstream JWT validation is concrete, but token acquisition remains an
   unstated Identity contract.** The design does not name the Identity
   endpoint/grant or token-exchange shape that binds the authenticated browser
   session's subject to the BFF service credential, nor the failure and key
   rotation/discovery contract. "Obtains ... through the existing server-side
   service credential" is insufficient to establish that the capability
   exists or prevents arbitrary subject minting. Reference the existing
   supported contract or specify it.
3. **Relay error classification and retry exhaustion are undefined.** The row
   protocol includes RETRYABLE and PERMANENT outcomes and four retry delays,
   but does not map broker/registry/serialization/timeout failures to those
   states or say whether the 60-second delay repeats, exhausts, or becomes
   permanent. This affects recovery, alerting, and whether a transient failure
   can be irreversibly stranded.

### Low-severity findings

None.

### Validation results

- **PASS - required sections:** before this iteration-2 section, H2 counts were
  performance 9, security 8, scalability 7, reliability 7, and logical
  components 6.
- **PASS - upstream coverage:** each of the five outputs references all six
  consumed files: `performance-requirements.md`,
  `security-requirements.md`, `scalability-requirements.md`,
  `reliability-requirements.md`, `tech-stack-decisions.md`, and
  `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present; the sole fenced block is Mermaid.
- **PASS - recovery arithmetic:** retry, jitter, polling, claims,
  acknowledgement waves, marks, lease, and scheduler margin now produce closed
  95-second normal and 64-second lease-expiry bounds below 120 seconds.
- **PASS - core structural coherence:** all LC-U03 component references resolve,
  transaction and lock boundaries remain consistent, authoritative PostgreSQL
  state and adapter isolation are preserved, and no circular dependency was
  found.
- **FAIL - prior blocker 2:** the shared-relay blast radius is narrowed to
  Charge but not isolated from other Charge outbox producers/rows.
- **FAIL - prior blocker 3:** fault suites are separated, but the healthy
  success/domain-failure distribution is not deterministic.
- **PARTIAL - prior blocker 4:** JWT claims, validation, expiry, header
  stripping, and transport are specified; the Identity issuance/exchange
  dependency is not.
- **Sensor note:** equivalent read-only checks were performed. The known-broken
  Windows sensor dispatcher was not run.
