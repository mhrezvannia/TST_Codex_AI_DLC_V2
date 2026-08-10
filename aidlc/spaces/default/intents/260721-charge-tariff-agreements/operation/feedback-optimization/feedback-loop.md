# W2-03 Operational Feedback Loop

## Status and evidence basis

Status: **CLOSING BACKLOG DEFINED; FINAL WORKFLOW APPROVAL PENDING**.

This feedback loop consumes `dashboards`, `alarms`, `slo-config`,
`deployment-log`, `load-test-results`, and `incident-plan`. It carries the
operation facts forward without treating unmeasured production/user/cost data
as insights. It does not automatically start a new Ideation cycle.

## What the workflow established

- The W2-03 slice has explicit Charge Rate and Agreement authority, typed
  Agreement-first/Tariff fallback pricing, no-rate/manual-case semantics,
  Booking receipt/snapshot/repricing behavior, BFF/security boundaries, and
  isolated acceptance contracts.
- Deterministic source/component/contract evidence exists from Construction.
- Deployment, observability, incident activation, and performance validation
  correctly stopped or remained BLOCKED when runtime prerequisites were absent.
- Operation now has installable dashboard/alarm/SLO/tracing designs, incident
  runbooks, an executable load plan, and exact admission criteria.
- No production SLO, cost, capacity, drift, incident, or user-behavior claim
  was invented.

## Evidence-enablement backlog

These items close the current W2-03 Definition of Done; they are not new
feature scope.

| Priority | Work item | Owner role | Exit evidence |
|---:|---|---|---|
| P0-1 | restore deterministic frontend Vitest/build process execution | frontend/build owner | locked install plus successful Vitest and production build |
| P0-2 | make approved Booking Resilience4j dependency immutably available | Booking/build owner | offline/CI Maven Booking build and tests PASS with dependency hashes |
| P0-3 | restore Docker/wrapper/default-manager guard capability | release/platform owner | preflight, exact config, wrapper inventory, manager guard PASS |
| P0-4 | restore locked native evidence-writer capability | quality/release owner | writer, crash recovery, hash, redaction, and cap tests PASS |
| P0-5 | measure changed-code coverage and required security/audit gates | quality/security owner | >=80% changed Charge/Booking coverage and declared scans/audits PASS |
| P0-6 | deploy immutable candidate through guarded Wave A lane | release reviewer | deployment, migration, readiness, smoke, and preservation evidence |
| P0-7 | provision and verify local observability | operations owner | dashboards/alarms/metrics/traces installed with safe labels and links |
| P0-8 | execute U06 live acceptance and performance plan | quality/release owner | every closed cell PASS; raw samples, browser, restore, resources, audits |
| P0-9 | rehearse incident response | operations/security/data roles | assigned contacts, channel, alert-to-runbook and recovery exercises |
| P1-1 | repair AI-DLC runtime-graph memory paths | harness owner | all stage memory paths resolve inside active intent; surface returns entries |

Promotion remains blocked until all mandatory P0 rows are PASS. P1-1 protects
future workflow learning reliability and should be fixed before the next
AI-DLC run if possible.

## Feedback signal registry

| Signal | Current value | Decision |
|---|---|---|
| SLO compliance/burn | unmeasured | do not change reliability targets |
| latency/throughput/resources | unmeasured | do not tune capacity |
| cost per run/transaction | unmeasured | capture usage and rates first |
| runtime drift | unassessed | run desired-vs-live comparison after deployment |
| incidents/MTTD/MTTR | none activated | exercise plan before operational claim |
| user behavior/adoption | no telemetry or research dataset | no feature inference |
| operational toil | blockers known; frequency/duration unknown | measure attempts/minutes before automation ranking |
| release blockers | concrete and repeatable | prioritize evidence enablement |

## Decision cadence

After each future candidate attempt:

1. ingest deployment, gate, metric, trace, cost, drift, incident, and toil
   evidence;
2. validate source identity, completeness, redaction, and time window;
3. classify signals as PASS, FAIL, BLOCKED, trend, or hypothesis;
4. assign remediation to the current intent when it closes an existing DoD;
5. propose a new intent only for approved new product/platform scope;
6. record the decision, owner role, evidence target, and review date.

Weekly/monthly operations cadences are not created until a real environment,
owners, and data frequency exist.

## Candidate future intents

These are proposals only and require a separate user decision:

- production deployment/platform, identity/secret custody, retention, backup,
  SLO/error budget, cost governance, and scaling;
- manual pricing assignment, quoting, approval, resolution, and closure;
- partner/import integration and broader distribution;
- expanded rating dimensions, optimization, or external commercial workflows;
- harness/runtime-graph correction if it is managed outside this project.

None may replace the P0 evidence backlog for the current slice.

## Optimization guardrails

- optimize measured bottlenecks, not hypotheses;
- preserve service-owned data and pricing authority;
- never weaken auth, typed outcomes, idempotency, evidence integrity, or
  manager protection for speed/cost;
- require before/after performance, correctness, resource, and cost evidence;
- roll forward through approved changes; never edit applied migrations or
  destructively reset proof data;
- keep production/cloud changes in a separately approved scope.

## Closure decision

On final approval, the 32-stage AI-DLC workflow is complete as a decision and
artifact lifecycle. Release/live acceptance remains blocked by the explicit P0
backlog; workflow completion is not release completion.

