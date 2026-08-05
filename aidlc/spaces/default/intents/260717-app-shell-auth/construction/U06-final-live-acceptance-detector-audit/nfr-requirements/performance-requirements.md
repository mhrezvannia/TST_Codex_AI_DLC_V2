# Performance Requirements - U06 Final Live Acceptance and Audit

## Source Context

These performance requirements consume U06 `business-logic-model.md`, U06 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U06 records final evidence rather than defining production load SLOs.

## Measurement Requirements

| ID | Requirement | Measurement |
| --- | --- | --- |
| PERF-01 | `scenarios.jsonl` records `startedAt`, observed result, and status for allow, deny, sign-out, and compatibility scenarios. | Evidence package review. |
| PERF-02 | `detector-6d.txt`, `erp-fidelity-audit.txt`, and `aidlc-audit.txt` record exact command, start/end time where available, exit code, and PASS/BLOCKED status. | Command output files. |
| PERF-03 | Scenario timings from U01-U05 targets remain visible in final evidence; U06 does not invent aggregate production SLOs. | `manifest.json` and scenario refs. |

## Resource Constraints

- Final evidence generation must not require new runtime services.
- Evidence collection may use existing scripts/tools and saved logs.
- U06 cannot replace live proof with static screenshots or unit tests.

## Evidence

Performance evidence is accepted when command and scenario timing fields are present and any exceeded/local blocker is tied to a concrete blocker id.

## Architecture Review - NFR Requirements

Verdict: READY.

Required changes: none.

Findings:

- Upstream coverage is adequate for U06. The NFR set traces to the corrected U06 functional design, W2-01 requirements, units, services, and workspace technology stack. It covers the final live path: allow, deny, sign-out, compatibility, detector 6d, `erp-fidelity-audit`, `aidlc-audit`, and final package creation under `artifacts/w2-01-live/app-shell-auth/`.
- Performance targets are implementable and correctly scoped. U06 records scenario/command timings and exit codes without inventing unsupported production SLOs, and it keeps evidence generation out of the runtime user path.
- Security targets are concrete enough to build and audit. The NFRs require real-subject allow/deny/sign-out evidence, correlation ids, detector 6d zero hardcoded-auth hits, no raw tokens/secrets in artifacts, and `backendLocalUserObserved=false` for sign-out proof.
- Scalability and reliability targets are bounded to evidence integrity. The requirements add no cloud dependency, no new runtime services, no continuous polling/background load, and no false PASS path; any runtime, detector, scenario, or audit failure must produce a concrete W2-01 blocker.
- Tech-stack constraints match the approved brownfield stack. U06 stays on local Compose/Nginx/Keycloak and existing audit tooling, uses JSON/JSONL/Markdown/text evidence formats, and prohibits Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, Moment.js, cloud acceptance paths, and W1 waiver PASS rewrites.
