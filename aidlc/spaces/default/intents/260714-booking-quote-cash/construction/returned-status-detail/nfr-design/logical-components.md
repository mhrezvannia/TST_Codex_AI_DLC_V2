# Logical Components - U05 Returned Status Detail

## Inventory

| Component | Role | Failure domain |
|---|---|---|
| CMM relay/publisher/mapper | canonical status publish | CMM DB/Kafka/SR |
| Booking listener/mapper/error handler | validation/retry/DLT | Booking consumer group |
| Receipt/projection repository | atomic dedupe/order | Booking DB |
| Detail assembler/API/BFF | local composite read/auth | Booking HTTP |
| Journey status React controller/views | bounded polling/accessibility | Browser only |
| Metrics/load/browser evidence | p95/order/UI proof | Blocking gate |

## Source Coverage

Inventory bridges `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U05 `business-logic-model.md`.
