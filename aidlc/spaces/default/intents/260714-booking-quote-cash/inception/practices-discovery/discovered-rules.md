# Discovered Rules - W1-01

## Mandated

ALWAYS base and merge W1-01 Construction Bolts on `integ/main-reconciled` with short-lived branches and squash commits.

ALWAYS make the first W1-01 Bolt prove the real bidirectional Kafka journey through a minimal Booking UI read path before accelerating later Bolts.

ALWAYS write tests alongside W1 code, enforce at least 80 percent line coverage, and require contract, serde, idempotency, restart, and live Compose evidence.

ALWAYS preserve service-owned databases, framework-free domain-core modules, and exact frozen contract field names across domain and wire representations.

ALWAYS use the shared `platform-messaging` publisher, schema registrar, scheduled relay, and noop safety rather than duplicating W0 infrastructure.

ALWAYS run the live W1 stack with PostgreSQL on a non-default host port and retain evidence under `artifacts/`.

## Forbidden

NEVER use synchronous Booking-to-CMM or CMM-to-Booking HTTP delivery as the normal path once the W1 Kafka consumers land.

NEVER claim W1 complete from unit tests, outbox rows, local-noop publication, or container startup without the observed broker-to-database-to-UI flow and both audits.

NEVER change a contributor module's contract surface without producer/consumer review and synchronized OpenAPI/AsyncAPI/Avro/example/provider evidence.

NEVER import W2-01 shell/auth, W2-02 implementation scope, D&D, amendments, or broader journey behavior into the W1 thin slice.

NEVER describe the current CI as security-complete; no SAST, dependency vulnerability, secret scanning, or automated dependency-update workflow was found.

## Evidence Sources

Derived from `code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md`, plus the user-affirmed Practices Discovery answers.
