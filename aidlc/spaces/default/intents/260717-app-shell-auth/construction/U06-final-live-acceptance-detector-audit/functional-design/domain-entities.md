# Domain Entities - U06 Final Live Acceptance and Audit

## Source Context

This entity model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U06 models evidence and audit records rather than product-domain persistence.

## Entity Catalog

| Entity / value object | Owner | Attributes | U06 role |
| --- | --- | --- | --- |
| LiveScenario | evidence harness | `scenarioId`, unit, actor, route, startedAt, expectedResult, observedResult, status, correlationId, evidenceRefs, blockerId | Represents allow, deny, sign-out, and compatibility checks in `scenarios.jsonl`. |
| RuntimeReadinessRecord | evidence harness | services, status, timestamp, blocker if any | Proves or blocks Compose/Nginx readiness. |
| ActorEvidenceRecord | evidence harness | subject, actor header, action, service, correlation id | Proves non-`local-user` behavior. |
| AuditResult | audit tooling | tool name, status, output path, failure summary | Captures detector 6d, `erp-fidelity-audit`, `aidlc-audit`. |
| PreservationEvidenceRecord | evidence harness | prior intent, touched files, justification, verification | Captures W0/W1/W2 preservation. |
| WaiverRecord | evidence harness | source intent, status, blocker, wording | Keeps W1 waiver explicit. |
| SignOutEvidence | evidence harness | preSignOutSubject, signOutCorrelationId, signOutCommand, cookieCleared, postSignOutDecision, staleCallCode, staleCallCorrelationId, backendLocalUserObserved | Proves sign-out with real subject and no stale `local-user` backend call. |
| CommandResult | evidence harness | commandId, command, startedAt, endedAt, exitCode, status, outputPath, blockerId | Captures detector and audit command results. |
| BlockerRecord | evidence harness/AIDLC state | blockerId, detectedAt, dependency, commandOrScenario, observedFailure, impact, nextAction, owner, w1WaiverRelated | Records honest W2-01 blockers. |

## Relationships

| Relationship | Cardinality | Rule |
| --- | --- | --- |
| LiveScenario to ActorEvidenceRecord | 1 to 1..n | Each scenario captures real subject and correlation where applicable. |
| RuntimeReadinessRecord to LiveScenario | 1 to many | Live scenarios require runtime readiness. |
| AuditResult to LiveScenario | 1 to many | Audits evaluate the completed scenario set. |
| PreservationEvidenceRecord to WaiverRecord | many to 1 | Final package carries W1 waiver without rewriting it. |
| BlockerRecord to AuditResult/RuntimeReadinessRecord | 0..n to 1 | Failed readiness or audit creates concrete blocker evidence. |
| SignOutEvidence to LiveScenario | 1 to 1 | The sign-out scenario includes pre-sign-out subject and stale-call correlation. |

## State Model

| State | Meaning | Transition |
| --- | --- | --- |
| EvidencePending | Behavior units are implemented but final package is not complete. | Start live runtime proof. |
| RuntimeBlocked | Compose/Nginx/Keycloak/service dependency fails. | Record blocker or fix runtime. |
| ScenariosObserved | Allow, deny, sign-out, compatibility scenarios have evidence. | Run detector/audits. |
| AuditBlocked | Detector or audit fails. | Fix or record blocker. |
| AcceptanceReady | All evidence and audits green. | W2-01 may complete. |

## Invariants

- Acceptance cannot be ready without real-subject evidence.
- W1 BLOCKED waiver remains distinct from W2-01 evidence.
- U06 does not invent product behavior; it verifies behavior from U01-U05.
- Any BLOCKED state includes concrete dependency, observed failure, and timestamp.
- A final PASS cannot be recorded unless required evidence package files and required fields are present.
