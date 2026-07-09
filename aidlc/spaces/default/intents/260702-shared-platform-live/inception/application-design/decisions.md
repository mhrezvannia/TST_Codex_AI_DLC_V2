# Architecture Decisions - Shared Platform Local Functionality

## Context

These ADRs consume `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. They decide how Shared Platform becomes locally functional without expanding into Charge, Booking, Container Movement, finance integration, public cloud, or production deployment.

## ADR-001 - Use Next.js BFF Routes as Browser Integration Boundary

Status: Accepted

Context: The approved `architecture` states that browser traffic must go through Next.js BFF route handlers. Current `apps/reference-data` BFF routes already exist but return local static records and accepted drafts.

Decision: Browser code will call only `apps/auth` and `apps/reference-data` BFF routes. BFF routes will call `identity-service` and `reference-data-service` server-side, propagate correlation ids, map service errors, and return UI-shaped responses.

Consequences:

- Keeps service URLs, tokens, and backend details out of browser code.
- Provides one place to map 401/403/409/422/503 into user-visible states.
- Requires BFF service clients and route tests.

Alternatives Considered:

- Browser directly calls Java services: rejected because it violates `team-practices` and exposes service topology.
- Keep static arrays: rejected because it does not satisfy functional Shared Platform behavior.

Reversibility: Moderate. BFF route contracts should remain stable even if implementation clients change.

## ADR-002 - Preserve Existing Identity and Reference Data Bounded Contexts

Status: Accepted

Context: `component-inventory` shows separate identity-service and reference-data-service hexagonal modules. `requirements` assign authorization to identity-service and reference data lifecycle to reference-data-service.

Decision: Keep identity-service as owner of authorization policy, effective permissions, role assignment, and audit. Keep reference-data-service as owner of reference records, validation, history, outbox, and publication status.

Consequences:

- Avoids merging bounded contexts in the BFF.
- Requires clean HTTP/port integration between services.
- Allows downstream modules to depend on clear identity and reference-data contracts later.

Alternatives Considered:

- Put authorization entirely in UI: rejected because authorization must be enforceable server-side.
- Put reference-data authorization catalog into reference-data-service only: rejected because identity-service is the established owner.

Reversibility: Hard. Changing bounded context ownership later would affect contracts and persistence.

## ADR-003 - Add Durable Local Persistence Behind Existing Repository Ports

Status: Accepted

Context: Existing Java services use in-memory repositories. `requirements` require state to remain available after local restart unless explicitly reset.

Decision: Add PostgreSQL-backed adapters for identity role assignments/audit and reference records/history/outbox. Keep in-memory adapters for unit tests.

Consequences:

- Local runtime can prove persisted mutations, seed apply, and outbox status.
- Requires migrations or schema initialization for local profile.
- Tests must preserve domain-core purity and adapter isolation.

Alternatives Considered:

- Keep in-memory only: rejected because restart persistence and seed apply evidence would be false.
- Let BFF persist state: rejected because service ownership would be broken.

Reversibility: Moderate. Repository ports already isolate adapter implementation.

## ADR-004 - Use Transactional Outbox for Reference Data Events

Status: Accepted

Context: `architecture`, `requirements`, and current reference-data-service code already include outbox concepts and publication APIs.

Decision: Reference-data-service will enqueue outbox events in the same application flow as create/update/deactivate. A publisher path will register/check schemas, publish to Kafka, and update outbox status to pending, published, retrying, or failed.

Consequences:

- Mutations do not fail solely because Kafka is unavailable after state commit.
- UI can show publication state separately from mutation success.
- Requires outbox persistence and clear retry/failure status mapping.

Alternatives Considered:

- Synchronous downstream calls: rejected because downstream modules are out of scope and would couple mutation success to consumers.
- UI-driven events: rejected because browser must not own integration events.

Reversibility: Moderate. Event payload contracts will be sticky after downstream consumers start.

## ADR-005 - Seed Apply Runs Through Live APIs

Status: Accepted

Context: Current `scripts/seed-local.mjs` validates local JSON and produces summaries. `requirements` require apply mode through service/admin APIs.

Decision: Extend seed loader with apply mode that waits for health, validates the seed pack, applies local users/roles through Keycloak/admin or identity APIs, applies reference records through reference-data-service APIs, and writes created/updated/skipped/failed evidence.

Consequences:

- Seed evidence proves live services rather than JSON shape only.
- Idempotency must be based on natural keys and fingerprints.
- Partial failures need row-level reporting.

Alternatives Considered:

- Direct database seeding: rejected because it bypasses service validation and history/outbox behavior.
- Keep dry-run only: rejected because local platform remains not functional.

Reversibility: Easy. Apply implementation can evolve while seed pack shape remains stable.

## ADR-006 - Compose Local Runtime Must Be Buildable From This Repo

Status: Accepted

Context: `component-inventory` and `dependencies` identify Compose images such as `linercore/reference-data-service:local` without discovered Dockerfiles.

Decision: Add buildable Dockerfiles or a documented Compose dev profile for apps and services. The default local path must distinguish missing prerequisites from code/runtime failures.

Consequences:

- New contributors can reproduce local runtime without unknown local images.
- CI/self-hosted runners can exercise the same topology.
- Requires app/service build packaging work before full local run proof.

Alternatives Considered:

- Require prebuilt local images: rejected because it is not reproducible.
- Frontend-only local mode: rejected because Shared Platform needs backend and event proof.

Reversibility: Easy. Compose can support both image and dev-server profiles.

## ADR-007 - Guard Auth Bypass as Local-Only

Status: Accepted

Context: Auth bypass is useful while Keycloak is not fully wired, but `requirements` require it not to leak into non-local runtime.

Decision: Keep `AUTH_BYPASS=true` as a local-only switch with visible UI/session labeling and startup or test failure in non-local profiles.

Consequences:

- Enables local progress while preserving security posture.
- Requires profile/config checks and tests.
- UI must never silently hide bypass state.

Alternatives Considered:

- Remove bypass immediately: rejected because it slows local platform completion while Keycloak bootstrap is incomplete.
- Allow bypass everywhere: rejected as a security defect.

Reversibility: Easy. Bypass can be removed once Keycloak flow and seeded local users are fully stable.

## ADR-008 - Keep Public Cloud Out of This Intent

Status: Accepted

Context: The AWS Platform support role is present, but `requirements` and `team-practices` state local/on-prem Compose and self-hosted runners for this intent.

Decision: Do not introduce AWS managed services, IAM, CDK, RDS, or managed Kafka in this Shared Platform local-functionality intent. Infrastructure design later should focus on Compose, local profiles, self-hosted runner requirements, and observability descriptors.

Consequences:

- Reduces scope and avoids cloud dependency.
- Keeps production deployment as a later manually approved effort.
- AWS mapping remains advisory only for future portability, not implementation now.

Alternatives Considered:

- Replace backing services with AWS managed services: rejected as out of scope and contrary to local/on-prem constraints.

Reversibility: Moderate. The service boundaries and contracts remain portable enough for later cloud deployment planning.

## Review

Verdict: READY

Inline fallback review finds the ADRs aligned with `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. The decisions are scoped, reversible where possible, and define the architecture needed before unit generation and construction.

