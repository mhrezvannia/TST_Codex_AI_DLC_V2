# Incident Response Questions

## Questions

### Q1. What are the most likely failure modes?

A. Runtime blocked, BFF upstream unavailable, auth bypass misconfiguration, seed/contract failures, outbox freshness breach  
B. Only CPU overload  
C. Only frontend crashes  
D. None  
X. Other

[Answer]: A - Derived from `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

### Q2. What escalation path applies now?

A. Local owner/developer first, platform owner second, security owner for auth bypass incidents  
B. External production on-call  
C. No escalation  
D. Cloud provider support first  
X. Other

[Answer]: A - Current scope is local/on-prem Shared Platform validation.

### Q3. What automated remediation is possible?

A. Re-run readiness/smoke, restart Compose services after Docker is available, disable unsafe bypass flags  
B. Auto-delete data  
C. Auto-promote deployment  
D. None  
X. Other

[Answer]: A - Remediation must preserve local state and evidence.

### Q4. What communication procedure applies?

A. Record evidence paths, blocker, owner, and next action in the workflow/runbook  
B. No communication  
C. Public status page  
D. Production incident bridge  
X. Other

[Answer]: A - Local blocked incidents require concise evidence and next-action tracking.

### Q5. What RTO/RPO targets apply?

A. Local validation RTO same workday; no production RPO yet  
B. 5-minute production RTO  
C. No target  
D. 30-day RPO  
X. Other

[Answer]: A - Production RTO/RPO is out of scope; local validation should be restored same workday after prerequisites are available.
