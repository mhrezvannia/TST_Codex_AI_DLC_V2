# Reliability Design - U06 Final Live Acceptance and Audit

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U06 reliability means final PASS and BLOCKED decisions are deterministic, parseable, and honest.

## Resilience Patterns

| Condition | Design | Requirement coverage |
| --- | --- | --- |
| All required scenarios and commands pass | `manifest.json.finalDecision` is `PASS`. | REL-01 |
| Runtime unavailable | Record W2-01 blocker with dependency, observed failure, impact, next action, owner, and timestamp. | REL-02, REL-05 |
| Scenario missing or failed | Record scenario `BLOCKED` with `blockerId`; final decision remains `BLOCKED`. | REL-02, REL-03 |
| Detector/audit command fails | Save command output, record exit code and blocker id, and keep final decision `BLOCKED`. | REL-02, REL-03 |
| Evidence file missing/unparseable | Block final PASS until captured or recorded as blocker. | REL-04 |
| W1 waiver altered | U06 fails; restore W1 waiver as BLOCKED at `compose-start`. | REL-05 |

## Decision Contract

`manifest.json.finalDecision` and `runtimeStatus` are limited to `PASS` or `BLOCKED`. PASS is allowed only when:

- `runtime-readiness.json` is present and PASS.
- `scenarios.jsonl` contains the four required scenario ids with PASS.
- `actor-evidence.jsonl`, `sign-out-evidence.json`, and `compatibility-preservation.md` contain the required security/preservation fields.
- `detector-6d.txt`, `erp-fidelity-audit.txt`, and `aidlc-audit.txt` have PASS command entries and acceptable outputs.
- `manifest.json.w1WaiverStatus` preserves BLOCKED at `compose-start`.

Any other outcome is `BLOCKED` with at least one row in `blockers.jsonl`.

## Health and Evidence Design

U06 evidence validation checks:

- Required file existence.
- JSON/JSONL parseability.
- Required scenario ids and command ids.
- Matching `blockerId` references between manifest/scenario/command rows and `blockers.jsonl`.
- No raw token/secret fields.
- Final decision consistency with scenario and command statuses.

## Recovery Behavior

- Fixable detector/audit failures are repaired and rerun before PASS.
- Missing evidence fields block final acceptance until captured.
- Unavailable runtime dependencies become BLOCKED records with exact dependency and next action.
- W2-01 blockers do not alter W1 waiver wording.

## Operational Notes

Keep W1's live-proof waiver explicit as BLOCKED at `compose-start`; U06 may produce W2-01 PASS only if W2-01 evidence is complete, and that does not convert W1 to PASS. U06 reliability work must also preserve W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation boundaries rather than modifying prior merged work to make final acceptance easier.

