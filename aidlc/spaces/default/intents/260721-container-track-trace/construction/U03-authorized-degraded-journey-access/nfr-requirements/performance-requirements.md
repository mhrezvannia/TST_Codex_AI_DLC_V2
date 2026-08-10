# Performance Requirements - U03 Authorized Degraded Journey Access

## Source Alignment

These requirements specialize U03 `business-logic-model.md` and
`business-rules.md`, retain `requirements.md`, and use the brownfield
`technology-stack.md` runtime. They create no production SLO.

## Local Authorization and Degraded-Read Targets

For each outcome—authorized fresh read, read DENY, Identity unavailable, and
authorized Reference Data last-known read—run one excluded warm-up followed by
20 run-scoped API requests and a separate 20-request Playwright UI population.
API timing uses the controller monotonic clock from dispatch to the complete safe
response; UI timing uses browser `performance.now()` from submit to focused
outcome. Each population must meet p95 <= 2 seconds and max <= 5 seconds;
nearest rank is `ceil(.95*N)` (19th of 20). Record correlation, outcome code,
freshness, and protected-data absence/presence assertions.

## Recovery Boundary

After dependency health is restored, a user-triggered Retry performs fresh
Identity authorization and fresh Reference Data checks. API and focused UI
must independently show a fresh authorized result within 30 seconds, polling
every 500 ms. No authority is cached and no movement is queued or resubmitted.

Before and after every isolated acceptance run, execute `npm run demo:guard` and
require the manager demo on port 8088 to remain unchanged. The live proof uses
the isolated `linercore-wave-a` Compose controller; only one live acceptance
Compose stack may run at a time.

## Non-Claims

No provider throughput, production latency, availability, capacity, or outage
SLO is claimed. The prior W1 BLOCKED result remains an explicit BLOCKED waiver;
U03 evidence cannot relabel it as PASS. Any new local PASS is recorded
separately.

## Review Iteration 1

**Verdict: NOT-READY**

1. **Mixed-set membership is not executable** (`scalability-requirements.md`,
   “Mixed Authorization Isolation Proof”). The requirement says “covering” six
   outcome classes but does not define the exact ten requests (including
   multiplicity, subject/role, resource/action, and which are GET versus POST).
   Enumerate the fixed 10-request matrix and expected per-request HTTP, safe
   envelope, repository-lookup, audit, and CMM write sets so isolation can be
   mechanically asserted.
2. **Environment protection evidence is absent** (`performance-requirements.md`,
   “Recovery Boundary”; `tech-stack-decisions.md`, “verification”). Add an
   explicit acceptance pre/post `npm run demo:guard` assertion protecting the
   manager demo on port 8088, require the isolated `linercore-wave-a` Compose
   controller, and state that only one live acceptance stack may run at a time.
3. **Historical waiver boundary is unstated** (`performance-requirements.md`,
   “Non-Claims”). Record that the prior W1 BLOCKED result remains a BLOCKED
   waiver and is not relabeled as PASS by U03 evidence; any new local PASS must
   be a separate record.

## Builder Remediation after Review Iteration 1

The builder fixed the isolation proof to an exact ten-row subject/route/
dependency matrix with per-row HTTP, lookup, audit, and CMM write-set
assertions; added pre/post `npm run demo:guard`, port-8088 protection, and the
single isolated `linercore-wave-a` Compose-stack rule; and recorded W1 as a
BLOCKED waiver that cannot be relabeled by this intent.

## Review Iteration 2

**Verdict: NOT-READY**

1. **DENY rows contradict their stated write sets** (`scalability-requirements.md`,
   rows 4, 5, and 10). Each real DENY must persist exactly one authorization-
   denial audit, yet the table says “no CMM row.” Replace that phrase with “no
   CMM business row; exactly one denial-audit row,” and assert the audit delta
   explicitly.
2. **POST capture ordering is misstated** (`scalability-requirements.md`, row
   10). The U03 contract requires every POST to freshly evaluate
   `AuthorizationPort` for capture; “no protected capture evaluation” could be
   implemented as skipping that required decision. Clarify it as no protected
   repository/domain/idempotency evaluation before the capture DENY, while
   retaining the mandatory authorization call and its single audit write.
