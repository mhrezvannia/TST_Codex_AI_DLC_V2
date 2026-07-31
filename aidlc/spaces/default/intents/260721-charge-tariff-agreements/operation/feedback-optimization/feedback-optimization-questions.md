# Feedback and Optimization Questions - W2-03

## Context

The `dashboards`, `alarms`, and `slo-config` are approved designs but are not
installed. The `deployment-log` says no deployment was attempted, the
`load-test-results` are BLOCKED/not executed, and the `incident-plan` is not
activated. There is no production monitoring, cost, incident, user-behavior,
or infrastructure-drift dataset to analyze.

## Questions

### Q1. How should the final SLO report classify the current state?

A. Unmeasured and BLOCKED (recommended) - report no compliance percentage,
burn rate, or error budget because the defined acceptance objectives were not
executed and production SLOs were never approved.

B. Assume compliant - infer SLO PASS from design and source tests.

C. Assume breached - treat unavailable measurements as observed SLO failure.

X. Other (please specify)

[Answer]: A. Unmeasured and BLOCKED (recommended)

### Q2. How should cost analysis be handled?

A. No measured cost (recommended) - report local/runtime/cloud cost as unknown,
identify the inputs needed for later cost-per-run/transaction analysis, and
avoid AWS price estimates.

B. Estimate AWS spend - invent an AWS topology, region, usage, and monthly
cost.

C. Ignore cost - omit both current limitations and the measurement plan.

X. Other (please specify)

[Answer]: A. No measured cost (recommended)

### Q3. How should infrastructure/configuration drift be reported?

A. Desired-state only, runtime unassessed (recommended) - compare approved
artifacts to the no-deploy record, report that no runtime drift scan occurred,
and list the exact future comparison evidence.

B. No drift - claim equality because nothing was deployed.

C. Cloud drift scan - run AWS Config/CloudFormation drift without an AWS
environment or stacks.

X. Other (please specify)

[Answer]: A. Desired-state only, runtime unassessed (recommended)

### Q4. What should the improvement backlog prioritize?

A. Evidence-enablement first (recommended) - unblock immutable candidate build,
Booking dependency resolution, Docker/manager guard, native writer, dashboards,
and live acceptance before feature expansion or right-sizing.

B. Feature expansion first - add broader rating dimensions, workflows, and
cloud scaling before proving the current slice.

C. Cost optimization first - right-size unmeasured infrastructure.

X. Other (please specify)

[Answer]: A. Evidence-enablement first (recommended)

### Q5. How should the feedback loop close?

A. Close with a gated backlog (recommended) - finish this intent with explicit
BLOCKED/live-evidence work and proposals; do not automatically start a new
Ideation cycle.

B. Start new Ideation automatically - create a new intent without a separate
user request.

C. Discard unresolved evidence - mark the slice operationally complete and
drop the blockers.

X. Other (please specify)

[Answer]: A. Close with a gated backlog (recommended)

## Confirmation

The consolidated answer set was confirmed before artifact generation.
