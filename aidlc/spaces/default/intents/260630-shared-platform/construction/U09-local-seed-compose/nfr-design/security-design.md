# Security Design - U09 Local Seed Compose

## Security Goals

U09 provides local-only seed and Compose support without introducing production data, real identities, public-cloud dependencies, or unsafe database shortcuts. It preserves the same service/API/BFF boundaries that the application uses outside local development.

## Seed Data Safety

All local seed users are fictional and clearly marked local-only. Seed packs must not contain real customer data, real employee data, production credentials, or copied production records. Party/Customer and authorization-related seed records are treated as Confidential or Restricted where sensitivity applies.

Seed pack review should reject hard-coded final trade-footprint assumptions where upstream requirements keep those values configurable.

## Secrets and Identity

Keycloak 24 remains the authentication provider. U09 does not create a custom password store. Local dev secrets are allowed only in local descriptors, and staging/production descriptors reference Vault or approved secret paths.

Default authenticated local users receive no administrative permission unless explicitly assigned a test role. Local admin users exist only for development and smoke checks.

## Runtime Boundaries

Docker Compose uses local/on-prem services only. AWS/public-cloud services, Kubernetes, and cloud-managed dependencies are prohibited for U09. Browser-facing routes go through Nginx and BFF route handlers.

Seed writes use approved service/admin paths where available. Early controlled adapter paths must enforce the same validation, audit, and outbox semantics as the service path.

## Logging and Diagnostics

Seed and smoke logs include pack id, seed version, target service, result, failure category, validation path, and correlation id. Logs must not print passwords, tokens, client secrets, production-like credentials, or real personal data.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
