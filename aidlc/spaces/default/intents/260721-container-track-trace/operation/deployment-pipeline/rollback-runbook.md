# W2-04 Rollback and Forward-Recovery Runbook

## Scope and Upstream Trace

This runbook applies to releases assembled by `ci-config`, admitted by
`quality-gates`, deployed into the topology described by
`deployment-architecture`, and promoted through the unit `cicd-pipeline`
controls. It covers isolated Wave A and any later approved staging or
production Compose target. It never authorizes operations against the manager
demo project.

## Rollback Triggers

Stop promotion and open a rollback decision when any of the following occurs:

- service or dependency health does not stabilize within the approved window;
- contract compatibility, Flyway validation, or configuration identity fails;
- accepted movements, outbox publication, Kafka delivery, Booking projection,
  authorization, or degraded-dependency behavior regresses;
- duplicate or out-of-sequence requests lose their typed HTTP 409 outcome;
- the current timeline UI, accessibility, or responsive smoke checks fail;
- evidence is missing, mutable, redaction-unsafe, or associated with the wrong
  commit/image;
- the manager demo guard fails or any command could target port 8088;
- security, data-integrity, or operator-impact severity requires containment.

## Roles and Preconditions

The release reviewer owns the go/stop/rollback record. Service owners diagnose
Container Movement and Booking behavior. The platform owner controls Compose,
Kafka, Schema Registry, databases, Identity, Reference Data, and runner access.
The tech lead approves schema recovery; production rollback also notifies the
product owner.

Before changing the target:

1. freeze further promotions and record incident time, release manifest,
   correlation identifiers, and observed impact;
2. preserve logs, traces, metrics, screenshots, audit output, database
   migration state, consumer offsets, and release/evidence hashes;
3. identify the previous known-good immutable manifest and verify its digests;
4. run `npm run demo:guard` and confirm that the intended Compose project and
   volume namespace are isolated;
5. classify schema compatibility using the migration decision table below.

## Application and Configuration Rollback

When the previous application is compatible with the current additive schema:

1. keep PostgreSQL volumes, Kafka data, outbox rows, receipts, and projections;
2. restore the previous known-good image digests and matching non-secret
   configuration;
3. recreate only the intended services in dependency order—Container Movement,
   Booking, then frontend—without `latest`, volume deletion, or an unscoped
   `docker compose down`;
4. wait for database, broker, Schema Registry, Identity, and Reference Data
   health;
5. run focused contract, authorization, lifecycle, typed-conflict, outbox,
   projection, and UI smoke checks;
6. verify consumer lag converges without deleting or silently skipping events;
7. run both exit-audit detectors and the manager demo guard;
8. attach the rollback manifest and evidence hashes to the incident record.

For isolated Wave A, all control must remain through
`scripts/wave-a-compose.mjs`. A production form of these commands is not
available until a production target is approved and provisioned.

## Migration Decision Table

| Database state | Previous image compatibility | Action |
|---|---|---|
| No new migration applied | Compatible | Redeploy the previous manifest |
| Additive migration applied | Proven compatible | Keep schema and data; redeploy previous images |
| Additive migration applied | Not proven compatible | Do not roll application backward; deploy reviewed forward repair |
| Destructive/incompatible change detected | Unsafe | Stop, isolate, preserve evidence, and escalate to tech lead |
| Data corruption suspected | Unknown | Stop writes; use only a separately validated backup/restore or forward-repair plan |

Automatic down migrations, database resets, volume deletion, cross-service SQL
repair, and treating container restart as recovery evidence are prohibited.

## Messaging and Projection Recovery

Do not purge Kafka topics, reset offsets, delete outbox rows, or rewrite Booking
projection state to make checks pass. First stop the affected publisher or
consumer, preserve offsets and correlation evidence, then correct the
application/configuration. Any replay must be bounded, authorized, and prove
idempotent receipt plus observable duplicate/stale outcomes. Verify the final
latest-per-container Booking projection against the authoritative CMM movement
history.

## Security and Secret Recovery

If credential exposure is suspected, stop the job, restrict retained evidence,
rotate the affected secret through the existing owner-controlled mechanism, and
revoke old credentials before redeployment. Never copy secret values into the
release manifest or incident record. A security incident is not eligible for
the single environmental retry.

## Validation and Closure

Rollback is complete only after service health, migration state, contract
checks, one canonical journey read, one authorized capture, typed invalid and
duplicate outcomes, outbox-to-Booking convergence, current UI rendering, audit
detectors, and manager-demo isolation are observed. The release reviewer then
records whether to keep the previous version, deliver a forward fix, or remain
on HOLD.

The present W2-04 candidate is already on **HOLD**, so this runbook is a
prepared control rather than evidence that a deploy or rollback has occurred.
The historical W1 result remains `BLOCKED_WAIVED`.

