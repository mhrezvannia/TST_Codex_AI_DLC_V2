# Security Requirements - U04 Confirm to CMM Journey

## Messaging Trust

- Producers/consumers validate exact topic, key, source, type, integer schema version, Schema Registry subject/fingerprint, and canonical field shape before domain use.
- Kafka/SR use the approved local-only PLAINTEXT/no-ACL waiver on the isolated Compose bridge; source/type/key/schema validation remains mandatory. Service HTTP uses `X-LinerCore-Service-Id` plus target-specific environment token and fixed least-privilege roles.
- `AUTH_MODE=local` and `KAFKA_SECURITY_PROTOCOL=PLAINTEXT` are valid only under Spring profile `local`; any non-local profile fails startup. Production JWT/mTLS/Kafka ACL design remains W2-01.
- Event payload contains booking/routing/equipment references only and excludes customer PII, pricing amounts, credentials, and arbitrary attributes.
- ISO 6346, UN/LOCODE, array bounds, enums, timestamps, and UUID identity inputs are validated.

## DLT and Audit

DLT replay uses separate environment `LOCAL_REPLAY_TOKEN` mapped only to local operator role `messaging:replay`, plus actor, reason, original coordinates, and immutable original/corrected hashes. Normal service tokens cannot replay. Logs/errors redact payloads, headers/tokens, broker hosts, stack traces, and customer data. The approved local subject reset cannot run against non-local registry endpoints.

Tests cover forged source/type/key, legacy flat records, invalid schema version/ISO/route, unauthorized replay, secret/PII leakage, and no-op profile outside local.

## Source Coverage

Controls enforce U04 `business-logic-model.md`, `business-rules.md`, and `requirements.md` using Spring Kafka/Avro security boundaries in `technology-stack.md`.
