# Discovered Rules — W3-04 Booking Request Completeness

Derived from `code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md`, then hardened by the W3-04 practice interview.

## Mandated

- ALWAYS deliver W3-04 on its short-lived intent branch, synchronize with `integ/main-reconciled`, and use the program backlog merge protocol.
- ALWAYS run PB-01 first and obtain its gate before dependent commercial, migration, pricing, or confirmation slices proceed.
- ALWAYS write tests alongside W3-04 code and evidence at least 80% line coverage of changed executable production lines in every touched module.
- ALWAYS require W3-specific domain, migration/restart, pricing, Avro/consumer, browser/accessibility/responsive, isolated Compose, `aidlc-audit`, and `erp-fidelity-audit` evidence before release acceptance.
- ALWAYS classify unavailable required live, security, contract, or audit evidence as BLOCKED rather than PASS.
- ALWAYS preserve the Booking/CMM domain → application → adapter → container dependency direction and service-owned persistence.
- ALWAYS keep state changes, idempotency, audit, and resulting outbox effects within the established application transaction boundary.
- ALWAYS evolve Booking persistence additively with a versioned snapshot, ordered migration, deterministic backfill, restart/idempotency evidence, and no invented legacy values.
- ALWAYS preserve typed operational outcomes or translated correlated exceptions at service boundaries without leaking raw backend errors.
- ALWAYS use strict TypeScript, the central Booking BFF security/error path, shared workspace types, and `@erp/ui` in the one LinerCore shell.

## Forbidden

- NEVER infer a squash/rebase/merge style, branch protection, reviewer count, or production release policy that is not evidenced or explicitly approved.
- NEVER implement W3-04 as disconnected database, backend, frontend, contract, or test-only horizontal releases.
- NEVER classify a skipped required live test, missing scanner/toolchain, or unavailable provider as successful evidence.
- NEVER reuse a prior intent’s coverage, browser, contract, Compose, security, or audit PASS as W3-04 freshness evidence.
- NEVER bypass service-owned data boundaries with shared database access or move lifecycle rules into controllers, BFF routes, or UI-only validation.
- NEVER fabricate commodity, trade-lane, voyage schedule, party, equipment quantity, or physical identifier defaults to satisfy completeness.
- NEVER add a module-local shell, palette, typography system, or shared-primitive fork within W3-04.
- NEVER claim staging, production, rollback, supply-chain provenance, or continuous deployment capability from static CI/Compose definitions alone.

