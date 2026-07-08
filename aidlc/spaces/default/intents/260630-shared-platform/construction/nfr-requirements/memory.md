# NFR Requirements Memory

## Interpretations
<!-- example: 2026-05-29T10:14:32Z - chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-07-01T08:52:00Z - U01 NFR requirements treat the platform skeleton as an enabling baseline, so quantified runtime targets are captured as validation hooks and conventions while detailed service/domain load behavior remains with later units that implement the actual APIs, outbox, and frontend flows.
- 2026-07-01T08:57:00Z - U02 NFR requirements emphasize fail-closed authorization, audit integrity, Keycloak adapter resilience, deterministic permission evaluation, and safe session summaries because identity-service is the central authorization control, while sign-in UI and reference-data screen behavior remain in U05/U06.
- 2026-07-01T09:04:00Z - U03 NFR requirements treat p95 read performance, bounded search/filtering, data classification, immutable change history, and consistency between committed reference state and U04 domain change facts as the core quality attributes for canonical reference ownership.
- 2026-07-01T09:10:00Z - U05 NFR requirements focus on BFF-held OIDC/session safety, no browser token exposure, accessible auth states, safe request-access capture, and resilient sign-out/session behavior because apps/auth is a frontend entrypoint rather than an identity provider.
- 2026-07-01T09:15:00Z - U04 NFR requirements emphasize atomic outbox persistence, p95 event freshness measurement, at-least-once semantics, retry/recovery visibility, Avro compatibility, and bounded publisher claiming because reference-change publication must never fail silently.
- 2026-07-01T09:21:00Z - U09 NFR requirements treat deterministic local reproducibility as the main quality attribute: seed packs must be idempotent, safe, local-only, service/API-driven where possible, and configurable for unresolved trade lanes and role-permission matrix details.
- 2026-07-01T09:28:00Z - U06 NFR requirements treat accessibility, BFF-only access, resilient form/error handling, read-only permission states, and non-blocking event status as the core frontend qualities for the reference-data workspace.
- 2026-07-01T09:34:00Z - U07 NFR requirements treat contract evidence quality as the main NFR: versioned metadata, validation, compatibility status, examples, fixtures, accessible read-only views, and freeze reliability without creating downstream runtime scope.
- 2026-07-01T09:40:00Z - U08 NFR requirements treat CI gate reliability, runner/toolchain control, path-scoped scalability, merge-blocking evidence, and auditable failure records as the quality attributes because U08 prevents regressions rather than implementing product behavior.
- 2026-07-01T09:46:00Z - U10 NFR requirements treat observability itself as a measurable platform quality: correlation continuity, safe JSON logs, OpenTelemetry metrics/traces, freshness/lag signals, health/smoke readiness, and on-prem deployment descriptors.

## Deviations
<!-- example: 2026-05-29T10:14:32Z - skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z - picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-07-01T09:49:00Z - Architecture reviewer fallback completed inline because no reviewer subagent tool is exposed. Review found the NFR set coherent across all ten units: quantified targets are attached to the units that can measure them, security boundaries stay aligned with BFF/service ownership, contract/schema gates remain separate from contract definition, and observability/deployment readiness stays on the approved on-prem stack. Residual validation moves to code-generation/build stages where linter/type-check sensors can inspect actual code.

## Open questions
<!-- example: 2026-05-29T10:14:32Z - confirm the retention window with compliance before the next stage hardens the schema -->
