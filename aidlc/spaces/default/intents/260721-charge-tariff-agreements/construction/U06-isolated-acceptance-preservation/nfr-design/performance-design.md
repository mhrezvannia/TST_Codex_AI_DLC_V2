# Performance Design - U06 Isolated Acceptance and Preservation

## Boundary and timing authority

U06 is a checked-in, non-deployable evidence driver. It measures only
`linercore-wave-a` through edge 18088 and never substitutes mocks, replay,
manager 8088, or direct service ports. Wrapper `up` has a ten-minute bound;
each restart/readiness plus authenticated probe has a 120-second bound. Polling
uses a one-second initial interval, bounded exponential increase to five
seconds, a monotonic deadline, and records every terminal probe.

## Fresh provider performance

After disposable warm-ups, the driver runs exactly 10 clients and exactly 100
known-rate plus exactly 100 no-rate calls: 50 Agreement, 50 Tariff, and 25 each BASE,
SURCHARGE, LOCAL, and multiple-category missing. Every sample has a unique
Booking/sequence/key/hash/request/receipt; no-rate also has one canonical OPEN
case. Any reuse, replay, duplicate, missing identity, or wrong outcome remains
in evidence and fails the complete set.

Nearest-rank p99 is computed directly from raw monotonic elapsed values for
each subtype and aggregate; every target is <=800 ms. A separate 100-call exact
terminal replay suite never enters the fresh distributions.

## Driver and evidence shape

Workers stream one JSONL row per completed sample to a single ordered writer;
CSV is derived from those rows, not independently measured. Each row carries
scenario/subtype, hashed identity, request/correlation, start/end/elapsed,
status/code/reason/basis, receipt/case proof, replay flag, and itemization result.
The summary recomputes counts, error count, min/median/p95/p99/max from JSONL.

Connections, worker count, response/body size, pending futures, and per-worker
buffers are fixed. A worker failure is recorded once and never silently rerun
into green.

## Itemization oracle

Every 200 response is compared independently to seeded decimals: ordered
BASE/OFR, SURCHARGE/BAF, LOCAL/THC; USD/PER_CONTAINER; quantity; unit rate;
scale-two HALF_UP amount; total; basis/reference; exact RateVersion IDs; and
AgreementVersion when applicable. Charge API, Booking API, owner-local DB, and
visible UI hashes must agree field-for-field.

## Resource and query gates

Three identical post-warm-up cycles use 60-second quiescence and the minimum
heap/median RSS over the last 30 seconds. Cycle three must be <=
`max(120% cycle one, cycle one + 32 MiB)` and neither metric may rise >5% in
both transitions. OOM/restart, pool timeout, deadlock, N+1, full-history load,
or retained request growth fails. DB evidence uses bounded owner-local queries,
never cross-database joins or payload exports.

## Verification and traceability

Evidence records commit, host/runtime versions, project/edge, seed, warm-up,
concurrency, raw rows, percentile algorithm, query/pool/lock/GC signals, and
terminal assertions. Available-but-slow is FAILED; unavailable capability is
BLOCKED.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

## Review

**Verdict: NOT-READY**

### Critical findings

None.

### High-severity findings

1. **The ledger/manifest protocol is not crash-consistent.** Artifact files use
   temp-write/close/rename, but ledger records are merely appended and manifest
   publication has no durable temp/flush/rename protocol. A crash can leave a
   torn ledger record, a renamed final artifact with no ledger entry, or a
   partial manifest. Recovery only discusses unindexed temporary files, not
   unindexed renamed files, and does not define durable record framing,
   checksum, truncation, directory sync, or exactly-once reconciliation. Define
   the complete commit protocol and deterministic recovery for every
   before/after rename, hash, ledger, and manifest crash point on Windows.
2. **Retained Playwright trace archives can violate the credential prohibition.**
   Scanning extracted trace/network metadata does not prove that the indexed
   trace ZIP itself excludes cookies, authorization headers, service tokens,
   request bodies, or storage/session data. The design must either prevent
   capture of prohibited values, inspect and sanitize every retained archive
   entry before indexing while discarding the raw archive, or fail and retain
   no unsafe trace. Access-controlled storage alone does not satisfy the stated
   no-token-in-traces rule.
3. **The supposedly closed acceptance sets are not concretely closed.**
   Preservation and security IDs are enumerated, but the required commercial,
   browser page-family/state, telemetry, quality, and audit/manual-entry IDs are
   described only as "every" or "representative." A developer cannot create the
   manifest schema or prove exact-once coverage without choosing the members.
   Provide the authoritative ID registry and exact cardinalities, including
   SKIPPED closure and cross-reference rules.

### Medium-severity findings

1. **Path containment remains vulnerable to check/use and Windows path aliases.**
   Rejecting absolute paths, `..`, symlinks, and alternate streams does not
   cover junctions/reparse points, hard links, device/UNC aliases, case
   normalization, or replacement of a validated parent before open. Specify
   handle-based no-follow containment, same-volume checks, and validation of
   the opened target rather than only its path string.
2. **Restore-target safety is asserted but not executable.** The design requires
   a newly provisioned isolated database but does not define target-name
   generation, source-not-target and target-must-not-exist guards, allowed
   server/project checks, failure cleanup, or the wrapper command that proves
   restore cannot overwrite an authoritative source. These checks must precede
   any restore mutation.
3. **Performance population cardinality is ambiguous.** The design says "at
   least 100" known-rate and no-rate calls while fixing distributions that total
   exactly 100. Define exactly 100, or define proportional subtype counts and
   percentile populations for larger runs.

### Low-severity findings

None.

### Validation results

- **PASS - required sections:** H2 counts are performance 6, security 6,
  scalability 7, reliability 7, and logical components 7 before this review.
- **PASS - upstream coverage:** every output references
  `performance-requirements.md`, `security-requirements.md`,
  `scalability-requirements.md`, `reliability-requirements.md`,
  `tech-stack-decisions.md`, and `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present; the only fenced block is a plain-text control flow.
- **PASS - timing and uniqueness intent:** readiness/restart bounds, polling,
  concurrency, warm-up separation, unique identities, replay exclusion,
  nearest-rank calculation, resource gates, and failure retention are
  quantitatively coherent except for the population ambiguity above.
- **PASS - manager and UI boundaries:** manager inventory is read-only,
  mutations use only the exact Wave A wrapper/project/edge, and browser proof
  stays in the existing signed LinerCore shell without adding UI authority or
  shared primitives.
- **PASS - commercial and restart semantics:** owner-local DB evidence,
  agreement/tariff/Reprice/no-rate/outage ownership, RPO 0 assertions, immutable
  history, lost-response dedupe, and forward-only migration rules agree across
  the outputs.
- **FAIL - evidence implementability/security:** crash recovery, trace
  sanitization, exact matrix membership, path containment, and restore-target
  guards require architectural decisions not supplied by the design.
- **Sensor note:** equivalent read-only checks were performed; the known-broken
  Windows sensor dispatcher was not run.

## Review response

Iteration-one findings are resolved across the design set:

1. The ledger uses length/hash-framed canonical records with sync and torn-tail
   truncation; artifacts, ledger, and the derived manifest have an explicit
   crash-point reconciliation protocol on Windows.
2. Raw Playwright ZIPs are temporary and never indexed. Every archive entry is
   parsed, sanitized, recompressed, expanded again, and scanned; any unsafe or
   unparseable entry makes the cell BLOCKED and leaves no retained trace.
3. `scalability-design.md` defines authoritative commercial, browser,
   observability, quality, audit, preservation, and security registries with
   exact cardinalities and cross-reference rules.
4. Artifact destinations are generated only from registry IDs; the writer uses
   exclusive same-volume files, rejects reparse/hardlink aliases, and rechecks
   opened parent/file identities before atomic rename.
5. Restore targets use a run-scoped generated name, source/target OID and
   existence guards, owner markers, wrapper-only creation/cleanup, and cannot
   address the source database.
6. Performance populations are exactly 100 known-rate and exactly 100 no-rate,
   fixing all subtype and percentile cardinalities.

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

- **PASS - prior blocker 1:** artifacts use exclusive same-directory temporary
  writes and atomic rename; length/hash-framed synced ledger records support
  torn-tail truncation and orphan reconciliation; versioned, hashed manifests
  are regenerated from the ledger and republished idempotently after Windows
  rename/publication crashes.
- **PASS - prior blocker 2:** raw Playwright ZIPs remain outside the evidence
  root and are never indexed. Every entry is sanitized, deterministically
  recompressed, expanded, and rescanned; unknown, corrupt, encrypted, or unsafe
  content blocks the cell and retains no trace archive.
- **PASS - prior blocker 3:** `acceptance-registry.json` is the single
  authoritative registry with exact preservation, security, commercial,
  browser structural/state, design-dependency, observability, quality, and
  audit cardinalities. Results require a known unique ID, artifact hashes, and
  applicable scenario/correlation links; illegal SKIPPED and dangling links
  fail finalization.
- **PASS - prior blocker 4:** callers cannot supply paths. Registry-generated
  destinations, exclusive files, canonical parent and same-volume checks,
  reparse/junction/symlink/alternate-stream rejection, `nlink=1`, pre-rename
  identity revalidation, and final reopen/hash validation contain Windows path
  aliases and replacement races.
- **PASS - prior blocker 5:** restore uses a generated run-scoped identifier,
  Wave A host/project allow-list, source/target name and OID inequality,
  target-must-not-exist, run-owner marker, explicit-target commands, and guarded
  wrapper-only cleanup that cannot address the source.
- **PASS - prior blocker 6:** the fresh populations are exactly 100 known-rate
  and exactly 100 no-rate samples, with fixed 50/50 and 25/25/25/25 subtype
  cardinalities and a separate 100-call replay population.
- **PASS - required sections:** before this section, H2 counts were performance
  8, security 6, and seven each for scalability, reliability, and logical
  components.
- **PASS - upstream coverage:** all five outputs reference
  `performance-requirements.md`, `security-requirements.md`,
  `scalability-requirements.md`, `reliability-requirements.md`,
  `tech-stack-decisions.md`, and `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present; the sole fenced block is a plain-text control flow.
- **PASS - overall coherence:** manager isolation, bounded orchestration,
  evidence crash recovery, redaction, closed matrices, unique performance
  identities, owner-local DB proof, guarded restore, technical/human gate
  separation, and existing LinerCore browser boundaries agree across all five
  outputs. Component references resolve and no circular dependency was found.
- **Sensor note:** equivalent read-only checks were performed; the known-broken
  Windows sensor dispatcher was not run.
