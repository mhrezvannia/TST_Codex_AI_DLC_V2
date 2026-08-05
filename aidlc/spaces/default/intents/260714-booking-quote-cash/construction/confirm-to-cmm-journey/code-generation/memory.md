# Code Generation Memory - confirm-to-cmm-journey

## Interpretations

- 2026-07-16T14:31:56.0852480Z - Treated the canonical `booking.confirmed` Avro schema as the binding contract for both Booking publishing and CMM consumption; flat outbox payload keys are only an internal persistence encoding and are materialized to nested Avro at the Kafka adapter boundary.
- 2026-07-16T14:31:56.0852480Z - Treated Booking confirm idempotency as part of this unit because the application design requires `BookingApplicationService.confirm(BookingId id, String actor, String idempotencyKey, String correlationId)`.

## Deviations

- 2026-07-16T14:31:56.0852480Z - Performed the architecture reviewer step inline because the named reviewer subagent is not callable in this ChatGPT Codex surface; the `## Review` section in `code-summary.md` records the verdict.

## Tradeoffs

- 2026-07-16T14:31:56.0852480Z - Reused the existing Booking idempotency receipt table and repository rather than adding a confirm-specific table; this keeps command receipt behavior uniform across create, confirm, and reconfirm.
- 2026-07-16T14:31:56.0852480Z - Left CMM journey persistence on its existing aggregate shape while enforcing the richer nested event contract at the Kafka boundary; this limits blast radius in code generation while still preventing contract drift at ingestion.

## Open Questions

- 2026-07-16T14:31:56.0852480Z - Build/test or runtime proof should still drive one live Booking confirm through Kafka and verify the CMM journey/status effects on the real Compose stack.
