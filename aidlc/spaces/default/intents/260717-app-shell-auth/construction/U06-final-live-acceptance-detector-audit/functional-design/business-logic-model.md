# Business Logic Model - U06 Final Live Acceptance and Audit

## Source Context

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U06 packages and verifies the live W2-01 journey after behavior units have been implemented: login, shell, Booking allow, Booking deny, sign-out, detector 6d, `erp-fidelity-audit`, `aidlc-audit`, and W1 waiver preservation.

## Workflow

| Step | Component/tool | Processing | Output |
| --- | --- | --- | --- |
| 1 | Local Compose/Nginx/Keycloak | Start or verify target runtime with shell/auth/Booking/identity services reachable through Nginx. | Runtime readiness evidence or W2-01 blocker. |
| 2 | Browser/live proof driver | Login as `local.booking.user`, enter shell, run Booking read/create/detail allow path. | Allow evidence with real subject/correlation. |
| 3 | Browser/live proof driver | Login as `local.reference.admin`, navigate to Booking. | Deny evidence with real subject/correlation. |
| 4 | Browser/live proof driver | While signed in as a real subject, sign out and revisit protected shell/Booking routes. | Sign-out and stale-call fail-closed evidence with pre-sign-out subject and correlation id. |
| 5 | Compatibility proof | Exercise `/bookings*` compatibility and preservation checks. | Route/preservation evidence. |
| 6 | Detector 6d | Scan mounted shell/Booking surfaces for hardcoded auth. | Zero-hit detector output or blocking finding. |
| 7 | `erp-fidelity-audit` | Run ERP fidelity audit for W2-01. | Audit result. |
| 8 | `aidlc-audit` | Run AIDLC audit for state, artifact, and gate integrity. | Audit result. |
| 9 | Evidence package | Store results under `artifacts/w2-01-live/app-shell-auth/`. | Final acceptance package or BLOCKED package. |

## Acceptance Decision Flow

```text
Live Compose ready?
  |-- no --> record W2-01 BLOCKED with concrete blocker
  |
  yes
  v
Allow, deny, sign-out, compatibility all observed?
  |-- no --> record failed/missing scenario
  |
  yes
  v
Detector 6d + erp-fidelity-audit + aidlc-audit green?
  |-- no --> fix or record W2-01 blocker
  |
  yes
  v
W2-01 acceptance evidence complete
```

Text fallback: U06 either produces a complete live acceptance package or an honest W2-01 BLOCKED package. It never turns W1's existing BLOCKED waiver into PASS.

## Evidence Package Shape

All paths are relative to `artifacts/w2-01-live/app-shell-auth/`.

| Required file | Format | Required fields / contents |
| --- | --- | --- |
| `manifest.json` | JSON | `intent`, `branch`, `baseBranch`, `baseCommit`, `generatedAt`, `runtimeStatus` (`PASS` or `BLOCKED`), `finalDecision` (`PASS` or `BLOCKED`), `evidenceRoot`, `scenarios[]`, `commands[]`, `blockers[]`, `w1WaiverStatus`. |
| `runtime-readiness.json` | JSON | `timestamp`, `composeProject`, `entrypointUrl`, `services[]` with `name`, `expected`, `observed`, `status`, and optional `blockerId`. |
| `scenarios.jsonl` | JSON Lines | One row per scenario with `scenarioId`, `unit`, `actor`, `route`, `startedAt`, `expectedResult`, `observedResult`, `status`, `correlationId`, `evidenceRefs[]`, and optional `blockerId`. Required scenario ids: `allow-booking-create-detail`, `deny-booking-access`, `sign-out-reauth-stale-call`, `legacy-bookings-compatibility`. |
| `actor-evidence.jsonl` | JSON Lines | `scenarioId`, `subject`, `actorHeader`, `service`, `action`, `authorizationDecision`, `correlationId`, `timestamp`, `sourceRef`; every actor header must be non-`local-user` for protected paths. |
| `sign-out-evidence.json` | JSON | `preSignOutSubject`, `signOutCorrelationId`, `signOutCommand`, `signOutExitOrHttpStatus`, `cookieCleared`, `postSignOutRoute`, `postSignOutDecision`, `staleCallStatus`, `staleCallCode`, `staleCallCorrelationId`, `backendLocalUserObserved` (`false`). |
| `compatibility-preservation.md` | Markdown | `/bookings*` observed route outcomes plus W0-01, W0-02, W1-01, and W2-02 diff review, touched-file reasons, and targeted verification results. |
| `detector-6d.txt` | Text | Command, exit code, stdout/stderr or saved report path, and zero-hardcoded-auth result for mounted shell/Booking surfaces. |
| `erp-fidelity-audit.txt` | Text | Command, exit code, stdout/stderr or saved report path, and PASS/BLOCKED result. |
| `aidlc-audit.txt` | Text | Command, exit code, stdout/stderr or saved report path, and PASS/BLOCKED result. |
| `blockers.jsonl` | JSON Lines | Required when any status is BLOCKED: `blockerId`, `detectedAt`, `dependency`, `commandOrScenario`, `observedFailure`, `impact`, `nextAction`, `owner`, `w1WaiverRelated` (`true` or `false`). |
| `final-decision.md` | Markdown | Summary table with `PASS` or `BLOCKED`, scenario statuses, command exit codes, blocker ids, W1 waiver line preserving BLOCKED at `compose-start`, and final reviewer notes. |

## Failure Paths

| Failure | Behavior |
| --- | --- |
| Docker image or service startup blocked | Record W2-01 BLOCKED with exact failing dependency and date/time; do not substitute screenshots/unit tests. |
| Detector 6d finds hardcoded auth | U06 fails until code is fixed or accepted as a W2-01 blocker. |
| Audit fails | U06 fails until audit issue is fixed or recorded as blocker. |
| W1 waiver changed to PASS | U06 fails; restore explicit BLOCKED wording. |
| Evidence lacks real subject | U06 fails; live proof must show non-`local-user` subjects for allow, deny, and sign-out pre-state. |
| Evidence package omits required files/fields | U06 fails; the package contract above is mandatory for implementability. |

## Traceability

| Requirement/story | U06 behavior |
| --- | --- |
| Acceptance Criteria 1-11 | Final live proof and evidence package. |
| US-02, US-04 | Real subject and mounted Booking proof without prior-work regression. |
| NFR-03, NFR-04, NFR-08, NFR-10 | Hardcoded-auth detector, correlation evidence, local Compose runtime, preservation evidence. |
| NFR-07 | Any shell/Booking/evidence-facing UI driven by U06 remains in existing Next.js/React/TypeScript patterns and does not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |

## Command Result Contract

Every command captured in `manifest.json.commands[]` and the corresponding `*.txt` file records:

| Field | Meaning |
| --- | --- |
| `commandId` | Stable id such as `detector-6d`, `erp-fidelity-audit`, or `aidlc-audit`. |
| `command` | Exact command string that was run. |
| `startedAt` / `endedAt` | ISO 8601 timestamps. |
| `exitCode` | Process exit code. |
| `status` | `PASS` when exit code and output satisfy the acceptance rule, otherwise `BLOCKED`. |
| `outputPath` | Path to the saved output file. |
| `blockerId` | Required when status is `BLOCKED`. |

## Architecture Review - Functional Design (2026-07-18)

Verdict: NOT-READY.

### Findings

1. Evidence package shape is not yet an implementable contract. The model fixes the root folder, but `Evidence Package Shape` defines broad categories rather than required file names, manifests, field schemas, command outputs, exit-code capture, and PASS/BLOCKED decision fields. A developer could produce several incompatible package layouts while still satisfying the text, and downstream `erp-fidelity-audit`/`aidlc-audit` consumers would have no stable contract to validate. Required change: define the exact files under `artifacts/w2-01-live/app-shell-auth/`, including the scenario transcript schema, audit output paths, detector output path, runtime readiness/blocker record, final decision record, and required fields for actor, route, timestamp, expected result, observed result, correlation id, command, exit code, and blocker reason.

2. Sign-out evidence is weaker than the real-subject acceptance requirement. The allow and deny paths explicitly require real subjects and correlation ids, but sign-out evidence only requires session clearing, reauth, and stale-call fail-closed behavior. That leaves room for sign-out acceptance based on anonymous UI behavior or screenshots rather than a real Keycloak subject and correlated backend evidence. Required change: make sign-out evidence identify the authenticated subject before sign-out, the correlation id for the sign-out/stale-call checks, and the post-sign-out protected-route decision.

3. NFR-07 is not traceable from this model. The traceability table names NFR-03, NFR-04, NFR-08, and NFR-10, while the frontend artifact has desktop/mobile usability constraints for proof surfaces. Because U06 may drive existing shell/Booking UI and evidence-facing UI, the NFR-07 constraint must be explicitly traced or explicitly marked out of scope with rationale. Required change: add NFR-07 traceability to the acceptance/evidence model, or document why no U06 UI surface is subject to it.

## Architecture Review - Functional Design Iteration 2 (2026-07-18)

Verdict: READY.

Required changes: none.

### Verification

- Evidence package shape now defines exact required files under `artifacts/w2-01-live/app-shell-auth/`: `manifest.json`, `runtime-readiness.json`, `scenarios.jsonl`, `actor-evidence.jsonl`, `sign-out-evidence.json`, `compatibility-preservation.md`, `detector-6d.txt`, `erp-fidelity-audit.txt`, `aidlc-audit.txt`, conditional `blockers.jsonl`, and `final-decision.md`.
- JSON, JSONL, Markdown, and text contracts now include required fields or contents for runtime readiness, scenario rows, actor evidence, sign-out evidence, compatibility preservation, detector/audit outputs, blockers, and final decision.
- Required scenario ids are explicit: `allow-booking-create-detail`, `deny-booking-access`, `sign-out-reauth-stale-call`, and `legacy-bookings-compatibility`.
- Command results now have a stable contract with `commandId`, exact command, start/end timestamps, exit code, PASS/BLOCKED status, output path, and required blocker id when blocked.
- Blocker records now require concrete dependency, command/scenario, observed failure, impact, next action, owner, timestamp, and W1-waiver relation.
- Sign-out evidence now requires pre-sign-out subject, sign-out correlation, protected-route decision, stale-call status/code/correlation, and proof that backend `local-user` was not observed.
- NFR-07 is now traceable from the business logic model and reflected in business rules/frontend constraints through existing Next.js/React/TypeScript patterns and explicit dependency bans.
