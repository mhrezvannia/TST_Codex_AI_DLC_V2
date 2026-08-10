# Performance Design - U06 Final Live Acceptance and Audit

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U06 performance design records scenario and command timings in the final evidence package without inventing production SLOs.

## Design Decisions

| Decision | Design | Requirement coverage |
| --- | --- | --- |
| PERF-D01 | Store final evidence under `artifacts/w2-01-live/app-shell-auth/` using JSON, JSONL, Markdown, and text files. | PERF-01, PERF-02, SCALE-04 |
| PERF-D02 | `scenarios.jsonl` records `startedAt`, observed result, status, correlation, and evidence references for allow, deny, sign-out, and compatibility scenarios. | PERF-01, PERF-03 |
| PERF-D03 | `detector-6d.txt`, `erp-fidelity-audit.txt`, and `aidlc-audit.txt` record exact command, start/end time where available, exit code, and PASS/BLOCKED status. | PERF-02, REL-03 |
| PERF-D04 | `manifest.json` links scenario timings, command outputs, blockers, final decision, and W1 waiver status. | PERF-03, REL-01 |
| PERF-D05 | Do not add runtime services, managed observability, cloud deployment, continuous polling, or screenshot-only acceptance for evidence capture. | SCALE-01, SCALE-02, SCALE-03 |

## Timing Capture Design

| Evidence source | Required timing | Notes |
| --- | --- | --- |
| Runtime readiness | `timestamp` | Records service observed/expected status and blocker id when blocked. |
| Scenario transcript | `startedAt` and observed result timing fields where captured by scenario driver. | Keeps U01-U05 local timing targets visible. |
| Detector/audit commands | `startedAt`, `endedAt`, `exitCode` in manifest command entry and text output. | Exact command string is required. |
| Final decision | `generatedAt` in manifest plus final summary timestamp if available. | No aggregate production SLO is inferred. |

## Evidence Size and Portability

- Use compact JSON/JSONL rows with stable scenario ids.
- Store command stdout/stderr or saved report path in the corresponding text output files.
- Keep logs minimal and QA-safe; do not include raw tokens, secrets, service tokens, or broad PII.
- A large or unreviewable artifact set becomes a W2-01 blocker rather than a runtime service request.

## Preservation Boundary

U06 NFR Design preserves prior merged work by explicit boundary:

| Prior work | U06 NFR boundary |
| --- | --- |
| W0-01 platform/eventing | Do not redesign eventing, outbox, messaging, telemetry, or platform correlation infrastructure. U06 records existing correlation evidence only. |
| W0-02 reference-data | Do not change reference-data seed/completeness surfaces or migrate reference-data UI. U06 records preservation status and blockers only. |
| W1-01 Booking | Preserve W1 behavior and keep W1 live-proof waiver BLOCKED at `compose-start`. U06 final PASS, if achieved, is W2-01 PASS only and never a W1 PASS rewrite. |
| W2-02 design-system foundation | Do not add a design-system foundation or styling stack. U06 consumes existing proof surfaces and records gaps without owning W2-02. |

## Measurement Design

U06 PASS requires timing/status fields for all required scenarios and commands. Any missing timing/status, failed command, unavailable runtime, detector hit, audit failure, missing evidence field, or unparseable JSON/JSONL row records a concrete blocker id and makes final decision `BLOCKED`.

