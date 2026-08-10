# Rollback Runbook - W1-01

## Upstream Inputs

Rollback rules come from `ci-config`, `quality-gates`, unit `deployment-architecture`, and unit `cicd-pipeline` artifacts. The common rule is preservation: retain evidence, retain volumes unless explicitly operating on a disposable copy, and use compatible images or forward repair rather than destructive reset.

## When To Roll Back

Rollback or abort when any release-proof gate fails after a service/image/config change:

| Signal | Action |
|---|---|
| Compose startup fails before migrations | stop new stack, keep previous image/runtime usable |
| Flyway validation rejects schema history | abort; do not baseline or mutate unknown catalogs |
| Contract/schema incompatibility appears | abort; restore compatible service image set |
| Booking/CMM/Charge service fails health | revert to previous compatible image and preserve logs |
| Live acceptance manifest is `FAILED` | retain failed run and open a fix run with a new ID |
| Live acceptance manifest is `BLOCKED` | fix external prerequisite, then rerun with a new ID |

## Pre-Rollback Capture

Before changing runtime state, capture:

```powershell
docker compose ps
docker compose logs --no-color > artifacts/w1-01-live/<run-id>/rollback/compose.log
docker compose config > artifacts/w1-01-live/<run-id>/rollback/compose.resolved.yaml
```

When database state may be involved, capture a logical dump or hash through the existing local evidence mechanism. Do not commit sensitive dumps.

## Application Rollback

1. Stop the failed service containers.
2. Restore the previous compatible image tags or rebuild the previous commit.
3. Start dependencies first: PostgreSQL, Kafka, Schema Registry.
4. Start service containers in dependency order.
5. Run health checks.
6. Run the read-only Booking list/detail smoke checks.
7. Start a fresh live acceptance run if release proof is still needed.

## Database And Schema Recovery

Allowed:

- Forward-only repair migration.
- Restore from a tested logical dump on a disposable copy.
- Run prior compatible application images against additive-compatible schemas.

Forbidden:

- Dropping production-like W1 volumes to claim success.
- Deleting Kafka topics to hide bad records.
- Re-baselining unknown non-empty schemas.
- Editing retained evidence manifests after the run.

## Kafka And Schema Registry Recovery

Allowed:

- Replay authorized DLT records through the protected replay procedure.
- Register governed compatible schemas.
- Restart consumers after broker recovery.

Forbidden:

- Switching to local-noop adapters for release proof.
- Bypassing Schema Registry compatibility checks.
- Acknowledging records before transaction commit.

## Verification After Rollback

Run:

```powershell
docker compose config --quiet
node scripts/w1-live-acceptance.mjs --preflight
node scripts/replay-restart-proof.mjs --dry-run --evidence artifacts/w1-01-live/replay-restart/evidence.json
```

If the rollback host can run the full stack, run:

```powershell
node scripts/w1-live-acceptance.mjs --run-id <new-id>
```

Rollback is complete only when the stack is healthy, retained evidence is intact, and the next release-proof attempt uses a new run ID.
