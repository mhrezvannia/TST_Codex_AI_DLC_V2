# W2-04 Deployment Strategy

## Decision and Upstream Trace

The selected strategy is a **controlled service-by-service recreate/rolling
promotion of immutable images within the existing portable Compose topology**.
This follows `deployment-architecture`, carries forward the verified controls
from `cicd-pipeline`, and allows promotion only when `ci-config` and
`quality-gates` are fully green.

Blue/green and canary deployment are not selected because the approved W2-04
scope defines neither duplicate production capacity nor a production traffic
router. Adding either would invent infrastructure and availability claims.

## Promotion Flow

```text
short-lived intent branch
  -> static CI and contract gates
  -> immutable release manifest
  -> serialized isolated Wave A acceptance
  -> staging promotion (only if a staging target is approved)
  -> separate manual production approval
  -> production deployment (only after a production target is approved)
```

The current candidate stops at the Wave A gate with status **HOLD**. The
deployment documentation does not authorize staging or production execution.

## Deployment Unit and Ordering

The release unit is one manifest that binds compatible versions of Container
Movement, Booking, frontend, contracts, configuration, and Flyway checksums.
Promotion uses the following safe order:

1. verify the target, previous known-good manifest, capacity, credentials, and
   manager-demo isolation;
2. apply only reviewed additive Flyway migrations;
3. deploy Container Movement and wait for database, broker, outbox, Identity,
   and Reference Data health;
4. deploy Booking and verify consumer/projection health;
5. deploy the current frontend image;
6. execute contract, lifecycle, typed-rejection, projection, authorization,
   degraded-dependency, UI, and audit smoke checks;
7. record the resulting manifest and evidence hashes.

No shared database, cross-service SQL, destructive volume reset, unscoped
Compose teardown, or synchronous replacement for Kafka is permitted.

## Availability and Data Safety

Compose may briefly recreate a service, so this intent makes no zero-downtime
production claim. Kafka delivery, service-owned PostgreSQL volumes, outbox
state, and Booking receipt/projection fences must remain intact across the
deployment. Consumers must tolerate replay without erasing the observable
duplicate and stale-delivery evidence required by W2-04.

Migrations use expand/contract sequencing and are forward compatible with the
previous known-good application wherever rollback is claimed. Destructive
schema changes and automatic down migrations are prohibited. When backward
compatibility is not proven, deployment stops and recovery uses a reviewed
forward repair; backup restoration is allowed only when the backup and restore
procedure has been independently validated.

## Promotion and Approval Gates

The release reviewer must verify:

- every blocking entry in `quality-gates` is `PASS`;
- current commit-SHA images, rather than fallback or manager images, supplied
  the evidence;
- W2-02 integration synchronization and the intended base SHA are recorded;
- isolated Wave A fixture creation, Playwright, performance, audits, evidence
  hashing, and `always()` cleanup ran;
- pre/post `npm run demo:guard` passed and port 8088 was untouched;
- secrets are redacted and artifact identities are immutable;
- the historical W1 waiver remains `BLOCKED_WAIVED`.

Production additionally requires a distinct manual tech-lead and product-owner
approval. Since no production target or protection rule is configured in the
approved scope, that gate is closed.

## Feature-Flag Position

No new W2-04 feature flag or flag platform is introduced. The journey,
lifecycle, event, Booking projection, and timeline form one vertical release
unit and must not be partially reported as complete. An existing configuration
control can serve as an emergency containment mechanism only after its
fail-safe behavior, ownership, audit event, and dependency impact are tested.

## Current Holds and Exit Criteria

Deployment remains blocked until all current-image build and UI/Playwright
evidence, 85% coverage reports, approved 20-sample performance results,
post-upgrade dependency advisory results, exact W2-02 synchronization evidence,
and the complete isolated CI fixture/orchestration/evidence-validation path are
observed. Clearing these holds authorizes a promotion decision; it does not by
itself create or approve a production environment.

