# W2-04 Smoke Test Results

## Scope and Upstream Trace

The smoke plan is governed by `cd-config` and `deployment-strategy`, targets
only environments listed in `environment-inventory`, and must not overstate the
partial evidence in `build-test-results`.

Because no deployment occurred, no post-deployment smoke test exists. The
checks below are preflight health observations against the already-running,
protected manager demo; they are not W2-04 release acceptance.

## Safe Preflight Checks

Observed at 2026-07-28 08:18 UTC:

| Check | Result |
|---|---|
| `npm run demo:guard` | PASS: 15 containers, 15 services, routes 200/308/301/301 |
| Identity health | HTTP 200 |
| Reference Data health | HTTP 200 |
| Charge Agreement health | HTTP 200 |
| Booking health | HTTP 200 |
| Container Movement health | HTTP 200 |
| Schema Registry subjects endpoint | HTTP 200 |
| `linercore-wave-a` presence | ABSENT |

These GET-only checks did not create a Booking, capture a movement, publish or
consume an event, modify a projection, or execute a database migration.

## Required Post-Deployment Smoke Matrix

The following must run against a commit-SHA release in the isolated target
after deployment becomes eligible:

| Smoke path | Required evidence | Current result |
|---|---|---|
| Priced Booking fixture | Confirmed Booking identifier bound to the release manifest | NOT RUN |
| Journey creation | Persisted CMM journey and canonical expected moves | NOT RUN for a deployed candidate |
| Ordered lifecycle | GTOT -> LOAD -> DISC -> GTIN | NOT RUN for a deployed candidate |
| Typed rejection | Wrong-next and duplicate HTTP 409 envelopes | NOT RUN for a deployed candidate |
| Event path | CMM outbox -> Kafka -> Booking receipt/projection | NOT RUN for a deployed candidate |
| Authorization/degradation | Deny and dependency-failure safe outcomes with write-set proof | NOT RUN |
| Current timeline UI | Current commit-SHA frontend at approved viewports with keyboard/a11y evidence | NOT RUN |
| Performance | Approved 20-sample populations and thresholds | NOT RUN |
| Exit audits | `aidlc-audit`, `erp-fidelity-audit`, and hashed evidence manifest | NOT RUN |
| Cleanup | Scoped `always()` teardown and post-run manager guard | NOT RUN |

Prior live remediation recorded in `cd-config` remains useful historical
evidence, but it cannot substitute for smoke checks on a newly deployed,
immutable candidate.

## Build and Test Boundary

`build-test-results` proves backend reactors, static contracts, and focused UI
component behavior from its observation window, while recording blocked
frontend worker/build, live Compose, migration, browser, coverage, advisory,
and performance evidence. Later CI remediation improved several of those
areas, but `cd-config` still preserves the unresolved release gates.

No historical result is relabeled to make this deployment appear successful.

## Verdict

**Post-deployment smoke status: NOT RUN / BLOCKED.**

**Existing manager health preflight: PASS at the final observation.**

The two statements describe different targets and must remain separate.

