# Shared Infrastructure - U07 Live Release Acceptance

## Program Stack Under Test

U07 is the integration owner for all existing W1 shared resources: Compose network/profiles, PostgreSQL container with isolated databases/roles, Kafka/SR and canonical subjects/topics/DLTs, W0 messaging module, nginx/BFF entry, generic image builders, observability services, seeds, recovery tools, quality scripts, audit detectors, and evidence root. It does not transfer business ownership from Booking, Charge, Reference Data, or CMM.

The release harness controls lifecycle and reads evidence; it cannot update domain tables, forge UI success, replace real adapters, edit detector output, or relax service contracts. Shared credentials are separated among service, replay, read-only evidence, Docker operator, and external signing roles.

## Ownership Matrix

| Shared resource | Owner | U07 release assertion |
|---|---|---|
| Compose/network/ports/images | platform | exact pinned real topology and health |
| service databases/Flyway | each service | isolated ownership, guarded migration, retained volume |
| Kafka/SR/platform-messaging | platform + contract owners | canonical schemas, real metadata, retry/ack/DLT behavior |
| UI/nginx/BFF | Booking web | one user-visible real journey and browser boundary |
| observability/load/recovery | quality/platform | raw measurable thresholds and faults |
| evidence/attestation/Git tag | release harness + external signer | complete content-addressed verdict |

The external signing key is the evidence trust anchor; Git records finalized content and tag identity; read-only filesystem state is only an operational guard. A release cannot PASS when any shared owner lacks direct evidence.

## Source Coverage

Shared mapping applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U07 `business-logic-model.md`.
