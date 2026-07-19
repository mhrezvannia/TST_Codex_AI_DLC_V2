# Scalability Requirements - U06 Final Live Acceptance and Audit

## Source Context

These scalability requirements consume U06 `business-logic-model.md`, U06 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U06 evidence collection must not distort runtime topology.

## Scaling Requirements

| ID | Requirement | Rationale |
| --- | --- | --- |
| SCALE-01 | Evidence capture is out-of-band and does not add runtime services to the user path. | Keeps W2-01 topology stable. |
| SCALE-02 | Scenario drivers do not create continuous load, polling, or background workers. | Avoids test harness becoming a load source. |
| SCALE-03 | Final evidence does not require cloud autoscaling, CDN, or managed observability services. | W2-01 is local Compose/on-prem. |
| SCALE-04 | Evidence files remain small text/JSON/JSONL artifacts under the defined folder. | Keeps audit artifacts portable. |

## Load Assumptions

U06 runs a finite acceptance scenario set. Production performance validation is an Operation concern and must not be inferred from U06.

## Escalation Triggers

- Evidence capture requires a new runtime service.
- Scenario driver introduces persistent polling.
- Audit output becomes too large to review or commit reasonably.
