# Shared Infrastructure - U06 Reference Data App

## Shared Dependencies

U06 depends on Nginx, `reference-data-service`, `identity-service`, shared frontend packages, Vault references, and the observability stack.

## Access Boundaries

The app consumes APIs only through BFF handlers. It does not store canonical data, read databases, implement publisher recovery, own aggregate rules, or implement downstream module screens.

## Cross-Unit Contracts

U03 supplies provider/admin APIs. U04 supplies status views. U02 supplies permissions. U05 supplies auth/session entry behavior. U07 supplies display-only contract views. U08 gates frontend quality. U10 consumes telemetry.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
