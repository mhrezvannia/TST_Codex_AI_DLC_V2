# Tech Stack Decisions - U05 Route Compatibility and Preservation

## Source Context

These decisions consume U05 `business-logic-model.md`, U05 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U05 uses existing routing and evidence tooling.

## Locked Choices

| Area | Decision | Rationale |
| --- | --- | --- |
| Route compatibility | Existing Next.js/Nginx routing mechanisms. | Fits shell architecture and avoids new router stack. |
| Canonical routes | `/booking`, `/booking/new`, `/booking/[id]`. | ADR-001A. |
| Legacy aliases | `/bookings`, `/bookings/new`, `/bookings/[id]`. | Preserve existing links. |
| Preservation evidence | Git diff/path review plus targeted tests. | Auditable and scoped. |
| Runtime | Local Compose/Nginx. | W2-01 acceptance target. |

## Prohibited Choices

- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- No new design-system foundation work.
- No reference-data, charge, or container movement shell migration.
- No broad prior-work rewrites.
- No W1 waiver PASS rewrite.

## Configuration Decisions

| Configuration | Requirement |
| --- | --- |
| Redirect/resolution map | Fixed one-to-one `/bookings*` to `/booking*`. |
| Preservation scope | W0-01, W0-02, W1-01, W2-02. |
| Evidence root | Final package under `artifacts/w2-01-live/app-shell-auth/`. |
