# Observability Setup Questions

## Questions

### Q1. What golden signals should be tracked?

A. Latency, traffic, errors, saturation, event freshness, auth denials  
B. CPU only  
C. Logs only  
D. None  
X. Other

[Answer]: A - Derived from `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

### Q2. What SLOs are defined?

A. Local availability, BFF latency, seed/contract correctness, event freshness  
B. Production SLOs only  
C. No SLOs  
D. Vendor defaults  
X. Other

[Answer]: A - SLOs are local/on-prem Shared Platform readiness targets.

### Q3. What dashboard layout is needed?

A. Shared Platform overview with service health, readiness, BFF, auth, reference data, outbox, and runtime blockers  
B. One dashboard per CPU metric  
C. No dashboards  
D. Cloud-only dashboards  
X. Other

[Answer]: A - Existing Grafana dashboard is the local base.

### Q4. What log retention and aggregation rules apply?

A. Local structured logs with correlation ids; retention policy deferred to hosted environment  
B. Permanent local logs  
C. No logs  
D. CloudWatch retention only  
X. Other

[Answer]: A - Local/on-prem scope uses structured logs and correlation ids, with hosted retention deferred.

### Q5. What tracing is needed?

A. OTel collector and Jaeger local traces for BFF-to-service requests  
B. No tracing  
C. X-Ray only  
D. Vendor SaaS only  
X. Other

[Answer]: A - Existing observability profile includes OTel collector and Jaeger.
