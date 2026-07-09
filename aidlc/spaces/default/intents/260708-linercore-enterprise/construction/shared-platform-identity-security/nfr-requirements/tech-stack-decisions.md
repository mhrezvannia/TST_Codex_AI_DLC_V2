# Tech Stack Decisions - shared-platform-identity-security

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The approved posture is brownfield hardening: reuse the existing Identity Service and Keycloak foundation rather than replacing identity or moving enforcement to the frontend.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Identity provider | Keycloak 24.0 | Existing local provider and required Keycloak-backed auth path. |
| Identity service | Existing `identity-service` | Preserves valid MVP foundation and avoids unnecessary rewrite. |
| Backend runtime | Java 21, Spring Boot 3.3.7, Maven | Matches scanned backend stack and existing service pattern. |
| Persistence | PostgreSQL logical `identity` database/user | Supports durable roles, capabilities, subjects, and audit records. |
| Token validation | JWT/RS256 | Required for service-to-service validation and Keycloak integration. |
| Frontend auth integration | Existing shared auth packages where valid | Supports Enterprise Web shell context and route/action permissions. |
| Event security hooks | Kafka ACL design hooks | Supports protected producer/consumer identities for event seams. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Replacing Keycloak | Not justified; current requirement is enterprise hardening. |
| Frontend-only authorization | Rejected because backend enforcement remains mandatory. |
| In-memory identity | Insufficient for audit, roles, capabilities, and enterprise readiness. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines auth, authorization, audit, service-token, and Keycloak workflows. |
| `business-rules.md` | Defines security and boundary rules. |
| `requirements.md` | Supplies FR-SP-002, FR-SP-003, and NFR-SEC requirements. |
| `technology-stack.md` | Supplies Java/Spring, Maven, PostgreSQL, Keycloak, and frontend auth context. |
| `nfr-requirements-questions.md` | Q5 selects brownfield reuse and hardening posture. |
