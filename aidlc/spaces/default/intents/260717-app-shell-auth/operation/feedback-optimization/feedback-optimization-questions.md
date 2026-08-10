# Feedback And Optimization Questions - W2-01 App Shell and Auth

## Upstream Inputs

These questions consume `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`.

## Questions

### Q1. How should SLO compliance be reported?

A. Local proof SLOs PASS; production SLO compliance and burn rate are NOT MEASURABLE
B. Treat ten local performance runs as production SLO compliance
C. Report the future 99.9% target as already achieved
X. Other (please specify)

[Answer]: A - Local proof SLOs PASS; production SLO compliance and burn rate are NOT MEASURABLE. **Timestamp:** 2026-07-19T19:23:33Z. **Mode:** guided.

### Q2. What cost-analysis scope is valid?

A. Report no AWS/cloud spend data; optimize measurable local build/runtime toil only
B. Estimate a hypothetical AWS production bill now
C. Omit cost and efficiency analysis entirely
X. Other (please specify)

[Answer]: A - Report no AWS/cloud spend data; optimize measurable local build/runtime toil only. **Timestamp:** 2026-07-19T19:23:33Z. **Mode:** guided.

### Q3. How should current configuration drift be handled?

A. Record host-port overrides, telemetry gaps, and clean-build timeout as reviewed drift/follow-ups; do not auto-reconcile
B. Replace shared Compose defaults with this Windows host's alternate ports
C. Ignore local drift because acceptance passed
X. Other (please specify)

[Answer]: A - Record host-port overrides, telemetry gaps, and clean-build timeout as reviewed drift/follow-ups; do not auto-reconcile. **Timestamp:** 2026-07-19T19:23:33Z. **Mode:** guided.

### Q4. What product/user feedback may be inferred?

A. No real-user feature inference; carry only synthetic workflow and operational findings
B. Treat synthetic acceptance users as representative customer behavior
C. Propose a broad shell and module redesign from the local runs
X. Other (please specify)

[Answer]: A - No real-user feature inference; carry only synthetic workflow and operational findings. **Timestamp:** 2026-07-19T19:25:20Z. **Mode:** guided.

### Q5. Which toil-reduction work should be prioritized?

A. Build-context reduction, telemetry readiness checks, and reusable acceptance/performance runners
B. Automatic container restart and policy rollback without human approval
C. No further automation
X. Other (please specify)

[Answer]: A - Build-context reduction, telemetry readiness checks, and reusable acceptance/performance runners. **Timestamp:** 2026-07-19T19:25:20Z. **Mode:** guided.

## Decision Check

The final answer set must remain consistent with the local `deployment-log`, proof-only `slo-config`, inactive application signals in `dashboards` and `alarms`, single-user `load-test-results`, and human-authority constraints in `incident-plan`.
