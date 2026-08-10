# Security Requirements - U05 Returned Status Detail

## Event and Read Controls

- Booking validates topic/key/source/type/schema/version, booking/container ownership, timestamps, DCSA vocabulary, enums, booleans, and optional location before projection.
- Detail/BFF uses server-set local actor identity and target-specific environment token; authorization applies before projection/audit disclosure. Browser never calls CMM/Kafka/Schema Registry and cannot override actor/service headers.
- Local auth/plaintext Kafka waiver is valid only under Spring `local`; non-local profiles fail startup pending W2-01 JWT/TLS/ACL implementation.
- Public detail exposes safe canonical movement fields. Topic coordinates and transport audit appear only to authorized operator views; raw records, DLT payloads, credentials, internal hosts, and stack traces remain hidden.

## Replay and Data Protection

DLT replay requires authorization/reason/provenance and preserves envelope identity. Projection/receipt logs exclude customer PII and payload dumps. Safe errors include correlation only. Tests cover forged key/container/source, malformed location/time, unauthorized audit detail/replay, XSS-like status strings, and secret/PII redaction.

## Source Coverage

Controls enforce U05 `business-logic-model.md`, `business-rules.md`, and `requirements.md` through Spring Kafka/Next.js boundaries in `technology-stack.md`.
