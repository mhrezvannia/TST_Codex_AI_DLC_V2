# User Stories Diary

## Observations

- `requirements.md` is approved and reviewer-ready after iteration 2. It closes the W2-01 scope boundary, requires deterministic allow/deny users, and keeps W1's live-proof waiver explicit.
- `business-overview.md` frames the value as identity integrity and one authenticated operating shell, not new Booking domain behavior.
- `component-inventory.md` identifies `apps/auth`, `apps/booking`, `packages/auth`, identity-service, and booking-service as the active W2-01 components.
- `team-practices.md` requires a risk-first walking skeleton: protected shell entry, session handoff, and one Booking call that cannot fall back to `local-user`.
- Product-lead fallback review returned READY. Non-blocking watch item: keep FR-09 explicit in Construction tests if non-mounted modules appear in navigation; they must remain disabled placeholders or external links, not partial migrations.

## Interpretations

## Deviations

## Tradeoffs

## Open questions

- Delivery planning still needs to choose the exact fixture location for `local.booking.user` and the concrete audit/log capture method.
