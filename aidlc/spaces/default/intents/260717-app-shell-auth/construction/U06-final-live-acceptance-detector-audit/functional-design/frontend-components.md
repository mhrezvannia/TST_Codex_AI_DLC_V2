# Frontend Components - U06 Final Live Acceptance and Audit

## Source Context

This frontend/evidence design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U06 primarily produces evidence artifacts; any UI involved is the existing shell/Booking surface driven for live proof.

## Evidence Driver Surfaces

| Surface | Purpose |
| --- | --- |
| Shell landing | Proves protected login and session summary. |
| Booking list/read | Proves mounted Booking read with real actor. |
| Booking create/detail | Proves allow path for `local.booking.user`. |
| Access denied | Proves deny path for `local.reference.admin`. |
| User menu/sign-out | Proves session clearing and route reauth. |
| Compatibility routes | Proves `/bookings*` old links reach canonical shell `/booking*`. |

## Evidence Artifact Components

| Artifact component | Contents |
| --- | --- |
| Scenario transcript | Step-by-step route, actor, outcome, timestamp, correlation id. |
| Screenshot or trace reference | Optional visual proof tied to scenario, never sole evidence. |
| Service log/audit excerpt | Actor, action, authorization result, correlation id. |
| Detector output | Detector 6d command/result. |
| Audit output | `erp-fidelity-audit` and `aidlc-audit` results. |
| Preservation summary | Prior-work diff review and targeted checks. |
| Final decision | `final-decision.md` summary of PASS/BLOCKED, scenario statuses, command exit codes, blockers, and W1 waiver. |

## UX Constraints During Proof

- Shell, Booking, denied, and sign-out states must remain usable at common desktop and mobile widths.
- Evidence displays must be QA-safe: subject/correlation/decision only, no raw tokens.
- A visual screenshot without backend/audit evidence is not enough for U06 acceptance.
- If a runtime blocker occurs, the evidence surface records the blocker instead of showing a fake PASS.
- Sign-out proof identifies the pre-sign-out subject and correlation id; anonymous UI-only sign-out screenshots are insufficient.

## Frontend Constraints

- Use existing Next.js/React/TypeScript workspace patterns for any evidence-facing UI.
- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Do not add W2-02 design-system foundation work.
- Do not migrate non-Booking modules into shell during final proof.
