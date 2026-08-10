# Security Design - U03 Agreement Pricing

## Request Trust

Booking server sets service ID/token/correlation/idempotency. Charge local auth filter maps only `pricing:request`; non-local profile refuses startup. Controller enforces exact media type/body/limits and cross-checks header amendment identity before hashing/claiming.

Canonical JSON hash uses ordered typed values. Money/category/currency/line limits are domain validated; JDBC parameterization and immutable response snapshots prevent injection/tampering. Error mapper exposes only contract code/message/correlation. Logs use IDs/hash prefixes, never body/rates/tokens/customer attributes.

## Verification

Pact 4.6.17 consumer/provider, auth/key/hash collision, malformed money, role denial, redaction, and non-local guard tests are blocking.

## Source Coverage

Design implements `security-requirements.md` with `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U03 `business-logic-model.md`.
