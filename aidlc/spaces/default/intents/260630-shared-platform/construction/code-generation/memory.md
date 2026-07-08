# Code Generation Memory

## Interpretations
- 2026-07-01T13:25:00Z - U01 code generation is a greenfield platform skeleton bootstrap: create root workspace metadata, service/app/package folders, baseline tests, contracts layout, and local runtime descriptors without implementing later-unit domain behavior.
- 2026-07-01T15:05:00Z - U02 code generation should build on the U01 `identity-service` skeleton by implementing authorization domain/application behavior, safe adapter boundaries, OpenAPI placeholders, and tests without adding authentication/password storage or downstream module policy runtime.
- 2026-07-01T15:35:00Z - U03 code generation should build on the U01 `reference-data-service` skeleton by implementing canonical reference domain/API behavior for the nine MVP sets while leaving Kafka publication, frontend screens, final seed data, and downstream module runtime out of scope.
- 2026-07-01T16:05:00Z - U05 code generation should expand `apps/auth` and `@erp/auth` with server-side OIDC/session placeholders, safe session views, access-denied/request-access UX, and tests while keeping tokens and secrets out of browser-visible code.
- 2026-07-01T16:35:00Z - U04 code generation should extend `reference-data-service` with outbox/event publication seams, typed Avro contract placeholders, status views, and tests while leaving downstream consumers and frontend status UI out of scope.
- 2026-07-02T03:59:22Z - U09 code generation should provide deterministic local seed validation and dry-run summaries first, leaving service write-through seeding as a later integration step once local service/admin APIs are complete and runnable.
- 2026-07-02T04:09:12Z - U06 code generation should turn `apps/reference-data` into an operational read-only-first workspace with BFF placeholders and validation helpers while deferring live mutation integration until service authorization and React Hook Form installation are available.
- 2026-07-02T04:16:53Z - U07 code generation should publish reproducible contract catalog evidence and read-only UI summaries while deferring OpenAPI diff and Schema Registry compatibility enforcement to U08 gates.
- 2026-07-02T04:25:29Z - U08 code generation should centralize required quality gates in a deterministic Node runner so local and CI evidence share gate ids, scopes, commands, required status, and aggregate failure behavior.
- 2026-07-02T04:30:48Z - U10 code generation should provide static, safe observability descriptors and smoke validation first, with live telemetry ingestion verification deferred to a host running the Compose observability profile.

## Deviations
- 2026-07-01T14:35:00Z - U01 subagent execution degraded to local conductor implementation because the required aidlc-developer-agent model was unavailable to this Codex account.
- 2026-07-01T14:45:00Z - U01 backend Maven tests could not run locally because Maven is not installed; Maven POMs and tests were generated and the limitation is recorded in the unit summary.
- 2026-07-01T14:50:00Z - U01 root Turbo commands failed with local spawn EPERM, so direct TypeScript, Vitest, ESLint, and Next build commands were used for verification.
- 2026-07-01T15:25:00Z - U02 Java compile/tests could not run because Java, javac, and Maven are unavailable in this shell; source-level dependency scans and executable JS checks were used, and the limitation is recorded in the U02 summary.
- 2026-07-01T15:55:00Z - U03 Java compile/tests could not run because Java, javac, and Maven remain unavailable; source-level dependency scans and executable JS checks were used, and the limitation is recorded in the U03 summary.
- 2026-07-01T16:25:00Z - U05 uses local OIDC/session placeholders for code exchange and identity-service permission lookup while preserving the server-only BFF boundary and safe browser session projection.
- 2026-07-01T19:08:15Z - U04 subagent execution degraded to local conductor implementation because the required aidlc-developer-agent model openai.gpt-5.5 is unavailable to this Codex account.
- 2026-07-01T19:17:30Z - U04 architecture reviewer subagent execution degraded to inline review because the required aidlc-architecture-reviewer-agent model openai.gpt-5.4 is unavailable to this Codex account.
- 2026-07-02T03:59:22Z - U09 subagent execution degraded to local conductor implementation because the required aidlc-developer-agent model openai.gpt-5.5 is unavailable to this Codex account.
- 2026-07-02T04:09:12Z - U06 subagent execution degraded to local conductor implementation because the required aidlc-developer-agent model openai.gpt-5.5 is unavailable to this Codex account.
- 2026-07-02T04:16:53Z - U07 subagent execution degraded to local conductor implementation because the required aidlc-developer-agent model openai.gpt-5.5 is unavailable to this Codex account.
- 2026-07-02T04:25:29Z - U08 subagent execution degraded to local conductor implementation because the required aidlc-developer-agent model openai.gpt-5.5 is unavailable to this Codex account.
- 2026-07-02T04:30:48Z - U10 subagent execution degraded to local conductor implementation because the required aidlc-developer-agent model openai.gpt-5.5 is unavailable to this Codex account.

## Tradeoffs
- 2026-07-01T14:40:00Z - U01 keeps service/app behavior intentionally thin: compile-safe placeholders, health shells, dependency tests, and runtime descriptors are enough for the skeleton while domain behavior remains assigned to later units.
- 2026-07-01T15:20:00Z - U02 uses in-memory adapter placeholders behind ports for assignment and audit persistence so the authorization domain/application flow is testable without prematurely committing final JPA schema details.
- 2026-07-01T15:50:00Z - U03 uses in-memory reference and change-history adapters behind ports to keep canonical domain/API behavior testable while deferring durable PostgreSQL mapping details to an environment with Java/Maven tooling.
- 2026-07-01T16:20:00Z - U05 implements real route/page/session seams but keeps external Keycloak and identity-service integration as placeholders to avoid committing secrets or environment-specific endpoints into source.

## Open questions
