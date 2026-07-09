# Security Requirements - local-runtime-foundation

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The local runtime must support secure-by-default development while keeping local-only escape hatches explicit and impossible to enable accidentally outside local mode.

## Local Security Defaults

| Area | Requirement |
|---|---|
| Environment file | `.env.example` contains no secrets and uses deterministic safe local placeholders. |
| Secret handling | Real local secrets are stored only in untracked `.env` or local tooling. |
| Keycloak | Realm/client bootstrap is deterministic and repeatable. |
| User auth | Keycloak-backed login path is available for auth-enabled profiles. |
| Service auth | JWT/RS256 validation settings are available to backend services. |
| Local bypass | Any bypass flag is explicit, local-only, visibly reported, and impossible to enable accidentally in non-local modes. |
| Kafka security | Kafka ACL design hooks exist where service identities are required. |

## Threat Requirements

| Threat | Control |
|---|---|
| Committed secrets | Secret-free `.env.example`, ignore local `.env`, and validate placeholders. |
| Accidental auth bypass | Bypass flags require local profile and are rejected for non-local modes. |
| Misrouted callback URLs | Runtime validation checks deterministic Keycloak and reverse-proxy URLs. |
| Cross-service database access | Separate logical database/user support and no cross-service SQL readiness claims. |
| Insecure service identity defaults | Service JWT and Kafka identity settings must be visible in local config. |

## Security Evidence

- `.env.example` validation output.
- Keycloak realm/client import result.
- Auth-enabled profile login smoke result.
- Service JWT configuration check.
- Local-only bypass rejection check for non-local modes.
- Port and callback URL validation report.

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines environment validation, profile startup, and health/readiness workflows. |
| `business-rules.md` | Defines security, environment, and readiness rules. |
| `requirements.md` | Supplies NFR-SEC-001 through NFR-SEC-004 and FR-RUN requirements. |
| `technology-stack.md` | Supplies Keycloak, PostgreSQL, Kafka, Schema Registry, nginx, and Docker Compose stack. |
| `nfr-requirements-questions.md` | Q3 sets secure local defaults. |
