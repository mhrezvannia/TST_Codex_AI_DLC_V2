# Infrastructure Services - U06 Replay and Restart Safety

## Control Components

| Component | Capability | Security/failure boundary |
|---|---|---|
| Compose restart controller | stop/start/wait/snapshot services | local operator tooling |
| duplicate/order driver | publish 100 bounded canonical records | Kafka test identity |
| protected replay control | unchanged or corrected republish | separate replay role/token |
| migration/backup verifier | dump/fingerprint/restore-copy/repair | disposable database copy |
| state evidence collector | DB/topic/API/UI comparisons | read-only access |
| test fault collaborators | provisional-write crash injection | test classpath only |

No replay database writer, production fault endpoint, alternate consumer, bulk replay daemon, or second migration tool is created. Existing service applications remain sole business-state authorities.

## Replay Modes and Provenance

Environmental replay republishes original key/value bytes and envelope ID after infrastructure repair. Correction replay parses the canonical schema, preserves envelope ID, requires an allow-listed field correction, and records original/corrected SHA-256 plus exact field diff. Both modes audit actor, reason, origin topic/partition/offset, event ID, destination, time, and result before/after publish.

Replay uses the same schema registrar/publisher rules and source topic. It cannot bypass source/type/version/key validation. DLT records retain original payload/key and origin/error headers for seven days with capacity >=10,000 records; non-empty age >5 minutes or count >100 is a release failure.

## State and Retention

Evidence snapshots compare pricing result/manual case, Booking confirmation/outbox, CMM receipt/journey/status outbox, Booking receipt/projection, source/DLT offsets, and browser-visible status. Receipts/outbox are retained >=30 days and audit >=90 days. Sensitive dumps/commands/environment are redacted and not committed.

## Source Coverage

Services realize `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U06 `business-logic-model.md`.
