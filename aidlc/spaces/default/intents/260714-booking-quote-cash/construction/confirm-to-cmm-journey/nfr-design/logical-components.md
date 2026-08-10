# Logical Components - U04 Confirm to CMM Journey

## Inventory and Blast Radius

| Component | Role | Failure domain |
|---|---|---|
| Booking confirm/BFF/API | local commit/pending UI | Booking HTTP/DB |
| Booking outbox/atomic lease relay/publisher/mapper | canonical publish; 250 ms schedule, batch 50, 30 s recovery lease | Booking DB plus Kafka/SR |
| Kafka/SR/source/DLT | at-least-once transport/contracts | Shared local messaging |
| CMM listener/mapper/error handler/DLT recoverer | record ack after commit; bounded transient retry; permanent DLT | CMM consumer group |
| Reference validator | route authority outside tx | Reference dependency |
| CMM application/repos | receipt/journey/status outbox | CMM DB |
| Replay/metrics/evidence | authorized recovery/proof | Operator/gate only |

## Source Coverage

Inventory bridges `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U04 `business-logic-model.md`.
