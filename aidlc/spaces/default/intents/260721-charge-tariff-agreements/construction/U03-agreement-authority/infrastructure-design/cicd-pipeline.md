# CI/CD Pipeline - U03 Agreement Authority

## Pipeline boundary

U03 builds the existing Charge service/app images and tests the U01 V3,
U02 assertion, vendor/legacy adapters, and bounded relay. It creates no cloud or
second Compose deployment. Full-stack proof uses guarded Wave A only.

## Build and static gates

Run Maven Charge tests/build, Charge frontend test/typecheck/lint/build,
contract validation/provider verification, Flyway catalog tests, and the exact
locked Semgrep/Gitleaks/Yarn/Trivy/Syft/waiver suite defined by U02
Infrastructure Design. Missing tool/config/report, live secret, or unwaived
current-UTC High/Critical finding blocks.

Contract tests use the shared
`contracts/security/charge-subject-assertion-v1.json`, Agreement vendor media,
legacy JSON fixtures, Avro 1.0.0/1.1.0 fixtures, and exact event subjects. No
browser-selected media/actor/assertion may reach the service.

## Database, concurrency, and relay gates

Required jobs prove:

- empty/exact-legacy/history/drift/checksum V1-V4 startup with U03 never editing
  migration files;
- exact header discriminator, nullable commodity, version/link/activity/outbox
  physical contract and indexes;
- fixed 10k/50k/150k fixture, bounded pages/set queries, no N+1;
- exact healthy population per operation/outcome class and separate <=2,000 ms
  dependency-fault suite;
- two Spring contexts, 20 fresh approval/successor races, one winner and
  independent-key progress;
- TypeScript/Java assertion bytes/context plus 4096/4097/expiry/restart replay
  behavior;
- atomic commercial/activity/outbox fault injection and restart hashes;
- total/complement old/U03 ownership classifier, malformed-prefix and
  W2-without-prefix quarantine, row protocol/fencing, exact delays
  5/15/30/60/60/60/60, typed errors, attempt eight, terminal retention,
  103/72-second arithmetic, and <=2-second relay acquisition under ten commands;
- 100-row broker fault/recovery <=120 seconds and ack-before-mark duplicate
  identity/consumer dedupe.

Unexpected outcomes and unavailable required capabilities remain FAIL/BLOCKED,
never PASS.

## Wave A deployment

1. run `demo:guard`, render/validate loopback exact Wave A config and image/
   Flyway/schema/relay hashes;
2. require U02/U03 assertion key/secret/config compatibility without exposing
   the secret;
3. start only through the wrapper and wait for Charge readiness;
4. run vendor/legacy API, concurrency, relay, restart, correlation, redaction
   and route-preservation evidence;
5. rerun `demo:guard` and publish checksummed evidence.

U06 retains ownership of final Playwright/Booking-visible journeys, restore,
audits and fidelity evidence.

## Rollout and rollback

The candidate must deploy with exactly one owner for every Charge outbox row.
Old relay uses the negation of the total U03 classifier; U03 owns the classifier
and quarantines any owned row that is not publish-valid. Pre-start SQL fixtures
cover legacy five-type, wrong-type reserved, W2 missing-prefix, valid U03, and
unrelated rows; bean-count assertions block overlap/gaps.

The flag may be rolled back to the old coordinator only when the pre-start
query proves that zero active, terminal, or quarantined rows match the full
`u03_owned` classifier, including prefix-owned rows and five-type/W2-versioned
rows without the prefix. The compatibility test uses that identical predicate.
After any `u03_owned` row is committed, disabling/removing the U03 coordinator
or starting an old image is rollback-ineligible; PERMANENT quarantine remains
U03-owned evidence. Normal recovery is forward repair.

Before a forward-repair restart, stop new claims, allow active ack/mark work,
then wait through the 30-second lease and confirm no live PROCESSING row belongs
to the stopped worker. Payload/state repair or PERMANENT replay requires a
separate audited action; the pipeline never deletes or silently requeues.

Database recovery remains forward migration or isolated verified restore under
U01/U06 controls. Manager resources and port 8088 are never deployment targets.

## Upstream traceability

This pipeline consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. Its gates cover
their V3, media/assertion, transaction/concurrency, relay, compatibility and
preservation requirements.
