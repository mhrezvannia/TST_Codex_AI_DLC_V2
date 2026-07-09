# Security Design - local-runtime-foundation

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The local runtime must be secure by default while allowing explicit local-only developer shortcuts that cannot be enabled accidentally outside local mode.

## Secure Defaults

| Area | Design |
|---|---|
| Environment files | `.env.example` contains deterministic safe placeholders and no real secrets; local `.env` stays untracked. |
| Secret handling | Setup validates placeholder shape and rejects committed secret-like values in example files. |
| Keycloak | Realm, clients, redirect URIs, test users, roles, and capabilities bootstrap deterministically. |
| User auth | Auth-enabled profiles expose Keycloak login and callback paths through deterministic local URLs. |
| Service auth | Backend services receive visible JWT/RS256 issuer, audience, JWKS, and service identity settings. |
| Local bypass | Any bypass flag must require local profile, print visibly in health output, and fail preflight for non-local modes. |
| Kafka identity | Kafka ACL and service identity hooks are represented even if local broker enforcement is relaxed for developer ergonomics. |

## Environment Validation Flow

```text
[.env.example] --> [Placeholder Validator] --> [Secret Scan]
        |                    |                       |
        v                    v                       v
[local .env] --------> [Profile Mode Check] --> [Runtime Config Report]
```

Text fallback: environment defaults and local overrides are validated for safe placeholders, secret leakage, profile mode, and runtime settings before profile readiness is claimed.

## Threat Controls

| Threat | Control |
|---|---|
| Committed secrets | Secret-free `.env.example`, ignored local `.env`, setup validation, and CI-compatible secret scanning. |
| Accidental auth bypass | Bypass rejected unless profile mode is local and the flag is explicitly set. |
| Misrouted callback URLs | Setup validates Keycloak realm/client URLs and reverse-proxy callback URLs. |
| Cross-service database access | Compose supports separate logical database and user names per service; health does not claim cross-service SQL readiness. |
| Insecure service identity defaults | JWT, issuer, JWKS, and service identity settings appear in config checks and health output. |
| Inconsistent local auth state | Keycloak import is deterministic and repeatable; import failure blocks auth-enabled readiness. |

## Security Evidence

| Evidence | Producer |
|---|---|
| `.env.example` validation output | Setup preflight. |
| Secret scan result | Setup or CI quality gate. |
| Keycloak realm/client import result | Profile startup and health command. |
| Auth-enabled profile login smoke result | Health or test hook. |
| Service JWT configuration check | Health command. |
| Local-only bypass rejection check | Setup and profile preflight. |
| Port and callback URL validation report | Setup preflight. |

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements secret-free defaults, deterministic Keycloak, user/service auth, local-only bypass, Kafka identity hooks, and validation evidence. |
| `performance-requirements.md` | Keeps setup and health checks bounded while still reporting security blockers. |
| `scalability-requirements.md` | Scales secure config across identity, reference data, charge, booking, CMM, Enterprise Web, Kafka, and proxy routes. |
| `reliability-requirements.md` | Blocks auth-enabled readiness when Keycloak, callback URLs, JWT config, or bypass constraints fail. |
| `tech-stack-decisions.md` | Uses Docker Compose, Keycloak, PostgreSQL, Kafka, Schema Registry, nginx, and repository-local environment files. |
| `business-logic-model.md` | Implements environment validation, profile startup, health/readiness, and independent IDE mode security constraints. |
