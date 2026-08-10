# Functional Design Questions - U06 Replay and Restart Safety

## No Exceptional Questions

Requirements and Application Design already fix durable claim recovery, deterministic event identity, envelope receipts, stale ordering, atomic rollback, DLT retry/replay, migration preservation, and restart acceptance. U06 introduces verification and controlled fault execution, not new business behavior, so no user question is required.

## Source Context

The no-question assessment covers U06 in `unit-of-work.md`, US-W1-006 in `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the U01-U05 functional designs that define the protected invariants.
