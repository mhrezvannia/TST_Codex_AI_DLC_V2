# W2-04 Continuous Delivery Configuration

## Purpose and Upstream Trace

This configuration turns the accepted `ci-config` into a deployment control
plane without weakening the release-blocking `quality-gates`. It implements the
portable Compose boundaries defined by each unit's `deployment-architecture`
and preserves the build, evidence, promotion, and rollback sequence defined by
each unit's `cicd-pipeline`.

The current release decision is **HOLD**. This document defines the delivery
path; it does not claim that the missing live CI orchestration, current-image UI
evidence, coverage evidence, performance population, dependency advisory
query, or W2-02 synchronization evidence has passed.

## Release Model

| Environment | Trigger | Deployment target | Approval | Current state |
|---|---|---|---|---|
| Pull request | PR update | No deployment | CI checks | Available |
| Wave A acceptance | Successful static gates on the integration candidate | Isolated `linercore-wave-a` Compose project | Serialized release-review job | HOLD until all live-job gaps are wired and observed |
| Staging | Merge to the approved integration/trunk candidate | Existing portable Compose topology | Automatic only after the full Wave A evidence gate | Not activated by this intent |
| Production | Immutable approved release reference | No production runtime is defined in the approved scope | Separate manual tech-lead and product-owner approval | Not configured; deployment prohibited |

No environment branch is introduced. Promotion follows the trunk-based program
flow and carries one immutable release manifest between environments.

## Release Manifest

Every promotable candidate must record:

- source commit SHA and integration-base SHA;
- immutable image tags for Container Movement, Booking, and the current
  frontend, never `latest`;
- image digests, configuration digest, and Flyway migration checksums;
- contract versions for Avro, AsyncAPI, Pact, and relevant REST providers;
- the hashed W2-04 evidence manifest and audit outputs;
- the W1 result as `BLOCKED_WAIVED`, never rewritten as `PASS`;
- the previous known-good release manifest for rollback.

If any required identity is absent or mutable, promotion fails closed.

## Pipeline Jobs and Dependencies

The delivery workflow extends `.github/workflows/quality-gates.yml` on the
existing `[self-hosted, on-prem, linux]` runner:

1. `static-quality` runs the blocking backend, frontend, contract, dependency,
   and 85% line-coverage checks from `quality-gates`.
2. `package-release` builds commit-SHA-tagged images and records image digests
   only after `static-quality` passes.
3. `wave-a-acceptance` uses concurrency group
   `linercore-wave-a-acceptance` with `cancel-in-progress: false`.
4. The live job verifies the W2-02 integration base, runs
   `npm run demo:guard`, creates and confirms the priced Booking fixture,
   starts only the isolated stack through `scripts/wave-a-compose.mjs`, runs
   `scripts/w2-04-live-acceptance.mjs` and
   `scripts/w2-04-playwright.mjs`, executes both exit audits, validates the
   hashed evidence manifest, and uploads `artifacts/w2-04-live/**`.
5. `always()` cleanup removes only the isolated Wave A resources and runs the
   manager demo guard again. It must never target the manager project or issue
   an unscoped Compose teardown.
6. `promote-staging` may run only after every blocking gate is `PASS`.
7. `promote-production` remains disabled until a production target, protection
   rules, credentials, health checks, and recovery evidence are separately
   approved.

One evidence-preserving retry is allowed only for a classified environmental
failure. Deterministic product, contract, security, or data failures are not
retryable promotion evidence.

## Promotion Conditions

Promotion fails closed unless all of the following are observed:

- normal current-image builds succeed without fallback images;
- remote dependency advisory resolution completes at the required severity;
- backend and frontend reports meet the affirmed 85% line threshold;
- the exact W2-02 synchronization prerequisite is recorded;
- the isolated fixture, lifecycle, typed-conflict, broker, database, Booking
  projection, and current timeline UI proofs pass;
- the 375, 768, 1024, and 1440 viewport, keyboard, state, and contrast evidence
  passes;
- both approved 20-sample performance populations pass;
- both exit-audit detectors and the evidence-manifest validation pass;
- the pre/post manager demo guards pass.

`PARTIAL`, `BLOCKED`, missing, stale, or waived evidence is not promotable.

## Configuration, Secrets, and Feature Controls

Environment configuration is injected through the existing CI/runtime
mechanism and is included in the release manifest by digest, not by secret
value. Tokens, credentials, provider URLs containing credentials, raw payloads,
and stack traces must not appear in logs or retained evidence.

W2-04 introduces no release feature-flag service and no new public-cloud
dependency. A pre-existing, tested configuration switch may be used only if it
has a named owner, safe default, audit trail, and documented removal condition;
otherwise rollback uses the immutable release procedure.

## Ownership and Audit

Container Movement owns journey, movement ledger, outbox, and its page
composition. Booking owns event receipt and latest-per-container projection.
The platform owner controls Kafka, Schema Registry, Identity, Reference Data,
networking, runner availability, and the serialized Compose controller. The
release reviewer classifies failures, verifies evidence integrity, and records
promotion or rollback decisions. Production approval remains a separate manual
tech-lead plus product-owner action.

