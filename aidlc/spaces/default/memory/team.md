# Team-Level Rules

> This team's affirmed practices and corrections. Overrides aidlc-org.md.
> Populated by practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working
The LinerCore program uses gated AI-DLC intents and short-lived intent/Bolt branches. W1-01 Construction Bolts base from and merge to `integ/main-reconciled`, use squash commits, and merge only after their quality evidence and the intent's live exit gate are green; Booking drives the vertical intent while Charge and CMM changes remain contract-governed contributor work.

## Walking Skeleton
The first W1-01 Construction Bolt proves the highest-risk thin path: canonical `booking.confirmed` publication, real CMM Kafka consumption and journey creation, `containermovement.status` return, Booking projection, and a minimal Booking UI detail read. It is gated before the remaining Bolts and does not expand into D&D, amendments, global shell/auth, or broader CMM scope.

## Testing Posture
Tests are written alongside code with an 80 percent line-coverage floor for W1-01. Numeric coverage is necessary but insufficient: exact contract/serde tests, provider-consumer checks, duplicate and stale-redelivery tests, transactional idempotency tests, service-restart persistence, and a live Compose Kafka round trip are mandatory.

## Deployment
The canonical W1 delivery environment is the local Docker Compose stack with PostgreSQL exposed on a non-default host port (55432 by default), plus Kafka, Schema Registry, services, UI, and nginx. CI blocks merges on the repository quality gates; completion additionally requires live evidence and both intent audits, while staging/production deployment remains later operation work with manual production approval.

## Code Style
Java follows the existing domain/application/adapter module boundaries, keeps `domain-core` framework-free, uses immutable records and explicit validation, and maps exceptions at HTTP boundaries. TypeScript stays strict and uses shared `@erp/*` packages; W1 domain, Avro, AsyncAPI, examples, and adapters use the frozen contract field names exactly, with Graphify-first discovery followed by source verification when its freshness marker is stale.

## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->
