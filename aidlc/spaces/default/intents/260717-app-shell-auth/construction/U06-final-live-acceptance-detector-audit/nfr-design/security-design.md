# Security Design - U06 Final Live Acceptance and Audit

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U06 security design verifies the complete real-subject app shell/auth posture through minimal, deterministic evidence.

## Identity Evidence Design

| Scenario | Required security evidence |
| --- | --- |
| `allow-booking-create-detail` | `local.booking.user` or equivalent Keycloak subject, non-`local-user` actor header, action, authorization allow decision, created Booking id/reference, correlation id. |
| `deny-booking-access` | `local.reference.admin` or equivalent Keycloak subject, deny decision, reason/reference, no Booking data disclosure, correlation id. |
| `sign-out-reauth-stale-call` | Pre-sign-out subject, sign-out correlation id, cookie-cleared evidence, protected-route decision, stale-call status/code/correlation, `backendLocalUserObserved=false`. |
| `legacy-bookings-compatibility` | Legacy route, canonical target, auth/session/actor preservation, no `local-user`, no backend call before redirect, correlation where relevant. |

## Detector and Audit Design

| Control | Design |
| --- | --- |
| Detector 6d | `detector-6d.txt` records exact command, exit code, output, and zero hardcoded-auth hits for mounted shell/Booking surfaces. |
| ERP fidelity audit | `erp-fidelity-audit.txt` records exact command, exit code, output, and PASS/BLOCKED result. |
| AIDLC audit | `aidlc-audit.txt` records exact command, exit code, output, and PASS/BLOCKED result. |
| Manifest command entries | `commands[]` records `commandId`, `command`, `startedAt`, `endedAt`, `exitCode`, `status`, `outputPath`, and `blockerId` when blocked. |

## Data Protection

- Evidence is QA-safe only: subject identifiers, actor header value, route/action, decision, created id/reference, status, blocker id, and correlation id.
- Raw tokens, refresh tokens, service tokens, secrets, cookies, and broad PII are excluded from artifacts.
- Saved command output must be reviewed for secrets before final PASS; leakage becomes a W2-01 blocker.

## Threat Controls

| Threat | Mitigation |
| --- | --- |
| False identity proof | Required actor evidence rows with real subjects and non-`local-user` protected actor headers. |
| Hardcoded auth hidden in shell/Booking | Detector 6d zero-hit result is mandatory for PASS. |
| Hidden blocker | Every non-PASS scenario/command references `blockerId` in `blockers.jsonl`. |
| Waiver rewrite | `manifest.json.w1WaiverStatus` and `final-decision.md` preserve W1 BLOCKED at `compose-start`. |
| Evidence leakage | Minimal fields plus no raw token/secret policy. |

## Verification Design

- Parse all JSON and JSONL evidence files before PASS.
- Verify required scenario ids are present exactly once unless a blocker explains absence.
- Verify `backendLocalUserObserved=false` for sign-out proof.
- Verify every `BLOCKED` status has a matching `blockerId`.
- Verify W1 waiver status remains a distinct BLOCKED reference, not merged into W2-01 PASS.

