# Security Requirements - U02 Reference Validation

## Integration Security

- Reference set names are an internal allow-list; user input cannot select arbitrary URLs, paths, hosts, or sets.
- Booking-to-Reference requests use `X-LinerCore-Service-Id: booking-service` and target-specific `X-LinerCore-Local-Token` from environment; Reference Data grants only `reference:read` after constant-time token validation.
- `AUTH_MODE=local` is accepted only under Spring `local` on the isolated Compose network. Any non-local profile fails startup; JWT/RS256/TLS service auth remains W2-01.
- Provider records are mapped to stable IDs/codes/version and required voyage attributes only; customer PII and unrelated attributes are neither persisted nor logged.
- All returned field paths/reason codes are server-generated, safe, and escaped by the UI.

## Failure and Audit Controls

Timeout/429/5xx/contract failures return redacted `REFERENCE_DATA_UNAVAILABLE`; raw bodies, tokens, internal hosts, and stack traces remain server-side. Authorization is checked before validation/detail disclosure. Audit records actor, booking, outcome, safe reason, and correlation without copying provider data.

Tests cover SSRF-like set/path input, missing identity, denied access, malformed provider JSON, oversized attributes, PII/log redaction, and browser-direct provider attempts.

## Source Coverage

Controls enforce `requirements.md` through U02 `business-logic-model.md` and `business-rules.md`, preserving Spring server adapters and Next.js BFF boundaries from `technology-stack.md`.
