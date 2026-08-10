# Observability Setup Questions - W1-01

## Answers

### Q1. Which golden signals should the W1 quote-to-cash run track?

A. API latency, traffic, errors, and resource saturation for Booking, Charge, CMM, Reference Data, Identity, and the BFF apps
B. Event lifecycle health for Booking, CMM, Charge, Kafka, Schema Registry, outbox tables, retry, and DLT paths
C. Business correctness for quote, booking confirmation, returned CMM status, and UI projection freshness
D. Deployment evidence health for the signed live proof manifest, nginx smoke path, and detector gates
E. All of the above
X. Other (please specify)

[Answer]: E

### Q2. Which SLOs and SLIs apply before production baselines exist?

A. Use only local live-proof SLOs and defer production SLOs until measured baselines exist
B. Adopt strict production SLOs immediately
C. Track only infrastructure uptime
D. Track only application latency
E. Track only audit detector results
X. Other (please specify)

[Answer]: A

### Q3. What dashboard layout should the team use for W1?

A. One shared W1 Quote-to-Cash overview with journey, service, event relay, and deployment evidence panels
B. Separate dashboard per microservice only
C. Raw Prometheus explorer only
D. Logs-only view
E. No dashboard until production
X. Other (please specify)

[Answer]: A

### Q4. What log retention and aggregation rules apply for this intent?

A. Retain local live-proof artifacts and redacted logs under the run directory; production retention is deferred
B. Commit all raw logs to git
C. Drop logs after every run
D. Store secrets and payload dumps for debugging
E. Use unbounded local logs
X. Other (please specify)

[Answer]: A

### Q5. What distributed tracing instrumentation is needed?

A. Propagate correlation IDs through nginx, Booking UI/BFF, Booking service, Charge, CMM, Reference Data, Kafka messages, and outbox relays
B. Trace only frontend page loads
C. Trace only database calls
D. Disable tracing for local proof
E. Trace with high-cardinality PII labels
X. Other (please specify)

[Answer]: A

## Source Coverage

This question set consumes `performance-design.md`, `security-design.md`, `reliability-design.md`, `monitoring-design.md`, `infrastructure-services.md`, and the `deployment-execution` evidence. The answers keep the W1 observability scope on real local Compose proof rather than a production cloud rollout.
