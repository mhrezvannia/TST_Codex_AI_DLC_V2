# Tech Stack Decisions - U06 Final Live Acceptance and Audit

## Source Context

These decisions consume U06 `business-logic-model.md`, U06 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U06 uses existing local runtime and audit tooling.

## Locked Choices

| Area | Decision | Rationale |
| --- | --- | --- |
| Evidence root | `artifacts/w2-01-live/app-shell-auth/`. | Approved W2-01 evidence location. |
| Evidence formats | JSON, JSONL, Markdown, and text command outputs. | Parseable and reviewable without new services. |
| Runtime | Docker Compose with Nginx, Keycloak, shell/auth, Booking, identity. | Required local acceptance target. |
| Audit tools | Detector 6d, `erp-fidelity-audit`, `aidlc-audit`. | Required by U06 DoD. |
| UI stack for any proof surfaces | Existing Next.js/React/TypeScript. | NFR-07 and technology stack. |

## Prohibited Choices

- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- No cloud or AWS deployment dependency.
- No screenshot-only acceptance.
- No broad observability platform change.
- No W1 waiver PASS rewrite.

## Configuration Decisions

| Configuration | Requirement |
| --- | --- |
| `manifest.json.finalDecision` | `PASS` or `BLOCKED` only. |
| `blockers.jsonl` | Required for any BLOCKED status. |
| Scenario ids | `allow-booking-create-detail`, `deny-booking-access`, `sign-out-reauth-stale-call`, `legacy-bookings-compatibility`. |
| W1 waiver | Record BLOCKED at `compose-start`. |
