# Scalability Design - U06 Final Live Acceptance and Audit

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U06 evidence collection remains out-of-band and finite so it does not change runtime topology.

## Scaling Architecture

| Area | Design |
| --- | --- |
| Evidence capture | Finite scenario/command capture writing local JSON, JSONL, Markdown, and text files. |
| Runtime path | Existing Docker Compose/Nginx/Keycloak/shell/auth/Booking/identity services only. |
| Scenario driver | Runs bounded acceptance journeys; no continuous polling, background workers, or persistent load generation. |
| Detector/audit commands | Run as local command evidence; not installed as runtime services. |
| Artifact storage | Small text artifacts under `artifacts/w2-01-live/app-shell-auth/`. |

## Load Distribution

U06 does not add user-path load distribution, autoscaling, CDN, managed observability, or cloud acceptance paths. It observes the local runtime through accepted routes and writes evidence after finite scenarios and commands complete.

## Shared State Avoidance

- Do not store acceptance state in runtime services.
- Do not add background workers or polling loops to collect evidence.
- Do not require cloud services or managed observability to produce PASS.
- Do not use evidence files as application state.

## Capacity Thresholds

Escalate only if U06 proof shows:

- Evidence capture requires a new runtime service.
- Scenario driver creates persistent polling/load.
- Artifact output becomes too large to review or commit reasonably.
- Detector/audit output cannot be reduced to exact command, status, exit code, and saved output reference.

## Future Compatibility

This design leaves production performance validation, managed observability, and cloud scaling to later Operation stages or future intents. W2-01 final acceptance remains local Compose/on-prem proof with portable artifacts.

