# Code Generation Memory

## Interpretations

- 2026-07-16T14:09:52.9663876Z - Agreement-pricing code generation continued from a partially implemented state after session compaction and was completed in-place.
- 2026-07-16T14:31:56.0852480Z - Confirm-to-CMM code generation continued from a partially implemented state and was completed in-place with Booking confirm idempotency, canonical outbox, and CMM Kafka ingestion evidence.
- 2026-07-16T14:59:05Z - Returned-status code generation completed the CMM canonical status publisher and Booking local projection consumer/UI path without retaining the old HTTP movement-status ingress.
- 2026-07-16T15:07:28Z - Replay-restart-safety code generation completed Charge pricing lease takeover/fencing, Booking movement-status transaction annotation, and a replay/restart evidence harness.
- 2026-07-16T15:16:31Z - Live-release-acceptance code generation completed the acceptance orchestrator, real-messaging guard switch, full-profile port fix, and captured a blocked live image-pull run.

## Deviations

- 2026-07-16T14:09:52.9663876Z - See `construction/agreement-pricing/code-generation/memory.md` for unit-specific reviewer and implementation deviations.
- 2026-07-16T14:31:56.0852480Z - See `construction/confirm-to-cmm-journey/code-generation/memory.md` for unit-specific reviewer and implementation deviations.
- 2026-07-16T14:59:05Z - See `construction/returned-status-detail/code-generation/memory.md` for unit-specific reviewer and implementation deviations.
- 2026-07-16T15:07:28Z - See `construction/replay-restart-safety/code-generation/memory.md` for unit-specific reviewer and implementation deviations.
- 2026-07-16T15:16:31Z - See `construction/live-release-acceptance/code-generation/memory.md` for unit-specific reviewer and implementation deviations.

## Tradeoffs

- 2026-07-16T14:09:52.9663876Z - Broader services Maven tests were run in addition to focused Booking/Charge tests to catch cross-module drift caused by shared model changes.
- 2026-07-16T14:31:56.0852480Z - Confirm-to-CMM reused existing idempotency and journey persistence infrastructure while tightening the command and Kafka boundaries to avoid a larger persistence rewrite during code generation.
- 2026-07-16T14:59:05Z - Returned-status used bounded Booking detail polling rather than a new push channel so the UI observes local projection state without adding runtime infrastructure.
- 2026-07-16T15:07:28Z - Replay-restart-safety used repository CAS methods instead of introducing a separate claim service to preserve the current service structure while adding owner fencing.
- 2026-07-16T15:16:31Z - Live-release-acceptance records blocked live evidence honestly instead of downgrading acceptance to host tests only.

## Open Questions

- 2026-07-16T14:09:52.9663876Z - Live Docker/browser proof remains a later gate because this code-generation step verified host tests and static Compose only.
- 2026-07-16T14:31:56.0852480Z - Live Docker/browser proof remains a later gate because this code-generation step verified host tests, frontend build, static Compose, and detectors.
- 2026-07-16T14:59:05Z - Live Docker/browser proof remains a later gate for the full booking-confirm to CMM-status to Booking-projection journey.
- 2026-07-16T15:07:28Z - Replay/restart dry-run evidence is ready; live source-topic replay and restart proof remains for `live-release-acceptance`.
- 2026-07-16T15:16:31Z - Full live acceptance is blocked on Docker Desktop image-pull networking for Elastic observability images; evidence is retained under `artifacts/w1-01-live/codegen-live-blocked-image-pull/`.
