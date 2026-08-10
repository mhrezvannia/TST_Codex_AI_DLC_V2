# Deployment Architecture — U04 Pricing Provider and Manual Cases

## Input contract and decision

This design consumes the U04 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, and
`logical-components.md`, plus inception `components.md`, inception
`services.md`, and U04 `business-logic-model.md`.

U04 adds no deployable. Pricing, receipts, manual cases, and their REST
adapters remain in the existing Spring Boot `charge-agreement-service`;
the evidence UI remains in `apps-charge-agreements`; PostgreSQL 15 database
`linercore_pricing` remains the sole durable authority. The only approved
runtime is Compose project `linercore-wave-a`.

## Runtime topology

| Runtime | U04 change | Boundary |
| --- | --- | --- |
| nginx on isolated host port 18088 | consume existing path-preserving `/charge-agreements/` mount | never target manager port 8088 |
| `apps-charge-agreements:3000` | add authenticated manual list/detail page and BFF routes | no direct browser-to-service access |
| `charge-agreement-service:8084` | add pricing coordinator, exact replay, and manual evidence adapters | one existing image/process |
| PostgreSQL 15 | consume U01-owned V4 receipt/manual structures | one Charge database and role |
| Identity/Reference services | reuse bounded existing adapters | no copied authority or cross-DB join |
| Booking service | existing synchronous pricing caller | U05 owns consumer orchestration |

No AWS account, load balancer, autoscaler, production DNS/TLS, staging
environment, or additional Compose stack is implied.

## Storage and transaction placement

The baseline plus immutable U01-owned V4 supply receipt terminal status, exact
body bytes, request hash, correlation/time, case reference, random owner token,
and lease. The current random owner token is the fence: takeover atomically
replaces it, and completion matches it; U04 adds no normalized-request or
numeric-fence column. Content type is derived from
terminal status and the fixed endpoint contract; U04 adds no content-type
column or migration.

Claim and takeover use short writer transactions. All Agreement and tariff
candidate reads share one bounded read-only `REPEATABLE READ` transaction; its
first candidate statement is the commercial linearization point. Rendering
occurs after that snapshot closes. One fenced terminal transaction stores the
exact 200 bytes or atomically create-or-gets the canonical OPEN case and stores
the exact 404/422 bytes. One request holds at most one connection at a time.

## Resource and network controls

U04 retains the U01 Hikari maximum 10 and 2-second acquisition timeout. Exact
inherited limits are Charge 384 MiB with JVM max RAM 55%,
`apps-charge-agreements` 256 MiB with Node old-space 160 MiB, and shared
PostgreSQL 256 MiB.
Candidate queries return only enough evidence for zero, one, or ambiguity;
manual pages are capped at 100. The Charge container sizing remains the
U01-approved Wave A sizing and must pass post-GC heap/RSS and sibling-service
non-regression gates; U04 does not independently raise it.

Service discovery uses Compose DNS and current internal ports. The manual BFF
uses the signed session and exact `charge-manual-cases:read`; Booking pricing
uses the trusted service boundary and exact `charge-agreement:price`. Secrets
are injected through the existing guarded Wave A environment and never placed
in images, source, logs, or evidence.

## Readiness, rollout, and recovery

Readiness requires PostgreSQL, exact Flyway catalog/checksums, usable
receipt/case repositories, and nonlocal authorization posture. Broker health is
not a U04 pricing dependency. Promotion uses the single candidate Charge image
containing U01–U04 behavior and runs `npm run demo:guard` before and after.

The rollout is additive behind the existing pricing endpoint and manual route.
Previous-image use requires the U01 exact-current-schema validate-only/read-only
cell, identical before/after catalog, Flyway, and canonical data hashes, and a
read-only compatibility query returning zero:

```sql
SELECT
  (SELECT count(*) FROM pricing_requests
   WHERE terminal_schema_version = 'pricing.v1'
      OR terminal_http_status IS NOT NULL
      OR terminal_pricing_request_id IS NOT NULL
      OR manual_case_id IS NOT NULL)
  +
  (SELECT count(*) FROM manual_pricing_cases
   WHERE booking_ref IS NOT NULL
      OR amendment_seq IS NOT NULL
      OR request_hash IS NOT NULL)
  AS incompatible_u04_rows;
```

The query covers every W2 priced/manual terminal and every new U04 case while
allowing unchanged legacy/backfilled winners whose new evidence fields remain
NULL. Byte-preserving legacy receipt/case fixtures must also pass. Any nonzero
count makes rollback ineligible. Even after a zero result, the previous image
starts in an enforced drained/read-only mode: pricing/manual writes are blocked
at routing and its database role has no DML or DDL privilege. It may serve only
compatibility-proven legacy reads until the forward-repair image is active.
After U04 state is durable, normal recovery is forward repair; migrations are
never edited or run down. U06 owns isolated
restore execution, while U04 proves byte-identical replay and manual detail
within 120 seconds after restart.

## Acceptance evidence

The deployment gate proves p99 pricing at or below 800 ms using at least 100
post-warm-up samples at 10 clients; p95 manual list/detail at or below 750 ms;
100,000 receipts; 10,000 OPEN cases; 20 two-context fencing rounds; one bounded
candidate snapshot; no resolver on replay; exact status/body/content type for
200/404/422; and no manager/W1 regression.

Every artifact records image digest, Compose project, PostgreSQL image,
migration hashes, configuration fingerprint, host/concurrency/sample count,
raw timings, test IDs, and redacted correlation evidence.

## Review

**Iteration 1 verdict: NOT-READY.**

### Blocking findings

1. **P0 — U04's receipt contract does not resolve to the U01-owned V4
   schema.** The infrastructure/NFR artifacts require a persisted normalized
   request and monotonic fence, and completion predicates on key, owner, fence,
   and IN_PROGRESS. The exact U01 V4 contract adds only terminal HTTP status,
   terminal schema version, terminal pricing-request ID, and manual-case ID;
   the baseline supplies owner token/lease/hash but no normalized-request or
   fence column. U04 forbids migration authoring, so a developer must either
   invent an unauthorized schema change or omit required fencing/evidence.
   Reconcile the contract with U01: either use the random owner token itself as
   the takeover/completion fence and remove every monotonic-fence/normalized-
   request persistence claim, or assign an exact forward migration to the
   schema owner with columns, constraints, indexes, adoption, and rollback
   behavior.

2. **P1 — the required manual-page order has no matching owned index
   contract.** U04 requires
   `opened_at DESC NULLS LAST, case_id ASC`, while U01 V4 defines
   `idx_manual_cases_status_opened(status, opened_at, case_id)` with default
   ordering. A backward scan reverses both keys and NULL placement, so it
   cannot supply the mixed exact order without a sort. The artifacts neither
   accept/bound that sort on the 10,000-row fixture nor authorize the correctly
   ordered index. Specify and gate the accepted plan, or have U01 own the exact
   ordered index through an approved migration.

3. **P1 — prior-image rollback eligibility is not an executable closed
   predicate.** “No W2 terminal/manual state that requires U04 semantics” does
   not identify exact tables, status/schema/dedupe conditions, legacy-winner
   treatment, or terminal/quarantined states. A false-negative check can start
   an image that cannot safely interpret durable W2 receipts/cases. Define the
   exact read-only SQL compatibility query and require zero incompatible rows,
   catalog/checksum equality, and byte-preserving legacy fixtures before
   rollback; otherwise remain forward-repair-only.

### Nonblocking findings

1. Use PostgreSQL time for lease creation/expiry/takeover, or prove bounded
   application-clock skew. Passing caller `now` into two service instances can
   otherwise cause premature takeover and duplicate resolver work even though
   terminal fencing prevents a second commit.

2. Record the inherited numeric Charge container/JVM limits in U04 evidence
   rather than referring only to “U01-approved sizing,” so the 100,000-receipt/
   10,000-case resource result is reproducible.

### Validation results

- **PASS — required sections:** each primary artifact has at least six H2
  sections.
- **PASS — upstream coverage:** every primary artifact names all eight consumed
  inputs: `performance-design.md`, `security-design.md`,
  `scalability-design.md`, `reliability-design.md`,
  `logical-components.md`, `components.md`, `services.md`, and
  `business-logic-model.md`.
- **PASS — code-shape applicability:** no TypeScript, TSX, or JavaScript
  implementation snippets are present.
- **PASS — coherent areas:** existing-only topology, one-connection-at-a-time
  transaction placement, REPEATABLE READ linearization, agreement-first
  selection, exact terminal replay, canonical case convergence,
  authorization-before-query, current-UTC security gates, manager/W1
  preservation, and forward-repair posture agree across the declared inputs.
- **FAIL — implementability/rollback:** the unresolved V4 fields/index and
  rollback predicate require schema-owner and operational decisions beyond
  these artifacts.

### Iteration 2

**Verdict: NOT-READY.**

Iteration-1 blocker 2 is resolved: the design explicitly accepts PostgreSQL's
bounded sort after the U01 status-leading index and gates 10,000 candidates,
4 MiB sort memory, no disk spill, a 100-row page, and p95 <=750 ms.
Iteration-1 blocker 3 is resolved: rollback uses the exact read-only
`incompatible_u04_rows` predicate, zero-result rule, byte-preserving legacy
fixtures, query/role fingerprints, and unchanged catalog/Flyway/data hashes.
The prior clock and reproducibility observations are resolved by PostgreSQL-time
lease creation/takeover and the exact inherited 384 MiB/55%, 256 MiB/160 MiB,
and 256 MiB limits.

#### Blocking findings

1. **P0 — the NFR set still instructs a numeric/monotonic fence that the
   corrected physical contract explicitly rejects.** `performance-design.md`
   still says the repository gains “monotonic fencing,” takeover advances the
   fence, and the takeover access path performs a “conditional fence
   increment.” `scalability-design.md` still predicates completion on
   `key/owner/fence/status`. The corrected infrastructure, security, and
   reliability contracts instead use the existing random owner token as the
   sole fence: takeover replaces it and completion matches
   key/current-owner-token/IN_PROGRESS, with no numeric-fence column. A
   developer cannot implement both contracts without inventing the prohibited
   schema field. Replace the remaining NFR language with fresh-owner-token
   replacement and exact owner-token completion predicates; retain “fencing”
   only as the name of that token-based behavior.

#### Nonblocking findings

1. The previous-image compatibility cell is explicitly read-only. If a prior
   image can ever receive pricing/manual writes after rollback, add write
   fixtures proving it supplies every V4-required column; otherwise state that
   rollback starts the prior image in enforced read-only/drained mode until
   forward repair.

#### Validation results

- **PASS — sort closure:** exact order, accepted plan, candidate count, memory,
  spill, page-size, and latency gates agree across infrastructure artifacts.
- **PASS — rollback closure:** the SQL predicate covers W2 terminal fields and
  new manual evidence while allowing unchanged NULL-evidence legacy winners;
  zero rows plus immutable hashes/fixtures is mandatory.
- **PASS — clock/resources:** claim and takeover use PostgreSQL time, and
  inherited numeric limits are explicit and match U01.
- **PASS — structural checks:** the five primary artifacts retain at least two
  H2 sections, reference all eight consumed inputs, and contain no
  TypeScript/JavaScript implementation snippets.
- **FAIL — cross-artifact implementability:** the remaining numeric-fence NFR
  instructions contradict the owner-token-only schema and prevent READY.

## Post-review lead corrections

The iteration-2 NOT-READY verdict remains the final formal reviewer verdict.
Within the two-iteration cap, the lead removed the remaining numeric-fence
contradictions from `performance-design.md` and `scalability-design.md`:
takeover now replaces the random owner token and completion matches
key/current-owner-token/IN_PROGRESS, with no new fence column.

The nonblocking rollback observation is also closed: a zero compatibility count
can start a prior image only in enforced drained/read-only mode, with pricing
and manual writes blocked and a database role lacking DML/DDL. No third review
is claimed; these corrections remain visible to the stage-wide gate.
