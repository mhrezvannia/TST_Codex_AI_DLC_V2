# Performance Requirements - U01

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

| Target | Requirement |
| --- | --- |
| Backend health | `/actuator/health` under 200 ms on local host-runtime. |
| Module info | Under 200 ms with no downstream calls. |
| UI shell | First contentful render within 1.5 seconds on local host-runtime and shows dependency placeholders without blocking on reference or identity services. |
| Enterprise smoke budget | Combined health, module-info, and UI shell smoke completes in 5 seconds p95 on a developer workstation. |

## Validation

Use host-runtime smoke checks and avoid claiming Docker parity while Compose is blocked.
