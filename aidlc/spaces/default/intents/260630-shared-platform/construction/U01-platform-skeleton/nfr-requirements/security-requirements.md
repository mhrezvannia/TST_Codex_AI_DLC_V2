# Security Requirements - U01 Platform Skeleton

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines BFF route layout, service skeletons, local runtime composition, error envelope, correlation id, logging, health, and Vault-path placeholders. `business-rules.md` prohibits browser-to-service calls, public-cloud dependencies, prohibited frontend libraries, non-Yarn lockfiles, and downstream runtime stubs. `requirements.md` fixes NFR-006 through NFR-010, NFR-012, NFR-014, NFR-015, constraints C-002 through C-006, and Keycloak/Vault/on-prem assumptions.

## Authentication and Authorization Baseline

- Keycloak 24 is the authentication provider; U01 must not create custom authentication stores.
- Browser-facing backend access must go through BFF route handlers.
- Frontend apps must not call backend services directly from browser code.
- `identity-service` must be present as the future authorization owner, but U01 must not implement the final role/permission matrix.
- Protected paths must reserve correlation id and standard error-envelope support for fail-closed behavior in later units.

## Dependency and Boundary Controls

| Boundary | Security requirement |
|---|---|
| Backend `domain-core` | No Spring, JPA, Kafka, Jackson, Lombok, frontend packages, or adapter dependencies. |
| Backend adapters | Depend inward on `application-service`; adapters must not depend on each other. |
| Published-language | Must not depend on service internals. |
| Frontend apps | Separate `apps/auth` and `apps/reference-data`; no `pages/` pattern; BFF routes own service calls. |
| Runtime descriptors | No AWS/public-cloud or Kubernetes assumptions; no literal staging/production secrets. |

## Data Protection Requirements

- Local development secrets may be placeholders only.
- Staging and production descriptors must reference Vault paths or future approved secret locations.
- Party/Customer and authorization data are Confidential or Restricted when they contain PII, commercial sensitivity, or access-control sensitivity.
- U01 must reserve TLS-ready routing/configuration points for Nginx and internal HTTP/event infrastructure, even if local development uses relaxed settings.
- PostgreSQL, Kafka persistence, and backups must be compatible with encryption-at-rest requirements in later environment stages.

## Logging and Audit Baseline

- Structured logs must include timestamp, service, level, message, and correlationId.
- Error envelopes must include code, message, correlation id, timestamp, and optional details.
- Administrative actions, role changes, failed authorization attempts, and sensitive reads are not implemented by U01, but skeleton conventions must allow later units to emit structured access logs and immutable audit records.
- Logs must not include tokens, raw secrets, or restricted payload values.

## Supply Chain and Technology Guardrails

- Use the mandated stack from `requirements.md`; no technology waiver is approved.
- Use Yarn only for frontend dependency management; npm and pnpm lockfiles are prohibited.
- Prohibited frontend dependencies include Redux Toolkit, SWR, CSS Modules, Styled Components, Emotion, jQuery, and Moment.js.
- CI script names must be stable so U08 can attach formatting, linting, compile/type, unit, integration, contract, schema, and frontend checks.

## Threat Considerations

| Threat | U01 mitigation |
|---|---|
| Browser bypasses BFF and calls service directly | BFF-only route structure and rule prohibiting direct browser-to-service calls. |
| Secret leakage in repo | Vault references for non-local stages and no literal staging/production secrets. |
| Framework leakage into domain core | Hexagonal module dependency rules and validation gates. |
| Unauthorized downstream coupling | Contract folders allowed; runtime stubs/services for downstream modules prohibited. |
| Inconsistent operational tracing | Correlation id and structured log conventions fixed in skeleton. |

## Non-Goals

- U01 does not implement final authorization policies, role assignment, or audit query behavior.
- U01 does not perform a full STRIDE model for each later feature flow.
- U01 does not create production IAM or cloud security controls because the MVP target is on-prem and public cloud is out of scope.

