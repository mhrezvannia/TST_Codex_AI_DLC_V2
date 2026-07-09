# Reliability Requirements - U01

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Reliability Targets

| Target | Requirement |
| --- | --- |
| Startup | Backend and UI start with documented ports. |
| Degradation | Missing optional dependencies are surfaced without crashing the UI. |
| Evidence | Readiness distinguishes host-runtime from Docker blockers. |

## Recovery

Restarting the skeleton services should restore health without manual data recovery.
