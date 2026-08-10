# Deployment Strategy - W1-01

## Upstream Inputs

Strategy decisions are derived from `ci-config`, `quality-gates`, unit `deployment-architecture`, and unit `cicd-pipeline` artifacts. Those artifacts consistently define the W1 target as the local Docker Compose runtime with retained PostgreSQL volumes, real Kafka, Schema Registry, services, Booking UI, and nginx.

## Strategy Choice

| Decision | Value |
|---|---|
| Strategy | Local Compose acceptance promotion |
| Release model | Continuous delivery with manual proof and approval |
| Production deployment | Deferred to later Operation work |
| Live release gate | Full `w1-live-acceptance` run must pass |
| Rollout style | Single local stack proof, not blue/green/canary/rolling production |

## Environment Promotion Matrix

| Environment | Purpose | Gate |
|---|---|---|
| Developer host | deterministic code/test feedback | Maven, Node, Booking frontend, Compose config, detectors |
| CI self-hosted runner | merge protection | W1 quality-gates workflow plus dry-run acceptance |
| Local release-proof host | canonical W1 runtime proof | full Compose startup and quote-to-cash live acceptance |
| Staging | later operation concern | not configured by W1 |
| Production | later operation concern with manual approval | not configured by W1 |

## Traffic And User Path

The only user entry point for W1 live proof is nginx on host port `8088`, with Booking app direct checks on `3001` allowed for diagnostics. Browsers do not call internal services, Kafka, Schema Registry, Charge, CMM, or Reference Data directly.

## Data And Messaging Rules

- PostgreSQL uses host port `55432`; service containers use `postgres:5432`.
- Service-owned databases remain isolated.
- Kafka adapters must be real for live proof; local-noop cannot satisfy release acceptance.
- PostgreSQL volumes and Kafka topics are not destructively reset to manufacture success.
- Contract-compatible additive migrations are allowed; destructive schema changes are not a release maneuver.

## Approval Workflow

1. CI gates pass.
2. Full live acceptance run passes on a prepared Docker host.
3. Audit detector LEADS are reviewed.
4. ERP fidelity detector LEADS are reviewed.
5. Human release owner approves the evidence.
6. Evidence is committed/tagged according to the release evidence procedure.

## Abort Conditions

- Docker image pull/proxy failure.
- Compose service health failure.
- `MESSAGING_REQUIRE_REAL=true` guard rejects startup.
- Contract, seed, replay/restart, quality, or detector gate fails.
- Booking UI cannot drive or observe the quote-to-cash path.
- Evidence manifest records `BLOCKED` or `FAILED` instead of `PASS`.
