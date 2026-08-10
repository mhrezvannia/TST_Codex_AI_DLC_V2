# Scalability Design - U03 Agreement Pricing

## Horizontal and Database Scale

Booking/Charge instances are stateless. PostgreSQL unique key and booking/amendment constraint plus owner-token CAS arbitrate races. Hikari max10, HTTP/bulkhead10, body256KiB, quantity/TEU1000, terms/lines100 bound work; saturation maps unavailable/manual.

Acceptance seeds >=100 agreements x <=100 terms and executes 1,000 requests <=5 minutes. Metrics/gates enforce p99, pool wait, connection/RSS/OOM limits and expose candidate count, claim collision/takeover, breaker, retry/manual/error rates.

## Source Coverage

Design realizes `scalability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U03 `business-logic-model.md`.
