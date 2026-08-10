# Infrastructure Services - U03 Agreement Pricing

## Service Inventory

| Service | U03 role | Ownership |
|---|---|---|
| Booking API | request mapping/hash, resilience, terminal apply | Booking DB state |
| Charge API | exact v1 media type/auth/error boundary | Pricing HTTP contract |
| Charge claim service | short `REQUIRES_NEW` claim/complete transactions | Charge DB lease/result |
| Agreement engine | indexed agreement/term resolution and `BigDecimal` lines | deterministic calculation |
| PostgreSQL 15 | separate Booking/Charge databases and roles | service-local Flyway/history |
| Pact/load harness | bilateral contract and p99 proof | release gate only |

No cache, tariff database, distributed lock, event bus, or cross-service transaction is introduced. The explicit no-rate tariff adapter resolves none until W2-03. Agreement resolution is authoritative; `NO_RATE` produces durable manual outcomes rather than synthetic charges.

## Database and Contract

Charge V2 adds `pricing_requests`, owner/lease/fencing, immutable terminal result, term category, and manual-case uniqueness/provenance. Unique idempotency key/request hash and `(bookingRef, amendmentSeq)` constraints are final concurrency guards. Indexed customer/status/validity/lane selection bounds candidate resolution; calculation streams at most 100 terms.

Booking sends the checked-in `pricing.v1` DTO and Pact fixture with correlation/idempotency headers. Charge validates exact media type, amendment identity, money/currency/category/line bounds, then hashes canonical ordered typed values. Response/error DTOs contain only contract fields and safe correlation.

## Identity and Secrets

Booking supplies the Charge-specific token and service ID; Charge maps only `pricing:request` under local. Tokens are environment secrets, never image/frontend defaults. Non-local profiles fail closed pending W2-01. Logs expose IDs and bounded hash prefixes, never request bodies, rates, customer attributes, tokens, or connection strings.

## Source Coverage

Services realize `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U03 `business-logic-model.md`.
