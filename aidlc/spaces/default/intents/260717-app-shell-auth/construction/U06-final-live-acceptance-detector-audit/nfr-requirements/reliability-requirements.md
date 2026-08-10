# Reliability Requirements - U06 Final Live Acceptance and Audit

## Source Context

These reliability requirements consume U06 `business-logic-model.md`, U06 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U06 must distinguish PASS from BLOCKED reliably.

## Reliability Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| REL-01 | `manifest.json.finalDecision` is `PASS` only when all required scenarios and commands pass. | Evidence package review. |
| REL-02 | Any runtime, scenario, detector, or audit failure records a concrete `blockerId` in `blockers.jsonl`. | Evidence package review. |
| REL-03 | `final-decision.md` summarizes scenario statuses, command exit codes, blocker ids, and W1 waiver status. | Evidence package review. |
| REL-04 | Required evidence files are present and parseable before final PASS. | JSON/JSONL parse and file existence checks. |
| REL-05 | W1 waiver remains a distinct BLOCKED reference, not merged into W2-01 PASS. | Evidence review. |

## Recovery Behavior

- Fixable detector/audit failures are repaired and rerun before PASS.
- Unavailable runtime dependencies become BLOCKED records with exact dependency and next action.
- Missing evidence fields block final acceptance until captured or recorded as blocker.

## Durability

Evidence artifacts are durable project files. U06 does not claim business-data disaster recovery; it proves acceptance evidence integrity and honest blocker handling.
