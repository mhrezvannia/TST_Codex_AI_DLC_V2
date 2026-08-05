# Security Design - W2-03 Charge Tariffs and Agreements

## Upstream Coverage

This aggregate design consumes every unit's `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It applies the bilateral pricing contract and project rules to the W2-03 rate-authority boundary.

## Trust Boundaries

| Boundary | Authentication | Authorization | Failure behavior |
| --- | --- | --- | --- |
| Booking to Charge pricing | JWT/RS256 at Charge edge | `pricing:invoke` | Fail closed; never convert denial into manual pricing |
| Pricing analyst UI to Charge admin API | OIDC-derived subject | Separate read, maintain, approve, and reprice capabilities | 401/403 with correlation ID |
| Charge to Shared Platform reference API | Service identity | Read-only reference capability | Reject invalid or inactive references |
| Local development bypass | Explicit local/test profile only | Named least-privilege local roles | Application startup fails if enabled outside local/test |

## Data and Domain Controls

- Validate charge codes, currency, locations, trade lane, and equipment type against stable Shared Platform IDs at mutation boundaries.
- Allow USD only for W2-03. Reject unsupported currencies rather than performing implicit conversion.
- Enforce positive amounts, effective-window ordering, non-overlapping active rate versions for the same match key, optimistic version checks, and immutable approved versions.
- Persist the actor, correlation ID, timestamp, prior version, new version, and approval decision for every monetary-authority change.
- Treat tariff and customer-specific rate data as commercially sensitive. Exclude amounts, tokens, and raw request bodies from general logs; expose them only through authorized business views and immutable audit evidence.

## API and Browser Controls

Use explicit request schemas, length and enum constraints, normalized identifiers, standard error envelopes, secure headers, and same-origin BFF calls. State-changing browser requests require the authenticated session and CSRF protection appropriate to the chosen session mechanism. Never accept actor identity from an untrusted request parameter when an authenticated subject exists.

## Contract and Supply-Chain Controls

The OpenAPI/Pact surface is append-only and dual-signed by Booking and Charge owners. CI must run SAST, dependency vulnerability scanning, secret scanning, unit/integration tests, and provider/consumer contract verification before merge. A schema or fixture mismatch blocks release.

## Verification

Test denied pricing, denied admin mutation, stale version, invalid reference, overlapping rate windows, unsupported currency, tampered idempotency reuse, local-bypass startup outside local/test, log redaction, and contract verification.
