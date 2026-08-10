# Security Requirements - U01 Booking Draft Skeleton

## Boundary Controls

- Browser traffic terminates at local Booking BFF routes; backend URL, service identity, and credentials remain server-side.
- Local-only user commands carry server-set `X-LinerCore-Actor-Id: local-user`; browser actor overrides are ignored. Nginx/BFF is the only externally exposed HTTP entrypoint.
- Service HTTP uses `X-LinerCore-Service-Id` plus target-specific `X-LinerCore-Local-Token` loaded from environment. Static local roles grant BFF `booking:read|create|validate|price|confirm`, Booking `reference:read|pricing:request`, and CMM `reference:read`; constant-time token comparison occurs before application ports.
- `AUTH_MODE=local` is valid only with Spring profile `local`. Any non-local profile fails startup; JWT/RS256, TLS, and production role mapping remain W2-01.
- Request fields, pagination, status filters, UUID/reference identifiers, ISO 6346 values, and free text are allow-listed and length bounded before domain/persistence use.
- JDBC uses parameterized statements; snapshots are serialized through typed Jackson DTOs, never string-built SQL/JSON.

## Data Protection and Audit

Persist only required customer reference identity, not copied customer PII. Logs/errors exclude snapshots, credentials, internal URLs, stack traces, and raw upstream bodies. Audit records actor, operation, result, booking ID, correlation ID, and safe reason in the same transaction as create effects. Local tokens come from Compose secrets/environment, never defaults/source/frontend bundles, and are redacted; plaintext local transport is confined to the isolated Compose bridge.

## Verification

Tests cover denied access, malformed/oversized input, idempotency-key conflict, SQL/HTML payload handling, redacted errors, and non-local missing-identity startup. Dependency and secret/static scans remain blocking when configured by the quality pipeline.

## Source Coverage

Controls enforce `requirements.md` security and privacy constraints across U01 `business-logic-model.md` and `business-rules.md`, using the Spring/Next.js/JDBC boundaries documented in `technology-stack.md`.
