# Infrastructure Design Memory

## Interpretations

- 2026-07-09T10:47:00Z - Treated `contract-platform-catalog` as generated-evidence infrastructure, not a first-release always-on service; NFR Design and Functional Design define repository validators, CI artifacts, local Schema Registry checks, and read-only health views as the deployment model.
- 2026-07-09T10:56:00Z - Treated `local-runtime-foundation` as local Compose infrastructure rather than production cloud provisioning; its readiness evidence proves developer/runtime convergence, not production availability.
- 2026-07-09T11:05:00Z - Treated `shared-platform-identity-security` as the shared backend enforcement foundation; Enterprise Web permission summaries are UI hints only and do not replace backend authorization.
- 2026-07-09T11:13:00Z - Treated `shared-platform-reference-events` as Reference Data-owned lifecycle and event infrastructure; consumers use APIs/events and never direct database joins.
- 2026-07-09T11:22:00Z - Treated `booking-lifecycle-domain` as Booking-owned state and orchestration infrastructure; Charge owns calculations and CMM owns movement status while Booking stores snapshots, exceptions, and lifecycle evidence.
- 2026-07-09T11:31:00Z - Treated `charge-agreement-pricing-domain` as Charge-owned commercial calculation infrastructure; Booking lifecycle and CMM movement status remain outside Charge boundaries.
- 2026-07-09T11:40:00Z - Treated `container-movement-domain` as CMM-owned movement fact and status projection infrastructure; Booking lifecycle, D&D relevance, and pricing remain outside CMM boundaries.
- 2026-07-09T11:48:00Z - Treated `booking-charge-pricing-integration` as an HTTP contract seam with Booking-owned orchestration/snapshots and Charge-owned calculation/provider audit.
- 2026-07-09T11:56:00Z - Treated `booking-confirmed-journey-integration` as outbox-backed Kafka integration rather than a synchronous CMM journey API or shared database trigger.
- 2026-07-09T12:04:00Z - Treated `enterprise-seed-migrations-devex` as evidence and developer-command infrastructure; seed fixtures support validation but do not replace real business implementation.
- 2026-07-09T12:12:00Z - Treated `movement-status-booking-integration` as CMM-owned status publication and Booking-owned lifecycle/D&D-trigger input handling; neither side takes the other's domain responsibility.
- 2026-07-09T12:20:00Z - Treated `dnd-pricing-integration` as Booking-owned D&D trigger/orchestration and Charge-owned D&D calculation; CMM supplies movement status evidence only.
- 2026-07-09T12:28:00Z - Treated `enterprise-web-shell-and-workflows` as presentation and workflow infrastructure only; backend services remain the authority for business rules and authorization enforcement.
- 2026-07-09T12:36:00Z - Treated `observability-quality-operation-readiness` as generated evidence and fail-closed quality gate infrastructure; read-only readiness views display evidence but cannot manually turn failures green.

## Deviations

- 2026-07-09T10:47:00Z - Skipped additional human infrastructure questions for `contract-platform-catalog`; the approved NFR and functional artifacts already resolve deployment, compute, storage, monitoring, CI/CD, secrets, and scaling posture.
- 2026-07-09T10:56:00Z - Skipped additional human infrastructure questions for `local-runtime-foundation`; the approved NFR and functional artifacts already resolve profile topology, secure local defaults, readiness semantics, and Windows-first execution posture.
- 2026-07-09T11:05:00Z - Skipped additional human infrastructure questions for `shared-platform-identity-security`; the approved NFR and functional artifacts already resolve Keycloak, JWT, capability, audit, local bypass, and service identity posture.
- 2026-07-09T11:13:00Z - Skipped additional human infrastructure questions for `shared-platform-reference-events`; the approved NFR and functional artifacts already resolve PostgreSQL outbox, Kafka, Schema Registry, validation APIs, audit, and health posture.
- 2026-07-09T11:22:00Z - Skipped additional human infrastructure questions for `booking-lifecycle-domain`; the approved NFR and functional artifacts already resolve Booking database ownership, outbox, idempotency, Charge/CMM seams, exceptions, and audit posture.
- 2026-07-09T11:31:00Z - Skipped additional human infrastructure questions for `charge-agreement-pricing-domain`; the approved NFR and functional artifacts already resolve Charge Service deployment, pricing database, idempotency, commercial audit, and manual fallback posture.
- 2026-07-09T11:40:00Z - Skipped additional human infrastructure questions for `container-movement-domain`; the approved NFR and functional artifacts already resolve CMM Service deployment, movement database, DCSA validation, dedupe, ordering, status projection, and event publication posture.
- 2026-07-09T11:48:00Z - Skipped additional human infrastructure questions for `booking-charge-pricing-integration`; the approved NFR and functional artifacts already resolve OpenAPI/Pact, service JWT, idempotency, timeout/retry/circuit, snapshot, and exception posture.
- 2026-07-09T11:56:00Z - Skipped additional human infrastructure questions for `booking-confirmed-journey-integration`; the approved NFR and functional artifacts already resolve booking.confirmed outbox, Kafka, Schema Registry, message-pact, CMM dedupe, and journey reconciliation posture.
- 2026-07-09T12:04:00Z - Skipped additional human infrastructure questions for `enterprise-seed-migrations-devex`; the approved NFR and functional artifacts already resolve database owners, service migrations, deterministic seed, reset scope, secret scanning, and command evidence.
- 2026-07-09T12:12:00Z - Skipped additional human infrastructure questions for `movement-status-booking-integration`; the approved NFR and functional artifacts already resolve containermovement.status publication, Kafka, Schema Registry, message-pact, dedupe, staleness, and lifecycle update evidence.
- 2026-07-09T12:20:00Z - Skipped additional human infrastructure questions for `dnd-pricing-integration`; the approved NFR and functional artifacts already resolve D&D trigger, request/result seam, idempotency, timeout/retry/circuit, manual fallback, snapshots, and Pact evidence.
- 2026-07-09T12:28:00Z - Skipped additional human infrastructure questions for `enterprise-web-shell-and-workflows`; the approved NFR and functional artifacts already resolve Next.js deployment, typed API/BFF boundaries, permissions, evidence panels, degraded states, and no-prototype-readiness posture.
- 2026-07-09T12:36:00Z - Skipped additional human infrastructure questions for `observability-quality-operation-readiness`; the approved NFR and functional artifacts already resolve evidence collection, quality gates, observability stack, read-only readiness views, and Operation handoff posture.

## Tradeoffs

- 2026-07-09T10:47:00Z - Deferred a central contract evidence database in favor of versioned repository contracts, generated metadata indexes, CI artifacts, and read-only health snapshots; this reduces first-release runtime and operations scope while preserving a future path to a registry service if generated evidence stops scaling.
- 2026-07-09T10:56:00Z - Kept observability and devtools as optional profiles rather than mandatory dependencies of `core` and `app`; this protects local startup time while still allowing `full` to prove the complete topology.
- 2026-07-09T11:05:00Z - Used versioned effective-permission caching with capability/role invalidation instead of uncached authorization for every UI guard; this meets latency targets while preserving revocation safety.
- 2026-07-09T11:13:00Z - Used transactional outbox rather than synchronous Kafka publication in the mutation path; this protects command latency and prevents Kafka outages from losing committed reference changes.
- 2026-07-09T11:22:00Z - Modeled Booking integration failures as typed pending or exception states rather than generic failures; this keeps user feedback bounded while preserving service ownership and evidence.
- 2026-07-09T11:31:00Z - Modeled Charge no-price, D&D conflict, and manual fallback as typed commercial states rather than generic errors; this preserves auditability and stable caller orchestration.
- 2026-07-09T11:40:00Z - Used materialized status snapshots over durable movement facts rather than recomputing status from full history on every query; this meets query targets while keeping facts recoverable.
- 2026-07-09T11:48:00Z - Used typed seam failure states instead of opaque HTTP errors; this gives Booking stable orchestration behavior while keeping Charge calculation ownership intact.
- 2026-07-09T11:56:00Z - Kept Booking confirmation-to-CMM as asynchronous choreography; this preserves service ownership and makes replay/deduplication evidence explicit.
- 2026-07-09T12:04:00Z - Centralized migration/seed orchestration while keeping migrations service-owned; this gives repeatable setup evidence without creating a shared domain schema.
- 2026-07-09T12:12:00Z - Used quarantine/stale handling for out-of-order status events rather than silent discard; this preserves operational evidence while preventing unsafe lifecycle updates.
- 2026-07-09T12:20:00Z - Modeled D&D no-rule/conflict/manual-required outcomes as typed manual states rather than generic errors; this keeps Booking orchestration stable and Charge audit explicit.
- 2026-07-09T12:28:00Z - Required real API/event-backed UI evidence rather than mock/prototype logic; this prevents frontend visuals from becoming false completion evidence.
- 2026-07-09T12:36:00Z - Deferred a central evidence database in favor of generated CI/local evidence and compact read models; this reduces first-release persistence scope while preserving evolution path.

## Open questions

- 2026-07-09T10:47:00Z - Code Generation and CI Pipeline must choose exact package names, command names, workflow filenames, validator packages, and generated artifact paths.
- 2026-07-09T10:56:00Z - Code Generation must choose exact Compose filenames, script names, port values, health endpoint paths, and Windows command wrappers for local runtime.
- 2026-07-09T11:05:00Z - Code Generation must choose exact identity table/index names, cache TTLs, Keycloak import files, service account names, and denied-path test fixtures.
- 2026-07-09T11:13:00Z - Code Generation must choose exact Reference Data indexes, topic names, schema subjects, outbox batch sizes, lease timings, and retry thresholds.
- 2026-07-09T11:22:00Z - Code Generation must choose exact Booking route paths, table/index names, topic names, schema subjects, retry/circuit settings, and exception status taxonomy.
- 2026-07-09T11:31:00Z - Code Generation must choose exact Charge table/index names, rule schemas, API routes, idempotency TTL, manual workflow states, and Pact fixtures.
- 2026-07-09T11:40:00Z - Code Generation must choose exact CMM topic names, schema subjects, movement/status table indexes, ordering thresholds, DCSA validation fields, and message-pact fixtures.
- 2026-07-09T11:48:00Z - Code Generation must choose exact pricing client package, route names, timeout values, circuit thresholds, Pact fixture paths, and snapshot schema.
- 2026-07-09T11:56:00Z - Code Generation must choose exact booking.confirmed topic names, schema subjects, partition keys, consumer group names, retry timings, and message-pact fixture paths.
- 2026-07-09T12:04:00Z - Code Generation must choose exact setup/migration/seed/reset command names, fixture paths, report locations, database user names, and repair guide format.
- 2026-07-09T12:12:00Z - Code Generation must choose exact containermovement.status topic names, schema subjects, partition keys, consumer group names, staleness thresholds, and quarantine states.
- 2026-07-09T12:20:00Z - Code Generation must choose exact D&D route names, trigger keys, timeout values, circuit thresholds, manual state names, and Pact fixture paths.
- 2026-07-09T12:28:00Z - Code Generation must choose exact Enterprise Web package path, route names, typed client package names, BFF handler boundaries, and accessibility test harness.
- 2026-07-09T12:36:00Z - Code Generation and CI Pipeline must choose exact evidence schema fields, CI artifact paths, dashboard routes, collector package names, and quality gate policy format.
