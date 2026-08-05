# Security Design - U05 Returned Status Detail

## Consumer and Read Protection

Listener validates topic/composite key/source/type/int version/schema/booking-container ownership/DCSA fields/times/location before transaction. Local Kafka waiver/profile guard matches U04. Booking detail auth filter validates BFF token/role; operator audit fields require an extra role. Browser headers are stripped and CMM/SR/Kafka are unreachable from client.

View DTO allow-lists safe movement data; React escapes strings and null location is omitted. Errors/logs redact record/token/hosts/stack/PII. Tests cover forged key/container/source, malformed fields, role denial, XSS canary, and audit redaction.

## Source Coverage

Design implements `security-requirements.md` with `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U05 `business-logic-model.md`.
