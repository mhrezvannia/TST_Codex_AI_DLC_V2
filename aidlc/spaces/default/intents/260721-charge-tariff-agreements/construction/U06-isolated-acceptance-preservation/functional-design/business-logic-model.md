# Business Logic Model - U06 Isolated Acceptance and Preservation

## Scope and upstream contract

U06 is the non-deployable release-evidence unit defined by `unit-of-work.md` and
Bolt B06. It consumes QC-01-QC-03, FR-701-FR-706, NFR-001-NFR-010, components
C01-C15, and the runtime contract in `services.md`. It adds test/evidence
drivers only. It does not add a service, pricing fallback, domain state, shared
UI primitive, shell/navigation change, or manager-demo operation.

The authoritative evidence root is
`artifacts/w2-03-live/<run-id>/`. Every observation is written beneath that
root before its SHA-256 is added to `manifest.json`. Evidence from W0-01,
W0-02, W1-01, W2-01, and W2-02 is read-only input; U06 never edits or merges a
prior-wave artifact.

## Acceptance state machine

A run has `PLANNED`, `RUNNING`, `BLOCKED`, `FAILED`, or `PASSED` status. Only an
observed zero-exit gate with its required semantic assertions is `PASS`.
Unavailable Docker, health, identity, reference data, browser, or shared-UI
integration is `BLOCKED`. An observed assertion mismatch is `FAIL`. Later gates
are `SKIPPED` after either terminal condition. Detector exit zero alone is not
an audit pass; both audit skills also require the documented manual seam review.

Technical `PASSED` is derived, never supplied by a caller: both demo guards pass, all
required gates and matrix cells pass, no blocker remains, and the indexed
artifact hashes validate. Otherwise the final decision is `BLOCKED` or
`FAILED`. Technical `PASSED` only makes the intent eligible for the later
AI-DLC human release gate; it neither records nor satisfies that approval.
Functional Design makes no claim that runtime conditions have been observed.

## Ordered orchestration

### 1. Freeze provenance and protect the manager

1. Create a collision-free UTC run ID and record branch, commit, dirty summary,
   OS/CPU/RAM, Node/Java/Docker versions, and the exact Wave A environment file.
2. Hash the protected W1 waiver and the indexed prior-wave manifests before any
   acceptance mutation. Record their paths and statuses exactly; in particular,
   a blocked/waived W1 record remains blocked/waived even if a separate later
   W1 proof exists.
3. Run `npm run demo:guard` without overriding `DEMO_COMPOSE_PROJECT` or
   `DEMO_EDGE_URL`. Capture stdout, stderr, exit code, and a read-only manager
   inventory fingerprint (project label, container ID, image ID, start time,
   and published ports). This is the pre-guard.
4. Validate `node scripts/wave-a-compose.mjs config` and assert from its rendered
   output that the project is `linercore-wave-a`, nginx is on host 18088, no
   service publishes 8088, and no manager project label is present.

The runner aborts before starting Wave A if the pre-guard or isolation assertion
does not pass. It never invokes raw `docker compose`; all Compose lifecycle,
`exec`, log, restart, and teardown operations go through
`scripts/wave-a-compose.mjs`.

### 2. Prove additive migration and recovery

The migration fixture starts from baseline-shaped Charge V1 and Booking V1/V2
rows, including legacy agreements, terminal pricing rows, idempotency rows, and
old flattened Booking snapshots. Before upgrade the harness stores a logical
backup plus catalog/data checksums. It then starts the assembled services and
asserts the exact ordered Charge V1-V4 and Booking next-version Flyway histories.

The proof verifies:

- an empty Charge schema migrates from V1 through V4;
- an exact nonempty legacy Charge catalog is baselined at V1 and upgraded;
- a partial or drifted catalog fails closed and is never silently baselined;
- each legacy agreement has deterministic `av-` plus `md5(id:version)` history,
  `authority_model=LEGACY`, unchanged legacy values, and no invented rate links;
- approved versions and activity/snapshot history cannot be updated or deleted
  through application repositories;
- Booking legacy snapshot rows remain version 1/readable and receive no invented
  typed history; newly touched rows use the new codec/table contract;
- a service restart changes neither Flyway checksums nor immutable-row hashes;
- terminal price/manual receipts replay without duplicate snapshot or case.

Recovery evidence documents the backup identifier, restore command for a new
isolated database, and the forward-repair rule: applied migrations are never
edited or undone in place; a defect is repaired by a later migration, while a
pre-upgrade backup may be restored only into a newly provisioned isolated
database. No destructive reset is accepted as recovery evidence.

### 3. Start and seed the isolated application

The runner uses `node scripts/wave-a-compose.mjs up -d --build`, waits with
bounded per-service readiness, and seeds stable W0-02 identities through the
existing seed/reference APIs. It records OFR, BAF, THC, USD, customer, lane,
origin, destination, and equipment IDs. Charge and Booking databases remain
separate; evidence queries each owner independently and never joins them.

Every browser request uses `http://127.0.0.1:18088`. Direct service ports are
diagnostic only and cannot close UI or end-to-end acceptance.

### 4. Execute one causally linked commercial journey

Each scenario has a unique correlation ID and stable seed namespace. API
responses, service logs, owner-local DB rows, screenshots, and Booking view
assertions reference that identity.

| Scenario | Required observation |
| --- | --- |
| Agreement price | Create and approve exact OFR/BAF/THC versions and an agreement version; Booking Price returns exactly three ordered computed lines, their sum, agreement/version provenance, and one typed immutable Booking snapshot. |
| Tariff fallback | Price a customer with no applicable agreement but one unique complete tariff set; result has tariff basis/reference, the exact three source versions, no agreement version, and one Booking snapshot. |
| Successor Reprice | Approve successor rate/agreement inputs for a changed valid pricing date, amend the Booking, explicitly Reprice, retain the prior snapshot, and show the new current result without mutating the old amounts/version IDs. Reconfirm is observed separately and makes no Charge call. |
| No rate | Price outside the configured lane; Charge returns terminal 404 `NO_RATE`, creates/replays exactly one OPEN manual case, and Booking persists `MANUAL_PRICING_REQUIRED` with no current total or fabricated line. |
| Ambiguity and outage guards | Focused integration tests prove the four ambiguity reasons create/replay a Charge case, while timeout/503/circuit evidence is Booking-local and creates no Charge case. |
| Charge disabled | With Charge unavailable, Booking never returns or renders a new hardcoded/fallback price; the accepted outcome is the typed outage/manual state only. |

For every 200 result, the harness independently multiplies the seeded decimal
unit rates by quantity using HALF_UP scale two and compares all line values and
the total. This assertion detects a hardcoded value while leaving Charge as the
runtime calculation authority.

### 5. Browser, accessibility, and visual evidence

Playwright authenticates through the normal shell/session and exercises all
eight Charge route patterns plus the existing Booking pricing region. The
matrix is the Cartesian product of widths 375/768/1024/1440 and light/dark for
each representative page family. It retains screenshots, trace ZIPs, console
and network summaries, axe results, and assertion JSON.

Keyboard scripts cover create/edit/approve, dialog Tab loop/Escape/trigger
restoration, settled selector use, filters, Price/Reprice, history selection,
and manual evidence. Loading, empty, validation, conflict, denied, manual,
in-progress, and backend-error states have semantic and focus assertions. No
hidden primary action, clipping, critical/serious axe issue, direct backend
browser call, or browser-supplied actor is allowed.

DS-01 passes only if the Charge-local wrapper is observed. DS-02 and DS-03
remain explicit W2-02 dependencies until the integrated running stack proves
them; an unresolved cell blocks U06 rather than authorizing a `packages/ui`,
shell, navigation, typography, or palette change.

### 6. Performance and restart fault proof

After readiness, the performance driver uses a disposable warm-up namespace
that is never reused for measurement. It measures known-rate and no-rate
requests separately. Each set contains at least 100 post-warm-up samples at
recorded fixed concurrency. Every measured sample has a unique valid Booking
reference, pricing amendment sequence, and therefore unique exact provider key
`bookingRef:pricingAmendmentSeq`; it may not reuse a warm-up or measured key.
The harness asserts a distinct Charge terminal receipt and `replayed=false` for
every sample. Each no-rate sample also has exactly one case for its
request/reason dedupe identity. A deliberately separate replay test proves
idempotency but is excluded from latency samples.

Each sample retains scenario, hashed request identity, pricing request ID,
start/end monotonic nanoseconds, elapsed milliseconds, HTTP/status code,
correlation ID, receipt/case proof, and replay flag. A duplicate identity,
receipt, unexpected replay, or unexpected response fails the entire set and
remains in raw evidence; it is not removed from percentile calculation.

Nearest-rank p99 is calculated over each raw set and must be at most 800 ms.
Host specification, commit, stack/project, warm-up count, measured count,
concurrency, errors, min/median/p95/p99/max, and raw JSONL/CSV are indexed. The
report labels this a provisional isolated-local target, never a production SLO.

A bounded restart between terminal invocation and replay proves Charge receipt,
manual-case, and Booking snapshot durability and deduplication. The runner does
not reuse the performance run as restart proof.

### 7. Regression, quality, and audit closure

The runner executes backend/frontend unit and integration tests, contract
provider/consumer verification, migration tests, changed-code coverage at or
above 80%, lint/typecheck/build, nginx route regressions, and the existing
regression/acceptance validators for the closed preservation set: W0-01, W0-02,
W1-01, W2-01, and W2-02. Exactly one preservation record is required per ID.
An unavailable or topology-incompatible validator is `BLOCKED`, never omitted
or treated as a compatible-only skip. Prior evidence status is copied only as
a reference, never recalculated or rewritten. W2-02 acceptance is currently
pending and remains pending/blocked unless integrated assertions genuinely
close it. The W1 preservation result and original W1 waiver are separate records.

A closed security matrix proves allowed human mutations, denied/no-disclosure,
spoofed browser authority rejection, missing Booking-to-Charge service identity
or permission, missing required secret, and non-local bypass rejection. Every
cell is executable and blocking. For live scenarios, the runner captures safe
correlated logs and before/after metric deltas for pricing latency, terminal
outcome, agreement/tariff basis, manual fallback, and replay/conflict. A
redaction scan verifies that logs/labels contain no prohibited values. Missing
security, log, metric, or redaction evidence blocks technical acceptance.

It then runs both detector scripts and performs every manual conformance check
from `.claude/skills/aidlc-audit/SKILL.md` and
`.claude/skills/erp-fidelity-audit/SKILL.md`. Findings include severity,
`file:line`, failure scenario, and disposition. Detector leads are triaged;
exit zero plus an unreviewed lead is not green.

### 8. Teardown and final manager proof

Wave A logs and DB evidence are captured before teardown. Cleanup, if requested,
uses only the wrapper and targets only `linercore-wave-a`. The runner then runs
`npm run demo:guard` again with default manager settings and compares the
read-only manager inventory fingerprint. A changed container/image/start time,
missing service, changed published port, or guard failure blocks release even
when W2-03 scenarios passed.

Finally, the manifest rehashes every artifact, verifies all required IDs exactly
once, and derives the technical decision. User approval remains a separate later
AI-DLC release gate; it is outside the manifest predicate and the harness cannot
self-approve it.

## Failure and retry semantics

Infrastructure unavailability is recorded once with the failing command and
next action. It does not trigger manager mutations or alternative ports. A
transient readiness probe may retry within its bounded timeout; commercial
commands reuse their specified idempotency key/body. Assertion failures are not
silently rerun into green. A subsequent attempt gets a new run ID and links the
earlier failed/blocked manifest.

## Upstream trace

| Design section | Upstream obligations |
| --- | --- |
| provenance/manager/isolation | FR-702-FR-703, QC-02, ADR-008 |
| migration/restart/recovery | FR-701, NFR-002-NFR-005, QC-01, ADR-006 |
| live commercial scenarios | FR-704, FR-401-FR-507, QC-02 |
| browser matrix | FR-705, NFR-004/NFR-006/NFR-007, US-13-US-15 |
| performance/observability | NFR-001/NFR-009, QC-03 |
| closed preservation/security | FR-702, NFR-004/NFR-005, QC-01-QC-02 |
| quality/audits | FR-706, NFR-008/NFR-010, QC-03 |
