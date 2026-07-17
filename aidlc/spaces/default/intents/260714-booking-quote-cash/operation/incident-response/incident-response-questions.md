# Incident Response Questions - W1-01

## Answers

### Q1. What are the most likely W1 failure modes?

A. Docker image/proxy pull failure during full Compose start
B. nginx Booking user path unavailable while direct services are healthy
C. Outbox relay, Kafka, Schema Registry, or DLT failure in the Booking/CMM event chain
D. Charge pricing or Reference Data dependency failures
E. All of the above
X. Other (please specify)

[Answer]: E

### Q2. What escalation path should apply for local live-proof incidents?

A. P1 blocks W1 completion and is owned by the release runner plus service owner; P2 records evidence and is reviewed before merge
B. Ignore local incidents because they are not production
C. Treat every local warning as a production page
D. Escalate only UI failures
E. Escalate only backend failures
X. Other (please specify)

[Answer]: A

### Q3. What automated remediation is allowed?

A. Safe diagnostics, pre-pull retries, Compose config/preflight reruns, and new run IDs after remediation
B. Reset volumes to make tests pass
C. Edit detector output
D. Switch to noop messaging locally
E. Bypass nginx and accept direct-service probes as release smoke
X. Other (please specify)

[Answer]: A

### Q4. What communication procedure applies during a blocked live proof?

A. Record blocker, affected gate, evidence path, and next action in operation artifacts before requesting approval
B. Only mention the blocker in chat
C. Delete failed evidence and rerun silently
D. Claim partial stack health as release health
E. Wait until production to document it
X. Other (please specify)

[Answer]: A

### Q5. What RTO/RPO targets apply to W1 local evidence?

A. RTO is a new acceptance run after blocker removal; RPO is zero loss of retained evidence and no database volume reset for proof
B. RTO and RPO do not matter locally
C. RPO allows deleting failed evidence
D. RTO allows skipping blocked gates
E. RPO allows overwriting manifests
X. Other (please specify)

[Answer]: A

## Source Coverage

These answers consume `dashboards.md`, `alarms.md`, `reliability-design.md`, `security-design.md`, and `deployment-architecture.md`. They also use the blocked `deployment-execution` evidence as the concrete incident scenario for W1.
