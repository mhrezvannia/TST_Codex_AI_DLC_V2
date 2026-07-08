<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z - chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-07-01T03:45:00Z - Per-unit Functional Design should produce artifacts under each unit directory; whole-stage approval happens after all units are covered.
- 2026-07-01T04:05:00Z - U02 functional design uses approved inception decisions without another user question round; requirements and application design already fix Keycloak as authentication provider, identity-service as authorization owner, fail-closed decisions, MVP role set, audit, and OpenAPI boundaries.
- 2026-07-01T04:19:00Z - U03 functional design uses the Shared Platform Vision recommended MVP defaults for under-specified reference shapes; exact seed values remain open, but aggregate boundaries and invariants are sufficient for functional design.
- 2026-07-01T04:31:00Z - U05 functional design treats apps/auth as a BFF-backed frontend app, not an identity provider; Keycloak and identity-service remain authoritative for authentication and authorization.
- 2026-07-01T04:42:00Z - U04 functional design keeps Kafka publication inside reference-data-service messaging/outbox adapters; downstream modules remain contract-only consumers in this workflow.
- 2026-07-01T08:20:14Z - U09 functional design treats unresolved exact seed values as configurable defaults, not blockers; requirements already mark final trade lanes and role-permission matrix as open dependencies, so the design fixes seed-pack behavior, idempotency, and local Compose orchestration while leaving business-final values replaceable.
- 2026-07-01T08:23:27Z - U06 functional design treats apps/reference-data as a BFF-governed admin workspace; the approved architecture and mockups already fix BFF-only backend access, RHF/Zod validation, read-only permission behavior, event status display, and mobile read-only default, so no new user question round was needed.
- 2026-07-01T08:26:38Z - U07 functional design keeps downstream modules contract-only; OpenAPI, Avro, message-pact/provider fixtures, examples, and compatibility status are enough for Shared Platform contract readiness without creating Charge, Booking, or Container Movement runtime stubs.
- 2026-07-01T08:31:42Z - U08 functional design treats quality gates as merge-blocking CI behavior rather than runtime feature logic; team practices and stories already fix self-hosted GitHub Actions, Java/Maven, Yarn/Turborepo, 85 percent backend line coverage, and first-class contract/schema compatibility checks.
- 2026-07-01T08:41:46Z - U10 functional design treats observability as cross-cutting runtime and deployment readiness behavior, not a custom dashboard product; requirements already fix correlation propagation, JSON logs, OpenTelemetry metrics/traces, ELK/Prometheus/Grafana/Jaeger compatibility, health/smoke checks, and on-prem-only deployment descriptors.

## Deviations
<!-- example: 2026-05-29T10:14:32Z - skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z - picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-07-01T08:43:00Z - Architecture reviewer fallback completed inline because no reviewer subagent tool is exposed. Review found the ten-unit functional design coherent for implementation: each unit has the required five artifacts, cross-unit boundaries keep identity, reference data, outbox, frontend, contracts, CI, seed, and observability ownership separated, and the design preserves the no-downstream-runtime and on-prem-only constraints. Residual risk is deferred to code-generation validation because linter/type-check sensors are not applicable to markdown-only design artifacts.

## Open questions
<!-- example: 2026-05-29T10:14:32Z - confirm the retention window with compliance before the next stage hardens the schema -->
