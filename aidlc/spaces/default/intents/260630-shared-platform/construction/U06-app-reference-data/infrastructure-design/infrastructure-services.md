# Infrastructure Services - U06 Reference Data App

## Edge and BFF

Nginx routes browser traffic to `apps/reference-data`. BFF routes validate request shape, resolve authorization context, propagate correlation id, call backend APIs, and normalize error envelopes.

## Backend Dependencies

`reference-data-service` supplies provider/admin/status/history APIs. `identity-service` supplies permission/session context. Event status failures are non-blocking for record detail rendering.

## Shared Packages

The app uses `@erp/ui`, `@erp/api-core`, `@erp/auth`, `@erp/transformers`, and `@erp/shared-types`. Shared packages do not own domain data or authorization policy.

## Secrets

Browser code receives no service credentials, tokens, or database access. Non-local BFF credentials and telemetry credentials use Vault references.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
