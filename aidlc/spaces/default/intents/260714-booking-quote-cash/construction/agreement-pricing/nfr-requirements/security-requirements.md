# Security Requirements - U03 Agreement Pricing

## API and Authorization

- `POST /pricing-requests` accepts only the versioned media type, required correlation/idempotency headers, exact allow-listed fields, bounded strings, dates, quantities, booleans, UN/LOCODE, currency, and enums.
- Booking calls Charge with `X-LinerCore-Service-Id: booking-service` and target-specific `X-LinerCore-Local-Token`; Charge maps that identity only to `pricing:request` and authorizes before claim replay/result disclosure using constant-time token comparison.
- Local tokens are environment/Compose secrets and never enter browser payloads/logs. `AUTH_MODE=local` is valid only under Spring `local`; every non-local profile fails startup until W2-01 supplies JWT/RS256/TLS role mapping.
- Header/body booking-amendment identity is cross-checked; request hash uses canonical business data and SHA-256, excluding secrets/timestamps.

## Financial and Data Protection

Rates/terms are Charge-owned; Booking receives only contract result fields. No customer PII, credentials, raw agreement snapshots, SQL, hosts, or stack traces appear in errors/logs. Decimal amount/currency/category are validated; no negative, mixed-currency, floating-point, inferred category, or guessed conversion is accepted.

Tests cover auth denial, malformed/oversized payload, hash/key collision, replay authorization, error redaction, SQL/JSON injection strings, and accidental PII/secret logging.

## Source Coverage

Controls enforce U03 `business-logic-model.md`, `business-rules.md`, and `requirements.md` through Spring HTTP/JDBC boundaries in `technology-stack.md`.
