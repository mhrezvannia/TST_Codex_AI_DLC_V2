# Performance Design - U05 Returned Status Detail

## Projection-to-UI Path

CMM relay runs every 250 ms, atomically claims batch50 with a 30-second lease, and uses the shared publisher to emit keyed status with a 2.5-second terminal-send wait. Producer settings are `acks=all`, idempotence enabled, max in-flight 5, delivery timeout 2 seconds, request timeout 1 second, and one immediate retry within that delivery budget; the outbox owns cross-send durable retries at 250 ms/1 second/5 second/capped 30 seconds. Booking listener concurrency3 and `max.poll.records=50` perform strict mapping and one transaction: receipt insert plus guarded indexed upsert. Detail query joins Booking/pricing/outbox/latest projection locally and returns <=500 ms p95.

React controller requests local BFF once/second, max30, visibility pause, abort/no overlap, stopping on matching event ID. Monotonic browser marks confirm response and visible render; metrics split relay/claim age/producer timeout/consumer retry/DLT/upsert/BFF/poll. Fixed run enforces p95 5s and lag/pool/RSS limits.

## Source Coverage

Design realizes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U05 `business-logic-model.md`.
