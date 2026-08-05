# Memory - Delivery Planning

## Interpretations

- 2026-07-18T00:00:00Z - Delivery Planning uses a hybrid walking-skeleton-first and risk-first heuristic; `team-practices.md` requires the first Construction slice to prove protected shell entry, session handoff, and one Booking call that cannot fall back to `local-user`.
- 2026-07-18T00:00:00Z - No separate team-formation artifact exists for this intent; team allocation follows the affirmed W2-01 practice of one accountable Platform+UI delivery mob with specialist review hats.

## Deviations

- 2026-07-18T00:00:00Z - WSJF is ordinal rather than numeric because value, time-cost, and job-size inputs were not supplied; project memory says not to fabricate numeric WSJF precision.

## Tradeoffs

- 2026-07-18T00:00:00Z - U03 and U04 are topologically parallel after U01, but the plan keeps a primary serial path because one mob owns the vertical slice and live proof depends on stable actor/session behavior.

## Open questions

- 2026-07-18T00:00:00Z - Construction should confirm whether the `local.booking.user` fixture lands in the shared seed pack or a W2-01 live-proof overlay before Bolt 2 closes.
