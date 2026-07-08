# NFR Design Memory

## Interpretations
<!-- example: 2026-05-29T10:14:32Z - chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-07-01T09:58:00Z - U01 NFR design treats the skeleton as pattern scaffolding: it defines service/app boundaries, health/smoke hooks, dependency rules, local Compose profiles, and convention components so later units can implement measurable performance, security, scalability, and reliability behavior without changing the stack baseline.
- 2026-07-01T10:12:00Z - U02 NFR design treats identity-service as a central authorization control with strict failure isolation: cache only provider metadata and versioned permission projections safely, fail closed on dependency uncertainty, isolate audit queries from decision paths, and keep Keycloak behind an adapter boundary.
- 2026-07-01T10:25:00Z - U03 NFR design keeps reference-data-service as one canonical bounded context: provider reads are bounded, indexed, and deterministic; admin writes authorize and validate before persistence; state, audit, and domain facts are committed together; and U04 owns publication recovery beyond the domain-fact handoff.
- 2026-07-01T10:35:00Z - U05 NFR design treats apps/auth as a lightweight auth entrypoint and BFF: OIDC, token exchange, session creation, and identity-service calls stay server-side; route protection remains a UX/session guard; errors are safe and correlation-linked; and browser code never receives tokens or backend-service shortcuts.
- 2026-07-01T10:45:00Z - U04 NFR design centers reliability on the transactional outbox contract: committed U03 changes create durable facts, workers claim bounded batches with row-level concurrency protection, publication is at-least-once with stable event ids, and status/telemetry make freshness, retries, permanent failures, and recovery-required cases visible.
- 2026-07-01T10:55:00Z - U09 NFR design treats Compose and seed loading as deterministic local/CI support: bounded dependency waits, schema validation before writes, idempotent versioned seed packs, service/API smoke checks, fictional local-only identities, and optional observability separate from the required core profile.
- 2026-07-01T11:05:00Z - U06 NFR design keeps apps/reference-data as a BFF-governed admin workspace: browser code never calls backend services directly, list/detail paths stay paginated and state-preserving, protected mutations fail closed, event status/history loads non-blockingly, and UI controls remain aids rather than authority.
- 2026-07-01T11:15:00Z - U07 NFR design treats contracts as versioned evidence, not runtime scaffolding: OpenAPI, Avro, examples, fixtures, compatibility findings, and freeze metadata are artifact-controlled; read-only catalog views expose status; unknown compatibility blocks freeze; and downstream stubs/database contracts remain out of scope.
- 2026-07-01T11:25:00Z - U08 NFR design makes quality gates path-scoped but merge-blocking: self-hosted GitHub Actions classify changes, run required backend/frontend/contract/schema/seed/smoke gates, enforce per-service backend coverage, reject non-deterministic skips, and emit explicit evidence for audit and reruns.
- 2026-07-01T11:35:00Z - U10 NFR design standardizes on-prem operability signals across services, BFF apps, outbox publishing, Compose/Nginx, and readiness: correlation id links UI, logs, traces, audit, outbox, and events; metrics use bounded labels; health/smoke gates expose deployment readiness; and secrets/status surfaces remain safe.

## Deviations
<!-- example: 2026-05-29T10:14:32Z - skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z - picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z - confirm the retention window with compliance before the next stage hardens the schema -->
