# Logical Components - U06 Final Live Acceptance and Audit

## Source Context

This component map consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It bridges U06 NFR design to later infrastructure design for final live acceptance, detector output, and audit packaging.

## Component Inventory

| Logical component | Boundary | NFR responsibility | Failure domain |
| --- | --- | --- | --- |
| Local Compose/Nginx runtime | Runtime boundary | Provide shell/auth/Booking/identity/Keycloak through accepted local entrypoint. | Runtime failure produces W2-01 blocker. |
| Scenario runner/live proof driver | Evidence boundary | Execute allow, deny, sign-out, and compatibility scenarios through Nginx. | Missing scenario blocks PASS. |
| Evidence package writer | `artifacts/w2-01-live/app-shell-auth/` | Write manifest, JSON/JSONL, Markdown, and command output files. | Missing/unparseable file blocks PASS. |
| Actor evidence collector | Evidence boundary | Record real subjects, actor headers, decisions, actions, and correlations. | Weak identity evidence blocks PASS. |
| Sign-out evidence collector | Evidence boundary | Record pre-sign-out subject, cookie clear, reauth, stale-call status, and backend no-`local-user`. | False sign-out proof blocks PASS. |
| Compatibility preservation collector | Evidence boundary | Record route compatibility and W0-01/W0-02/W1-01/W2-02 preservation results. | Missing preservation record blocks PASS. |
| Detector 6d command | Local audit command | Prove zero hardcoded-auth hits for mounted shell/Booking surfaces. | Detector failure blocks PASS. |
| `erp-fidelity-audit` command | Local audit command | Record ERP fidelity status for W2-01. | Audit failure blocks PASS. |
| `aidlc-audit` command | Local audit command | Record AI-DLC state/artifact/gate integrity. | Audit failure blocks PASS. |
| Final decision renderer | Evidence boundary | Summarize PASS/BLOCKED, scenario statuses, command exit codes, blockers, and W1 waiver status. | Inconsistent decision blocks PASS. |

## Blast Radius Mapping

| Failure | Blast radius | Containment |
| --- | --- | --- |
| Runtime cannot start | No live proof possible. | Record W2-01 blocker; no screenshot/unit-test substitute. |
| Scenario lacks real subject | Security proof invalid. | Actor evidence schema requires subject and non-`local-user` header. |
| Detector finds hardcoded auth | Mounted shell/Booking auth proof unsafe. | Final decision BLOCKED until fixed or recorded. |
| Audit command fails | Delivery evidence incomplete. | Save output and blocker id. |
| Evidence leaks secrets | Artifact cannot be accepted. | Minimal QA-safe fields and review before PASS. |
| W1 waiver rewritten | Program evidence becomes false. | Final decision and manifest keep W1 BLOCKED at `compose-start`. |

## Isolation Strategy

- U06 observes and packages evidence; it does not add runtime services or application state.
- Scenario drivers are finite and out-of-band.
- Detector and audit tools run as local command evidence, not as production infrastructure.
- Evidence package schema is stable and parseable for later audit.
- W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected prior-work boundaries; U06 consumes them through stable interfaces only and does not rewrite them for NFR convenience.

## Infrastructure Handoff

Later Infrastructure Design should consume this map to add or verify:

- Compose/Nginx readiness evidence for all required local services.
- Evidence directory creation under `artifacts/w2-01-live/app-shell-auth/`.
- Command capture wrappers for detector 6d, `erp-fidelity-audit`, and `aidlc-audit`.
- JSON/JSONL parse checks and final decision consistency checks.
- No AWS/cloud resources for W2-01 unless a later approved scope change says otherwise.

