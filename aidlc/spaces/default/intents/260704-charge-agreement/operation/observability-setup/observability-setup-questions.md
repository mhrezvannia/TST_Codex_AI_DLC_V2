# Observability Setup Questions - Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Questions and Answers

### Q1. What golden signals should be tracked?

A. Backend health, module-info latency, UI health, proxy route status, local process availability
B. CPU only
C. Business revenue metrics
D. None
X. Other (please specify)

[Answer]: A

### Q2. What SLOs/SLIs are defined?

A. Local-readiness SLOs for health availability and bounded smoke latency
B. Production 99.99% SLOs
C. No SLOs
D. Cost-only SLOs
X. Other (please specify)

[Answer]: A

### Q3. What dashboard layout is needed?

A. Single local readiness dashboard grouped by backend, frontend, proxy, and build evidence
B. Production executive dashboard
C. Infrastructure cost dashboard only
D. No dashboard
X. Other (please specify)

[Answer]: A

### Q4. What log retention and aggregation rules apply?

A. Local process logs retained as run artifacts for the current validation session
B. CloudWatch Logs retention
C. Long-term regulated archive
D. No logs
X. Other (please specify)

[Answer]: A

### Q5. What tracing instrumentation is needed?

A. Correlation-ready request labels for backend, frontend API, and proxy once live
B. AWS X-Ray immediately
C. OpenTelemetry collector immediately
D. No tracing
X. Other (please specify)

[Answer]: A

## Decisions

Observability is defined for the local host-runtime described by `infrastructure-services` and `monitoring-design`. Cloud dashboards, X-Ray, and anomaly services are deferred until an external deployment target exists.

