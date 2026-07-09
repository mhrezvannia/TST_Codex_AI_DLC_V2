# NFR Requirements Questions - U03 Application Service and Ports

## Questions

### Q1. What latency target applies?

A. Use cases complete under 100 ms p95 excluding downstream storage/reference latency.
B. Use cases may exceed 100 ms p95 and are measured only during API integration.
C. Only API latency should be measured.
X. Other (please specify)

[Answer]: A

### Q2. What security applies?

A. `AuthorizationPort` mediates all read, write, status, audit, and reference-read actions using canonical strings such as `charge-agreement/agreement:read`, `charge-agreement/agreement:update`, and `shared-platform/reference-data:read`.
B. Authorization is checked only in the REST adapter.
C. Local bypass disables use-case authorization.
X. Other (please specify)

[Answer]: A

### Q3. What reliability applies?

A. No-match lookup is a normal successful result, not an exception path; retry safety is explicit where commands carry expected version or idempotency keys.
B. No-match lookup should throw and rely on API mapping.
C. All commands are automatically retry-safe.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
