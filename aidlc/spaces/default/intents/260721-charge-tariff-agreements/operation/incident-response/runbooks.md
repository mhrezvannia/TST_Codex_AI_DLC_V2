# W2-03 Incident Runbook Library

## Status, authority, and upstream basis

Status: **RUNBOOKS DEFINED; NOT EXERCISED; MUTATING STEPS REQUIRE APPROVAL**.

These runbooks consume `dashboards`, `alarms`, every Unit's
`reliability-design`, `security-design`, and `deployment-architecture`.
They target only the guarded `linercore-wave-a` acceptance environment. They
are not SSM Automation documents and do not authorize AWS, production, manager
demo, credential, database, volume, or cleanup mutations.

Safe automation is limited to evidence capture, validation, read-only
inventory, and stopping the active acceptance driver. Any restart, restore,
forward repair, rotation, or cleanup requires the approvals in
`escalation-matrix`.

## RB-00 - Common safety and triage

Triggers: every P1/P2 event.

### Automated safe steps

1. Stop the acceptance driver from issuing new work.
2. Generate a UTC incident ID and record alarm/gate ID, run ID, candidate
   identity, safe correlation, and first observation.
3. Run `npm run demo:guard`; capture the result without changing manager state.
4. Run `npm run wave-a:config` and `npm run wave-a:ps`; verify exact project,
   network, loopback edge port 18088, and absence of manager port 8088.
5. Snapshot bounded application logs, metrics, safe traces, service health,
   process/container state, Flyway/catalog, pool/lock/resource, and evidence
   ledger metadata.
6. Hash retained artifacts and run redaction checks.

### Stop conditions

- manager fingerprint or resource identity differs;
- config renders an unexpected project/network/port/volume;
- evidence writer or hash verification fails;
- a snapshot contains a secret, token, credential, prohibited payload, or
  unsafe trace;
- a command would target an unresolved or non-wrapper-owned resource.

### Handoff

Incident commander records severity and assigns the narrow runbook below.
No mutating command runs during RB-00.

## RB-01 - Manager or sibling preservation drift

Alarm: `W203-P1-MANAGER-DRIFT`.

### Contain

1. Abort all Wave A mutations immediately.
2. Do not restart, rebuild, seed, stop, clean, attach, or inspect secrets from
   the manager project.
3. Preserve before/after manager and sibling fingerprints, wrapper config,
   process/container inventory, and the last accepted command.

### Diagnose

- Compare explicit Compose project, network, host ports, image tags, labels,
  volumes, and owner markers.
- Determine whether an environment variable or wrapper target drifted.
- Treat manager resources as externally owned even if a name looks similar.

### Recover

W2-03 does not repair manager resources. Escalate to the manager-demo owner.
Only after that owner restores and verifies manager state may W2-03 correct its
own version-controlled configuration and begin a fresh preflight.

### Exit

Manager and sibling probes equal an independently verified safe baseline; all
Wave A resources are still uniquely owned. Otherwise remain P1.

## RB-02 - Authorization bypass or secret disclosure

Alarms: `W203-P1-AUTH-BYPASS`, `W203-P1-TELEMETRY-DISCLOSURE`.

### Contain

1. Stop acceptance and prevent protected forwarding.
2. Preserve only redacted metadata identifying the artifact/rule; never copy
   the matched secret or prohibited value into the incident record.
3. Quarantine unsafe evidence and discard unsafe trace archives.
4. Mark every required cell that depended on discarded evidence `BLOCKED`.

### Diagnose

- Verify fail-closed non-local configuration, exact auth capability, subject
  assertion key ID/expiry/method/path/correlation, nonce behavior, fixed
  backend origin, and local-only bypass posture.
- Search for browser/session/service credentials in bundle, image, config,
  environment diagnostics, logs, traces, screenshots, and reports without
  printing values.
- Distinguish authorization denial from Identity unavailable and from malformed
  security configuration.

### Recover

Credential rotation requires security responder and credential-owner approval.
Update only the owning secret injection boundary; never place new values in
source, commands retained as evidence, images, or artifacts. Restart affected
Wave A services only through the approved wrapper and re-run authorization,
redaction, and preservation proof.

### Exit

Protected routes fail closed, ALLOW/DENY/unavailable semantics pass, exposed
material is invalidated where applicable, and all retained evidence is clean.

## RB-03 - Durable pricing or Booking integrity failure

Alarm: `W203-P1-INTEGRITY`.

### Contain

1. Stop new Charge and Booking mutations.
2. Preserve Charge/Booking catalog, Flyway state, canonical counts/hashes,
   receipt/manual-case/activity/snapshot/history rows, transaction outcomes,
   and safe correlation links.
3. Do not reset tables, edit applied migrations, replay blindly, or convert an
   unknown/no-rate result into zero/partial pricing.

### Diagnose

- Verify Agreement-first then Tariff precedence and explicit no-rate/manual
  terminal meaning.
- Check claim/owner/fence, idempotency key/hash, terminal receipt, manual-case,
  Booking receipt, snapshot, history, replay, and Reprice invariants.
- Verify transaction atomicity: pre-state or complete post-state, never
  partial.
- Check concurrent winner/loser evidence, stale fences, duplicates, and
  canonical body/hash equality.

### Recover

Prefer candidate stop plus forward repair. If durable recovery is required,
follow RB-08 isolated restore. Never overwrite source databases or use a
manager database as a target.

### Exit

Canonical invariants, exact replay, itemisation attribution, manual visibility,
and before/after hashes pass on the recovered candidate.

## RB-04 - Readiness, startup, or configuration failure

Alarms: `W203-P2-READINESS`, `W203-P2-AGGREGATE-START`.

### Diagnose

1. Confirm whether failure is liveness, configuration readiness, dependency
   health, or authenticated semantic readiness.
2. Inspect safe reason classes for datasource, Flyway/catalog, repository,
   auth/assertion, fixed URLs, required credentials, receipt/snapshot wiring,
   and evidence writer.
3. Use process-local health only as a first signal; it cannot close the event.
4. Confirm the wrapper still targets exact Wave A ownership and loopback port.

### Recover

After incident-commander/release-review approval, correct version-controlled
configuration or dependency state and execute RB-09 guarded graceful restart.
Do not extend the 120-second deadline to turn a failure into PASS.

### Exit

Every required service reaches readiness plus its authenticated semantic probe
within 120 seconds, and aggregate startup remains within ten minutes.

## RB-05 - Latency, pool, lock, or resource breach

Alarms: all W2-03 latency P2s, `W203-P2-DB-CONTENTION`, and P3 drift.

### Diagnose

- Preserve raw monotonic samples and exact populations before restarting.
- Split edge/BFF, Booking capture, Charge provider, Booking completion, and
  response timings using valid parent/child linkage.
- Inspect Hikari/client permits, acquisition wait, active/pending counts,
  PostgreSQL locks/deadlocks/query plans, query counts, GC/heap/RSS/CPU,
  sockets/threads, and retained bodies.
- Separate healthy-path percentiles from injected dependency-fault ceilings.
- Treat expected typed 4xx outcomes as latency samples without calling them
  availability errors.

### Recover

Do not raise pools, memory, CPU, timeouts, or retries during the incident
without a reviewed hypothesis and capacity evidence. Stop and fix the candidate
or query/configuration, then run a fresh fixed population. A restart does not
erase the original failed evidence.

### Exit

Direct nearest-rank objectives pass; no deadlock, pool timeout, leak, N+1,
OOM/restart, or disallowed resource drift remains.

## RB-06 - Dependency outage, circuit behavior, or no-rate ambiguity

Triggers: Identity/Reference Data/Charge/database/broker/registry failure,
timeout/503, circuit open, `NO_RATE`, or ambiguity.

### Diagnose

1. Preserve the exact typed outcome and dependency.
2. For Identity/Reference failures, prove fail-closed/no-mutation behavior.
3. For Charge provider failure, verify Booking retries only typed timeout/503,
   makes at most two bounded calls, and records circuit/retry evidence.
4. Distinguish `NO_RATE` and residual ambiguity from transport outage:
   valid no-rate/ambiguity commits the required manual case; outage does not
   become guessed or zero pricing.
5. Treat broker/registry relay degradation separately from synchronous command
   readiness and commercial authority.

### Recover

Restore dependency health, then use an explicit retry/reconciliation path.
Never replay an uncertain mutation without checking its durable receipt first.
Never bypass authorization or switch to stale commercial data.

### Exit

Typed meaning, retry/circuit bounds, no-write or terminal-case invariants, and
safe user-visible result all pass.

## RB-07 - Migration or catalog incompatibility

Triggers: Flyway checksum/catalog drift, missing column/index/constraint,
previous-image compatibility failure, or migration test failure.

### Contain

Stop candidate startup or promotion. Preserve image/config hashes, migration
resources, source catalog, compatibility query result, and backup identity.

### Diagnose

- Confirm service and migration ownership: U01 owns Charge V1-V4; U05 owns
  Booking V3; later changes require a new additive owner-approved migration.
- Verify the exact source-to-target migration path and legacy fixture
  preservation.
- Treat any active/retryable/permanent W2-owned row or incompatible Booking
  aggregate as rollback-ineligible where the compatibility design requires it.

### Recover

Applied migrations are never edited or reversed. Use forward repair with a new
approved migration, or RB-08 isolated restore. A previous image may run only
under its proven read-only/drained compatibility mode and role.

### Exit

Flyway/catalog/checksums, constraints/indexes, legacy bytes, counts/hashes,
semantic probes, and rollback/forward-repair predicates pass.

## RB-08 - Verified isolated database restore

Triggers: recovery exercise or approved durable-data recovery.

### Preconditions

- incident commander, data/recovery specialist, and release reviewer approve;
- checksummed Charge and Booking backups and candidate images are known;
- administrative connection is fixed to the allow-listed Wave A PostgreSQL
  service and `postgres` database;
- source names/OIDs, owner roles, and generated target identities are recorded.

### Procedure

1. Generate distinct wrapper-owned targets:
   `w203_restore_charge_<utcRunId>_<random8>` and
   `w203_restore_booking_<utcRunId>_<random8>`.
2. Prove each target is absent and unequal to both source OIDs and the other
   target.
3. Restore each service backup only to its mapped target using its service
   owner boundary.
4. Apply candidate migrations and validate catalog/Flyway/count/canonical
   hashes.
5. Start candidate services against restored targets only.
6. Prove authorized detail, pricing/manual terminal, Booking exact replay,
   snapshot/history, and immutable hashes.
7. Record commands, versions, backup/image digests, identities, probes, and
   hashes in the recovery artifact.

### Failure handling

A failed identity guard leaves the generated target for separately approved
manual cleanup; it never falls back to a path/name-only deletion. Source
databases and manager resources are never restore or cleanup targets.

### Exit

Integrated Charge/Booking recovery meets the 120-second readiness/replay bound
and local-volume RPO-0 equality. Host/volume-loss recovery is not claimed.

## RB-09 - Guarded graceful service restart

Triggers: approved recovery from stateless/service failure.

### Preconditions

- RB-00 preservation passes;
- incident commander and release reviewer approve;
- exact service and wrapper-owned Wave A project are resolved;
- manager guard is PASS.

### Procedure

1. Stop new acceptance work.
2. Allow Spring HTTP/relay work up to its 15-second graceful phase and Compose
   stop grace up to 20 seconds; Node egress/cleanup remains bounded.
3. Restart only the named candidate service through
   `scripts/wave-a-compose.mjs`; do not run raw mutating Docker Compose.
4. Poll readiness with monotonic backoff within 120 seconds.
5. Run one authenticated semantic probe and the exact replay/consistency probe
   required by the service.
6. Run `npm run demo:guard` and sibling probes.

### Exit

Readiness, semantic behavior, durable equality/replay, resource release, and
manager preservation pass. Otherwise escalate to RB-03, RB-04, or RB-07.

## RB-10 - Evidence writer, ledger, or unsafe trace failure

Alarm: `W203-P2-EVIDENCE-WRITER` or evidence/redaction anomaly.

### Contain

Stop promotion. Preserve safe writer diagnostics, file/volume/parent identity,
link/reparse state, ledger tail, artifact hashes, and disk/capacity state.
Unsafe trace content is discarded rather than retained for diagnosis.

### Diagnose

- distinguish unavailable native capability (`BLOCKED`) from corrupt,
  mismatched, duplicate, dangling, or unsafe evidence (`FAIL`);
- validate same-volume exclusive temporary file, link count, reparse/junction
  state, volume/file/parent identity, atomic rename, ledger framing, and hash;
- reconcile a torn tail or renamed-but-unindexed artifact only through the
  approved recovery algorithm;
- enforce non-trace, trace, temporary, entry, expansion-ratio, run-root, and
  free-disk caps.

### Recover

There is no unlocked/path-only fallback writer. Restore the approved writer
capability or mark required cells `BLOCKED`. Cleanup of terminal roots older
than 30 days while retaining the latest ten per status is a separate,
explicitly approved guarded action.

### Exit

Every required artifact and ledger entry verifies, redaction passes, caps hold,
and the manager/sibling state is unchanged.

## Runbook exercise matrix

| Runbook | Current state | Required proof before activation |
|---|---|---|
| RB-00 safety/triage | NOT RUN | complete bounded evidence with no mutation |
| RB-01 manager drift | NOT RUN | injected target mismatch stops before mutation |
| RB-02 auth/disclosure | NOT RUN | fail closed, rotation drill, redaction |
| RB-03 integrity | NOT RUN | atomic containment and exact recovery |
| RB-04 readiness | NOT RUN | reason-specific diagnosis and bounded restart |
| RB-05 performance | NOT RUN | raw sample retention and cause isolation |
| RB-06 dependencies | NOT RUN | typed semantics and bounded retry/circuit |
| RB-07 migration | NOT RUN | forward repair/read-only compatibility |
| RB-08 restore | NOT RUN | distinct guarded targets and hash equality |
| RB-09 restart | NOT RUN | wrapper-only restart and preservation |
| RB-10 evidence | NOT RUN | locked writer recovery and unsafe discard |

No runbook is operationally proven until exercised on a deployed candidate.

