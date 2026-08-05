# Performance Design - U04 Pricing Provider and Manual Cases

## Design decision and boundary

U04 remains the sole pricing provider behind the existing
`/pricing-requests` Charge endpoint. It uses indexed PostgreSQL queries,
bounded in-process orchestration, and short receipt/case transactions. It adds
no commercial cache, async pricing path, replica, CQRS projection, new service,
or new pool. The local acceptance targets are not production SLOs.

The brownfield `ChargeAgreementApplicationService.requestPricing`,
`PricingRequestRepository`, and `ManualPricingCaseRepository` remain migration
seams. Their contracts gain exact response bytes, owner-token fencing, bounded
candidate queries, and canonical open-case reuse.

## End-to-end latency budgets

Each fresh scenario is sampled independently after 20 warm-ups, with at least
100 calls at 10 clients. Expected errors remain latency samples.

| Path | Budget allocation | Limit |
| --- | --- | --- |
| agreement success | ingress/hash/auth 125 ms; claim 75; candidates/integrity 250; calculation/render 100; terminal commit 150; margin 100 | p99 <=800 ms |
| tariff success | ingress/hash/auth 125 ms; claim 75; three tariff queries 250; calculation/render 100; terminal commit 150; margin 100 | p99 <=800 ms |
| no-rate, each subtype | ingress/hash/auth 125 ms; claim 75; selection 250; case plus terminal commit 175; response/margin 175 | p99 <=800 ms |
| ambiguity, each subtype | ingress/hash/auth 125 ms; claim 75; selection/precedence 250; case plus terminal commit 175; response/margin 175 | p99 <=800 ms |
| terminal replay | authorization/lookup 150 ms; exact snapshot response 150 ms | separate suite; no resolver work |
| manual list/detail | ingress/auth 125 ms; indexed query 350; mapping/response/margin 275 | p95 <=750 ms |

Replay runs 25 calls for each approved 200, 404, and 422 fixture and reproduces
status, bytes, content type, correlation ID, priced/opened time, and case ID.
Candidate, calculation, or case-write probes make a replay fail.

## Execution and transaction shape

1. Validate media, fields, request bounds, and `bookingRef:amendmentSeq`.
2. Authorize `charge-agreement:price`, canonicalize once, and SHA-256 hash.
3. In a short transaction, insert a claim or take over an expired claim by
   replacing its random owner-token fence. Do not hold it during candidate
   resolution.
4. Open one bounded read-only PostgreSQL `REPEATABLE READ` transaction. Its
   first candidate statement establishes the commercial linearization snapshot.
   Resolve agreements first; only zero agreements reaches the ordered BASE,
   SURCHARGE, and LOCAL tariff queries. Close the read transaction after the
   final bounded candidate/integrity read.
5. Calculate the fixed three lines with `BigDecimal`, scale 2, `HALF_UP`, or
   derive the category-specific manual reason.
6. Serialize once. In one current-owner-token-fenced transaction, create-or-get
   the canonical OPEN case when needed and store exact status, bytes, request
   hash, correlation/time, and optional case. Replay derives the fixed endpoint
   content type from the stored terminal status.

The 10-second lease is a failure-recovery bound, not a latency allowance. The
read snapshot holds no writer locks and never spans rendering or terminal
completion. A winning result is authoritative at that snapshot; a takeover
after failure performs a fresh complete snapshot rather than mixing reads.

## Query and index plan

| Query | Required access path |
| --- | --- |
| receipt claim/replay | unique `idempotency_key` with terminal columns |
| expired takeover | key, IN_PROGRESS status, database-time lease, conditional fresh owner-token replacement |
| agreement candidates | U03 equality key, approval validity, bounded version/link joins |
| tariff candidates | U01 category equality prefix, lifecycle, validity, deterministic order |
| canonical open case | unique versioned OPEN identity; legacy winner preserved |
| manual list | status, `opened_at DESC NULLS LAST, case_id ASC`, bounded filters |
| manual detail | unique case ID; no candidate joins |

Repositories return only enough candidates to prove zero, one, or ambiguity.
Pages are 1-100 rows and detail uses fixed set queries.

## Pooling and contention

- Reuse the U01 Hikari maximum 10 and 2-second acquisition timeout.
- Claim and completion each hold one connection briefly; candidate reads share
  one bounded read-only `REPEATABLE READ` transaction outside writer work.
- Conditional SQL arbitrates insert, live owner, takeover, hash conflict,
  replaced/stale owner token, and case creation. JVM mutexes are forbidden.
- Two Spring contexts run 20 rounds and must show no second resolver, stale
  completion, duplicate canonical case, or inconsistent terminal body.

## Instrumentation and resource gates

Low-cardinality timers cover authorization, claim, agreement selection, each
tariff category, calculation, terminal commit, replay, and manual reads.
Counters cover live-owner/hash conflict, takeover, stale-owner rejection, and
case reuse. Booking references, hashes, owner tokens, correlations, and case IDs
never become metric dimensions.

The three-cycle gate compares post-GC heap and RSS. Retained request snapshots,
response bytes, JDBC rows, or case pages must not grow monotonically.

## Verification and traceability

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. Verification runs every outcome separately, exact
replays, the 10,000-case list/detail fixture, 20 contention rounds, the ordered
three-line itemization oracle, query plans, and the heap/RSS gate.

## Review

**Verdict: NOT-READY**

### Critical findings

None.

### High-severity findings

1. **Candidate resolution has no consistent database snapshot or stated
   linearization point.** The design deliberately runs agreement reload and up
   to three tariff candidate queries outside the writer transactions, but does
   not place the complete selection in one bounded read-only transaction or
   define which read is authoritative. Concurrent approval, suspension, expiry,
   or successor activity can therefore make BASE, SURCHARGE, LOCAL, and
   Agreement/link evidence come from different committed database states. The
   fenced receipt protects only terminal ownership; it does not make commercial
   selection coherent. Define the isolation level, transaction boundary, and
   final revalidation/linearization rule without extending the writer lock
   across serialization.
2. **The outputs contradict the approved replay persistence contract and U01
   migration ownership.** `business-logic-model.md` and
   `reliability-requirements.md` require exact stored status/body and derive
   content type deterministically from terminal status. In contrast,
   `performance-design.md`, `security-design.md`,
   `scalability-design.md`, and `reliability-design.md` require a stored
   content-type field. U04 does not own a migration, so a developer cannot know
   whether to change the U01 V4 schema, ignore the design outputs, or violate
   the reviewed functional contract. Select the derived-content-type contract
   or reference an existing U01 column explicitly and make every artifact
   agree.

### Medium-severity findings

1. **Manual pagination ordering is internally inconsistent.**
   `business-logic-model.md` fixes
   `opened_at DESC NULLS LAST, case_id ASC`, while the NFR design's query/index
   plans specify `case_id DESC`. This changes page boundaries for equal or NULL
   timestamps and can make performance evidence pass against behavior that
   violates the functional contract. Use one exact order in query, index, API,
   and tests.
2. **Manual evidence disclosure is ambiguous.** The functional contract
   explicitly returns the request hash, but `security-design.md` says manual
   views expose no receipt hash without distinguishing the canonical request
   hash from another receipt hash. Name the exact field and either authorize
   its disclosure or remove it consistently.

### Low-severity findings

None.

### Validation results

- **PASS - required sections:** all five outputs contain seven H2 headings
  before this review, exceeding the minimum of two.
- **PASS - upstream coverage:** every output references
  `performance-requirements.md`, `security-requirements.md`,
  `scalability-requirements.md`, `reliability-requirements.md`,
  `tech-stack-decisions.md`, and `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present; the logical flow fence is plain text.
- **PASS - quantitative checks:** every fresh pricing budget sums to 800 ms,
  manual reads sum to 750 ms, scenario distributions and nearest-rank
  percentiles are fixed upstream, and restart evidence has an explicit
  120-second acceptance bound.
- **PASS - component references and acyclicity:** all named components resolve
  within the inventory/flow, transaction ownership is otherwise consistent,
  and no circular dependency was found.
- **FAIL - cross-artifact coherence and implementability:** selection
  consistency, replay schema ownership, stable pagination order, and hash
  disclosure require architectural choices a developer cannot safely infer.
- **Sensor note:** equivalent read-only checks were performed; the known-broken
  Windows sensor dispatcher was not run.

## Review response

The iteration-one findings are resolved across the design set:

1. All agreement and tariff candidate reads use one bounded read-only
   `REPEATABLE READ` transaction whose first statement fixes the commercial
   linearization snapshot; writer work and serialization remain outside it.
2. PostgreSQL stores exact terminal status and body bytes. Content type is
   deterministically derived from the stored status and fixed endpoint contract,
   matching U01 migration ownership.
3. Manual pagination is uniformly `opened_at DESC NULLS LAST, case_id ASC`.
4. Authorized manual detail explicitly exposes the canonical SHA-256
   `requestHash`; it remains prohibited from logs, metrics, list rows, and
   unauthorized responses.

## Review - Iteration 2

**Verdict: READY**

### Critical findings

None.

### High-severity findings

None.

### Medium-severity findings

None.

### Low-severity findings

None.

### Validation results

- **PASS - prior blocker 1:** agreement, link, and tariff reads now share one
  bounded read-only PostgreSQL `REPEATABLE READ` transaction. The first
  candidate statement is the explicit commercial linearization point, the
  snapshot holds no writer lock, and a takeover starts a fresh complete
  snapshot.
- **PASS - prior blocker 2:** every output now stores terminal status and exact
  body bytes while deriving content type from status and the fixed endpoint
  contract. No U04 content-type column or migration is required, preserving U01
  V4 ownership.
- **PASS - prior blocker 3:** query, index, API, and verification prose now use
  `opened_at DESC NULLS LAST, case_id ASC` consistently.
- **PASS - prior blocker 4:** authorized detail explicitly exposes canonical
  SHA-256 `requestHash`; list rows, telemetry, denials, and unrelated errors do
  not expose it.
- **PASS - required sections:** before this section, H2 counts were performance
  9 and seven each for security, scalability, reliability, and logical
  components.
- **PASS - upstream coverage:** all five outputs reference
  `performance-requirements.md`, `security-requirements.md`,
  `scalability-requirements.md`, `reliability-requirements.md`,
  `tech-stack-decisions.md`, and `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present; the sole fenced block is a plain-text flow.
- **PASS - coherence and implementability:** receipt fencing, candidate
  snapshot, terminal serialization, case/receipt atomicity, replay,
  authorization, disclosure, pagination, latency budgets, and 120-second
  restart evidence agree across all five outputs. Component references resolve
  and no circular dependency was found.
- **Sensor note:** equivalent read-only checks were performed; the known-broken
  Windows sensor dispatcher was not run.
