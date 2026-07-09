# Performance Validation Questions

## Questions

### Q1. What traffic pattern should be validated?

A. Local steady-state BFF read/write smoke and seed/contract checks  
B. Internet-scale peak load  
C. No traffic  
D. Production-only traffic  
X. Other

[Answer]: A - Current scope is local Shared Platform validation.

### Q2. What latency target applies?

A. Reference Data BFF p95 under 500 ms locally  
B. p99 under 10 ms  
C. No latency target  
D. Unknown  
X. Other

[Answer]: A - Matches `slo-config` derived from `performance-design` and `performance-requirements`.

### Q3. What throughput must the system sustain?

A. Local validation throughput: repeated reads plus a small create/edit batch  
B. Production batch load  
C. No throughput  
D. Unknown  
X. Other

[Answer]: A - High-scale production throughput is out of current local scope.

### Q4. Where are likely bottlenecks?

A. Docker runtime, Java services, Identity authorization, Reference Data service, outbox/Kafka, BFF upstream calls  
B. Static HTML only  
C. External cloud network  
D. Unknown  
X. Other

[Answer]: A - Derived from blocked runtime evidence and service topology.
