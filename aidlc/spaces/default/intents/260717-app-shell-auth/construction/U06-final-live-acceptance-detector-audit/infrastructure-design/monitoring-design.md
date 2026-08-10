# Monitoring Design - U06 Final Live Acceptance and Audit

## Source Context

This monitoring design consumes U06 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U06 `business-logic-model.md`. It defines evidence validation rather than production observability.

## Metrics and Evidence Signals

| Signal | Source | Acceptance use |
| --- | --- | --- |
| Runtime readiness | `runtime-readiness.json`. | Prove local Compose/Nginx stack status or blocker. |
| Scenario statuses | `scenarios.jsonl`. | Prove allow, deny, sign-out, and compatibility outcomes. |
| Actor evidence | `actor-evidence.jsonl`. | Prove real subjects and non-`local-user` actor headers. |
| Sign-out evidence | `sign-out-evidence.json`. | Prove cookie clear, protected-route reauth, stale-call response, and `backendLocalUserObserved=false`. |
| Compatibility preservation | `compatibility-preservation.md`. | Prove route outcomes and W0/W1/W2 preservation. |
| Detector/audit command results | `detector-6d.txt`, `erp-fidelity-audit.txt`, `aidlc-audit.txt`, and manifest `commands[]`. | Prove command status and exit codes. |
| Final decision | `manifest.json` and `final-decision.md`. | Prove PASS/BLOCKED consistency and W1 waiver status. |

## Log Strategy

Each command output file records exact command, start/end time where available, exit code, stdout/stderr or saved report path, and PASS/BLOCKED. Scenario rows record scenario id, unit, actor, route, startedAt, expected/observed result, status, correlation id, evidence refs, and optional blocker id.

## Tracing and Correlation

U06 reuses correlation ids produced by the live scenarios. No new tracing backend is introduced. Correlation is required where the scenario exercises protected shell/Booking/auth behavior.

## Alerting and Dashboards

No alerting, dashboard, or managed observability service is required. The final evidence package is the monitoring output for this construction stage.

## Health Checks

U06 health is evidence integrity:

- Required files exist.
- JSON/JSONL parse.
- Required scenario ids and command ids exist.
- `BLOCKED` rows have matching blocker ids.
- No secret/raw-token fields are present.
- Final decision matches scenario and command statuses.

## Incident and Blocker Handling

Any runtime, scenario, detector, audit, parse, missing-field, secret-leak, or W1-waiver mismatch creates a W2-01 blocker and makes `manifest.json.finalDecision=BLOCKED`.

