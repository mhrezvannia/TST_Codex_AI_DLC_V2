# Observability Setup Questions - W2-03

## Context

Deployment Execution stopped before mutation, so there is no deployed W2-03
candidate and no production telemetry baseline. The existing unit designs
consistently name Prometheus, Grafana, OpenTelemetry, and Jaeger for the
isolated local stack. They define acceptance thresholds but explicitly avoid
claiming production availability SLOs, paging ownership, or cloud services.

These questions consume `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Questions

### Q1. Which telemetry platform should this stage configure?

A. Existing local stack (recommended) - Prometheus/Grafana metrics and
OpenTelemetry/Jaeger traces, expressed as version-controlled configuration
that can be installed when Wave A is deployable.

B. AWS stack - CloudWatch dashboards/alarms/log queries and X-Ray tracing;
requires an approved AWS account, region, IAM posture, and deployment scope.

C. Provider-neutral specification only - define signals and queries without
binding them to the existing local tools.

X. Other (please specify)

[Answer]: A. Existing local stack (recommended)

### Q2. What SLO posture should apply before production evidence exists?

A. Acceptance objectives only (recommended) - quantify the approved p95/p99
targets over each fixed isolated acceptance run; leave production
availability/error-budget SLOs explicitly unapproved until a representative
baseline and owner exist.

B. Provisional 30-day production SLOs - assign availability and error-budget
targets now despite the absence of a production environment or baseline.

C. No SLOs - retain only raw metrics and pass/fail test thresholds.

X. Other (please specify)

[Answer]: A. Acceptance objectives only (recommended)

### Q3. Which dashboard layout should be the primary operational view?

A. Release-and-journey first (recommended) - one W2-03 release dashboard plus
Charge authority, pricing/manual fallback, Booking/repricing, BFF/security,
database/resource, and evidence-preservation drill-down views.

B. Service-only - one dashboard each for Charge, Booking, BFF, and databases.

C. Minimal - one page containing only latency, traffic, errors, and saturation.

X. Other (please specify)

[Answer]: A. Release-and-journey first (recommended)

### Q4. What log and evidence retention should this stage declare?

A. Bounded local evidence only (recommended) - retain redacted acceptance
evidence under the intent record within the U06 size caps; keep runtime
production retention and archival policy unapproved.

B. Thirty-day local runtime retention - configure persistent local log
retention for 30 days in addition to repository evidence.

C. Production-style retention - configure 90-day searchable logs plus archive,
which requires storage, privacy, and ownership decisions outside this intent.

X. Other (please specify)

[Answer]: A. Bounded local evidence only (recommended)

### Q5. How should alerts be routed in the current no-deploy state?

A. Evidence-only gates (recommended) - define severity, threshold, owner role,
and runbook link, but do not configure SNS, paging, chat, or automated
remediation until an environment and named channel are approved.

B. Local console notifications - emit local notifications without an external
delivery guarantee.

C. External paging - configure a real notification endpoint now.

X. Other (please specify)

[Answer]: A. Evidence-only gates (recommended)

### Q6. What tracing posture should be used for isolated acceptance?

A. W3C/OpenTelemetry with full acceptance sampling (recommended) - propagate
one safe trace context across edge, BFF, Booking, Charge, and database spans;
export to Jaeger only when the observability profile is enabled, with
redaction and bounded trace retention.

B. Metrics and logs only - omit distributed traces from this intent.

C. X-Ray tracing - use AWS X-Ray instrumentation and sampling rules.

X. Other (please specify)

[Answer]: A. W3C/OpenTelemetry with full acceptance sampling (recommended)

## Confirmation

The consolidated answer set was confirmed before artifact generation.
