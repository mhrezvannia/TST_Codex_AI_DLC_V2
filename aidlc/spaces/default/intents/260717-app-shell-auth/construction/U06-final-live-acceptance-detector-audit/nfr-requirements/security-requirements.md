# Security Requirements - U06 Final Live Acceptance and Audit

## Source Context

These security requirements consume U06 `business-logic-model.md`, U06 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U06 verifies the full real-subject security posture.

## Security Evidence Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-01 | Allow evidence identifies `local.booking.user` or equivalent Keycloak subject, actor header, action, authorization decision, and correlation id. | `actor-evidence.jsonl`. |
| SEC-02 | Deny evidence identifies `local.reference.admin` or equivalent Keycloak subject, deny decision, reason/reference, and correlation id. | `actor-evidence.jsonl` and scenario refs. |
| SEC-03 | Sign-out evidence identifies pre-sign-out subject, sign-out correlation id, protected-route decision, stale-call status/code/correlation, and `backendLocalUserObserved=false`. | `sign-out-evidence.json`. |
| SEC-04 | Detector 6d reports zero hardcoded-auth hits for mounted shell/Booking surfaces, or final decision is BLOCKED. | `detector-6d.txt` and `manifest.json`. |
| SEC-05 | Raw tokens, secrets, and service tokens are excluded from evidence artifacts. | Evidence review. |

## Threat Controls

| Threat | Control |
| --- | --- |
| False identity proof | Required actor-evidence fields and detector 6d output. |
| Hidden blocker | Required `blockers.jsonl` and final decision status. |
| Waiver rewrite | `final-decision.md` and `manifest.json.w1WaiverStatus` preserve W1 BLOCKED at `compose-start`. |
| Evidence leakage | QA-safe evidence fields only, no raw tokens/secrets. |

## Compliance

Evidence is audit material. It must be deterministic, reviewable, and minimal: enough to prove subject/action/decision/correlation without exposing secrets or broad PII.
