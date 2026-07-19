# Requirements Analysis Diary

## Observations

- `intent-statement.md` and `scope-document.md` define W2-01 as a single authenticated shell plus Booking vertical slice, not a broad ERP shell redesign.
- `team-practices.md` requires risk-first proof of protected shell entry and a Booking call that cannot fall back to `local-user`.
- `architecture.md`, `code-structure.md`, and `api-documentation.md` identify the current seams: `apps/auth` session routes exist, `apps/booking/lib/bookings.ts::serviceHeaders` still sets `local-user`, Booking backend accepts actor/correlation headers, and identity-service exposes internal authorization.
- Reviewer iteration 1 returned NOT-READY. Requirements were updated to close the scope question, require deterministic allow/deny live-proof identities, label transitive Context Pack citations, and add testable preservation evidence for W0-01, W0-02, W1-01, and W2-02.

## Interpretations

## Deviations

## Tradeoffs

## Open questions

- Scope label remains engine-recorded as enterprise while artifacts stay constrained to W2-01. This is a tracking concern, not a delivery-scope expansion.
