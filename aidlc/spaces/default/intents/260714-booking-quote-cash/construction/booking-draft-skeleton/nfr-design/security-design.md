# Security Design - U01 Booking Draft Skeleton

## Local Trust Boundary

Nginx exposes only the Booking app. BFF strips browser actor/service headers, sets `X-LinerCore-Actor-Id: local-user`, and sends target-specific environment token. A servlet filter active only under `local` validates service ID/token in constant time, maps fixed roles, and creates the application subject. `AUTH_MODE=local` under any non-local profile throws during configuration; W2-01 owns JWT/TLS.

State-changing BFF routes enforce same-origin/allowed method/content type, bounded body, correlation, and idempotency. Controllers/domain validate exact fields/limits; JDBC is parameterized and Jackson DTOs are typed. Standard security headers, escaped React rendering, safe error mapping, and log redaction protect browser/server boundaries.

## Secrets and Audit

Tokens are Compose environment/secrets, never defaults or frontend variables. Audit records safe identity/result/correlation atomically. Tests exercise header spoofing, bad token, role denial, cross-origin command, injection strings, redaction, and non-local startup.

## Source Coverage

Design implements `security-requirements.md` while respecting `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U01 `business-logic-model.md`.
