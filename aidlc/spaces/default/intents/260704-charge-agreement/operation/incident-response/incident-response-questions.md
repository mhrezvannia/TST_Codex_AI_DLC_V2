# Incident Response Questions - Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

## Questions and Answers

### Q1. What are the most likely failure modes?

A. Backend unavailable, frontend unavailable, proxy route broken, sensitive module-info metadata
B. Multi-AZ failover
C. Database corruption
D. Queue backlog
X. Other (please specify)

[Answer]: A

### Q2. What are the escalation paths and on-call rotations?

A. Local developer/operator owns B01/U01 failures until a production owner exists
B. 24x7 production pager
C. Vendor escalation only
D. No escalation
X. Other (please specify)

[Answer]: A

### Q3. What automated remediation is possible?

A. Stop/restart local backend, frontend, and proxy processes
B. Automatic AWS failover
C. Database restore
D. None
X. Other (please specify)

[Answer]: A

### Q4. What communication procedures apply?

A. Record validation failure in stage artifacts and keep deployment unpromoted
B. Customer incident broadcast
C. Regulatory notification
D. No communication
X. Other (please specify)

[Answer]: A

### Q5. What are the RTO/RPO targets?

A. RTO: 15 minutes for local validation restore; RPO: not applicable because U01 has no persistent data
B. RTO: 4 hours; RPO: 1 hour
C. RTO: 24 hours; RPO: 24 hours
D. Unknown
X. Other (please specify)

[Answer]: A

## Decisions

Incident response is local-only for the walking skeleton. Production escalation, AWS Incident Manager, backups, and disaster recovery are deferred until persistent data and production deployment targets exist.

