# Security Requirements - U06 Replay and Restart Safety

## Replay Authorization and Integrity

- DLT inspection/replay requires local operator `messaging:replay` authenticated with separate environment `LOCAL_REPLAY_TOKEN`, actor, nonblank reason, original topic/partition/offset, and immutable audit. Normal service/BFF tokens cannot replay.
- Environmental repair replays original key/value; corrected payload preserves envelope ID and records original/corrected SHA-256 plus field differences.
- Replay tooling publishes through Kafka only and cannot patch receipts, projections, journeys, pricing, or outbox tables.
- Fault injection is package/test scoped or external Compose control; no public unauthenticated production fault endpoint exists.

## Evidence Protection

Evidence/logs redact secrets, credentials, customer PII, raw unrestricted payloads, connection strings, and environment values. Backup/restore artifacts are access-controlled and checksummed. Tests cover unauthorized replay, tampered envelope ID/hash, audit omission, production fault-hook absence, and redaction.

## Source Coverage

Controls enforce U06 `business-logic-model.md`, `business-rules.md`, and `requirements.md` using the operational tooling and service boundaries in `technology-stack.md`.
