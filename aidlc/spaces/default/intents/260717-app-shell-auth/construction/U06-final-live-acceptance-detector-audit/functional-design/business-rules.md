# Business Rules - U06 Final Live Acceptance and Audit

## Source Context

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They govern final W2-01 evidence and audit closure.

## Acceptance Rules

| Rule | Statement |
| --- | --- |
| ACC-01 | Acceptance enters through local Compose/Nginx with Keycloak, shell/auth, Booking service/BFF, and identity-service available. |
| ACC-02 | Allow path evidence must identify `local.booking.user` or equivalent Keycloak subject and a correlation id. |
| ACC-03 | Deny path evidence must identify `local.reference.admin` or equivalent Keycloak subject and a correlation id. |
| ACC-04 | Sign-out evidence must identify the authenticated subject before sign-out, sign-out correlation id, protected-route reauth decision, stale-call correlation id, and fail-closed result. |
| ACC-05 | `/bookings*` compatibility and prior-work preservation evidence must be present. |

## Audit Rules

| Rule | Statement |
| --- | --- |
| AUDIT-01 | Detector 6d must report zero hardcoded-auth hits for mounted shell/Booking surfaces, or W2-01 remains blocked. |
| AUDIT-02 | `erp-fidelity-audit` must be green for W2-01, or a concrete blocker must be recorded. |
| AUDIT-03 | `aidlc-audit` must be green for W2-01 state, audit, and artifacts, or a concrete blocker must be recorded. |
| AUDIT-04 | Evidence files belong under `artifacts/w2-01-live/app-shell-auth/`. |
| AUDIT-05 | Evidence package files must include `manifest.json`, `runtime-readiness.json`, `scenarios.jsonl`, `actor-evidence.jsonl`, `sign-out-evidence.json`, `compatibility-preservation.md`, `detector-6d.txt`, `erp-fidelity-audit.txt`, `aidlc-audit.txt`, `blockers.jsonl` when blocked, and `final-decision.md`. |

## Waiver and Blocker Rules

| Rule | Statement |
| --- | --- |
| BLOCK-01 | W1's existing live-proof waiver remains explicit as BLOCKED at `compose-start`. |
| BLOCK-02 | A new W2-01 live blocker is recorded separately from the W1 waiver. |
| BLOCK-03 | Unit tests, screenshots, or container startup alone cannot replace live actor/audit evidence. |
| BLOCK-04 | False PASS wording for W1 or W2-01 blockers is prohibited. |
| BLOCK-05 | Every BLOCKED result includes `blockerId`, `detectedAt`, `dependency`, `commandOrScenario`, `observedFailure`, `impact`, `nextAction`, `owner`, and `w1WaiverRelated`. |

## Preservation Rules

| Rule | Statement |
| --- | --- |
| PRES-01 | W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system preservation remain visible in final evidence. |
| PRES-02 | Any touched prior-work file must have W2-01-specific justification and targeted verification. |
| PRES-03 | W2-01 does not migrate reference-data, charge agreement, or container movement screens. |

## UI Constraint Rules

| Rule | Statement |
| --- | --- |
| UI-01 | Any U06 evidence-facing UI or driven shell/Booking surface follows existing Next.js/React/TypeScript patterns. |
| UI-02 | U06 must not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |
