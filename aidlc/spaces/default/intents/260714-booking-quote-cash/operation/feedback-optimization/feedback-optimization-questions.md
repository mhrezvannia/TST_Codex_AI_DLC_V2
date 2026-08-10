# Feedback Optimization Questions - W1-01

## Answers

### Q1. Are W1 SLOs being met?

A. Configured SLOs exist, but live SLO compliance is BLOCKED because full Compose did not reach the workload and smoke gates
B. Yes, all SLOs are met
C. No, measured latency failed
D. SLOs are not defined
E. SLOs should be ignored until production
X. Other (please specify)

[Answer]: A

### Q2. What is the error budget state?

A. Local release error budget is consumed for this run because the manifest is not PASS and nginx/user-path smoke is not proven
B. Error budget is healthy
C. Error budget is unknown but release can proceed
D. Error budget applies only to production
E. Error budget can be reset by deleting artifacts
X. Other (please specify)

[Answer]: A

### Q3. What cost optimization opportunities exist?

A. Avoid pulling/starting heavyweight observability images unless needed for the live-proof profile, and cache required images before runs
B. Replace Kafka with noop messaging
C. Remove observability permanently
D. Skip performance evidence
E. Reset volumes to reduce disk use
X. Other (please specify)

[Answer]: A

### Q4. What drift or configuration issue needs attention?

A. Docker image/proxy access to `docker.elastic.co` is the active environment drift from the intended full Compose profile
B. PostgreSQL is on the wrong host port
C. Messaging is noop
D. The dashboard source is missing W1 services
E. No drift exists
X. Other (please specify)

[Answer]: A

### Q5. What should feed into the next iteration?

A. Fix Docker image access/cache and rerun full live acceptance with a new run ID before claiming W1 complete
B. Start unrelated features immediately
C. Merge without live proof
D. Treat direct service probes as enough
E. Remove the live acceptance gate
X. Other (please specify)

[Answer]: A

## Source Coverage

These answers consume `dashboards.md`, `alarms.md`, `slo-config.md`, `deployment-log.md`, `load-test-results.md`, and `incident-plan.md`.
