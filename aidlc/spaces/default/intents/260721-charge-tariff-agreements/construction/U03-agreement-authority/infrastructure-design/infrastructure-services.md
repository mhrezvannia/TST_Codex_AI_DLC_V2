# Infrastructure Services - U03 Agreement Authority

## Service registry

| Existing service | U03 responsibility | Exclusion |
| --- | --- | --- |
| Charge Spring service | W2 Agreement API/domain/repositories/relay | no new service or parallel mutable model |
| Charge Next/BFF | Agreement pages and fixed vendor-media policies | U02 owns routing/session/assertion |
| Charge PostgreSQL | Agreement/version/link/activity/outbox authority | no cross-database read or U03 migration authoring |
| Identity | exact seven `charge-agreements` actions | no cached/default allow |
| Reference Data | five exact active stable-ID checks | no copied master authority |
| Rate repository | three exact U01 Approved RateVersions | no Rate mutation |
| Kafka/Schema Registry | compatible lifecycle publication | existing topic/subjects only |
| Prometheus/Grafana/OTel/Jaeger | safe local evidence | no new monitoring service |

## Database and repository services

U03 consumes U01's V3 header discriminator, nullable legacy commodity seam,
AgreementVersion, three-category links, append-only activity, indexes, and
outbox columns. W2 commands require `authority_model=W2_VERSIONED`; legacy
adapters require `LEGACY`. No stale W2 compatibility projection enters legacy
search or active lookup.

List selects <=100 stable/version identities then bulk-loads selected versions,
links, activity/labels. Detail uses a fixed number of set queries. Approval uses
the canonical length-prefixed match key, transaction advisory lock, row reload,
post-lock Reference/Rate validation, inclusive-overlap query, and one atomic
version/activity/outbox commit. Successor locks the stable header. No N+1,
cache, replica, shard, or new datasource exists.

## Authorization, Reference, and assertion services

The service authorizes exact actions `read`, `create`, `update`, `approve`,
`create-successor`, `suspend`, and `expire` after exact assertion verification.
U02 capability checks never replace this decision.

Identity and Reference Data reuse U01's bounded fail-closed adapters. Commands
perform one authorization and at most five reference checks; supplied links are
loaded in one RateVersion set query. Timeout/malformed/unavailable dependencies
return typed 503 with no residue; invalid/inactive/mismatched business data is
422.

The assertion verifier, golden vectors, key configuration, nonce cache, and
restart limitation are exactly shared with U02 deployment architecture. There
is no JWT minting/exchange, browser credential, or alternate header grammar.

## Messaging and relay service

The transactional outbox records immutable event ID, type, key, payload,
schema/model, correlation and dedupe identity in the commercial transaction.
U03 event IDs are `w2agr-<uuid>` and types are exactly created, updated,
approved, suspended, or expired.

The bounded coordinator owns the total classifier
`prefix OR (five-type AND W2 authority)` while the old relay owns its exact
complement. Only prefix + five-type + W2 + supported schema publishes; every
other U03-owned row is PERMANENT integrity quarantine. State transitions,
worker/claim fencing, batch/concurrency/lease/ack bounds, retry schedules, and
eight-attempt exhaustion follow `deployment-architecture.md`. Retriable
transport/timeout/429/5xx failures become RETRYABLE. Serialization/schema/model,
auth, topic/config, and payload-size failures become PERMANENT. Classification
uses typed status/exception, never message text. Terminal rows remain retained
with unchanged bytes and safe codes; no auto reset/delete/requeue exists.

Normal 100-row recovery closes at
`61+5+6+20+6+5=103 s`; lease recovery closes at
`30+5+6+20+6+5=72 s`, both <=120 s. Claim/mark terms include <=2 seconds pool
acquisition plus <=1 second transaction per operation. Ack-before-mark may republish only the
identical at-least-once event/dedupe identity.

## Secrets, discovery, and readiness

Compose DNS supplies fixed service endpoints. Runtime injection supplies
distinct datasource, Reference, assertion, Kafka/registry credentials. Secrets
never enter browser bundles, event payloads, logs, traces, metrics, images, or
evidence.

Readiness validates database/Flyway, repository/outbox wiring, assertion
configuration, and fail-closed dependency clients without making live remote
calls on every probe. Relay health/backlog is separate degraded evidence so a
broker outage does not discard or roll back committed commercial authority.

## Upstream traceability

This map consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It preserves
their repository, transaction, dependency, media, relay, and ownership seams.
