# Feedback Optimization Questions

## Inputs

These questions consume `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`.

## Questions

### Q1. Are the configured SLOs being met?

A. No - local readiness is blocked and live service SLOs cannot be proven yet.
B. Yes - all local and live runtime SLOs are met.
C. Partially - only live services are blocked.
D. Unknown - no SLO evidence exists.
E. Defer SLO assessment to a hosted environment.
X. Other (please specify)

[Answer]: A

### Q2. What is the current error budget posture?

A. Error budget is frozen until prerequisites and local services are healthy.
B. Error budget is healthy enough for promotion.
C. Error budget should be ignored for local validation.
D. Error budget applies only to production.
E. Error budget needs new SLO definitions before use.
X. Other (please specify)

[Answer]: A

### Q3. Are there cost optimization opportunities now?

A. Yes - avoid idle local/cloud resources and postpone AWS spend until local runtime passes.
B. Yes - buy reserved capacity immediately.
C. No - cost is not relevant to this intent.
D. Unknown - wait for one month of production telemetry.
E. Move all services to managed cloud before local validation.
X. Other (please specify)

[Answer]: A

### Q4. Is there configuration or infrastructure drift?

A. Yes - intended Compose/runtime inventory differs from the actual workstation state.
B. No - provisioned resources match the deployment design.
C. Unknown - drift detection is impossible locally.
D. Only AWS drift exists.
E. Only application code drift exists.
X. Other (please specify)

[Answer]: A

### Q5. What operational toil should be automated next?

A. Prerequisite install checks, image build/start, live contract verification, seed apply, and readiness re-run.
B. Manual UI smoke testing only.
C. Manual database edits.
D. Production incident escalation.
E. No automation is needed.
X. Other (please specify)

[Answer]: A

## Decision Summary

The next feedback loop stays on Shared Platform local functionality. The system should not move into downstream business modules until the local runtime is operational, seeded, contract-verified live, and smoke-tested end to end.
