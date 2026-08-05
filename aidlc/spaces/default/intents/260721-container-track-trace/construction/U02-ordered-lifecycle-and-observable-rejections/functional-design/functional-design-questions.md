# Functional Design Questions - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

Specializes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`,
`components.md`, `component-methods.md`, and `services.md` for U02.

## Q1 - Lifecycle Policy

- A. One typed transition table GTOT -> LOAD -> DISC -> GTIN with exact lifecycle, load-state, location, and sequence rules (recommended).
- B. Timestamp-only ordering.
- X. Other.
- `[Answer]:` A. One typed GTOT -> LOAD -> DISC -> GTIN transition table (recommended).

## Q2 - Duplicate and Idempotency Policy

- A. Immutable request disposition plus per-attempt evidence; same occurrence or any reused key returns 409 `DUPLICATE_MOVEMENT` without aggregate re-evaluation (recommended).
- B. Silent success replay.
- X. Other.
- `[Answer]:` A. Immutable disposition plus per-attempt evidence (recommended).

## Q3 - Validation and Rejection Writes

- A. Validate all typed fields/reference data before domain transition; validation has no DB effect, while business rejection atomically appends attempt/request/rejection/audit only (recommended).
- B. Partially update snapshot before validation.
- X. Other.
- `[Answer]:` A. Typed validation, then rejection-only atomic evidence (recommended).

## Q4 - Outbox Recovery

- A. Worker/token/version fenced claim with retryable terminal mapping and at-least-once publication (recommended).
- B. Unfenced status flag updates.
- X. Other.
- `[Answer]:` A. Worker/token/version fenced outbox recovery (recommended).

## Q5 - Booking Dispositions

- A. Durable APPLIED/DUPLICATE/STALE/REJECTED receipts; positive sequence wins, seq-0 fallback remains, unassigned/invalid never updates projection (recommended).
- B. Last-arrival-wins.
- X. Other.
- `[Answer]:` A. Durable APPLIED/DUPLICATE/STALE/REJECTED receipts (recommended).

## Q6 - UI Recovery

- A. Preserve capture values, focus/announce validation and 409 summaries, show original/current/next evidence, refresh only after accepted commit (recommended).
- B. Reset the form on every response.
- X. Other.
- `[Answer]:` A. Preserve values and expose accessible recovery evidence (recommended).

## Ambiguity Check

- `[Answer]:` No ambiguity; decisions match approved U02 and application contracts.
