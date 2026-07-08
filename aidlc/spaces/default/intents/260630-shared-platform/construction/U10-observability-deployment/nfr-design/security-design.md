# Security Design - U10 Observability Deployment

## Security Goals

U10 makes operational evidence useful without exposing secrets, credentials, restricted payloads, raw tokens, unsafe PII, raw stack traces, or observability stack credentials. It supports audit and support workflows through safe correlation rather than raw payload logging.

## Telemetry Safety

Logs mask secrets, tokens, credentials, restricted payload values, production credentials, Vault values, and unsafe PII. Authorization logs include safe outcome and reason code only. Publication failures expose safe reason code, affected event id, status, and correlation id without payload secrets or raw stack traces.

Metric labels avoid high-cardinality and sensitive values. Correlation ids and event ids are used in logs/traces/status lookup, not as metric labels.

## Access Control

Dashboard links and observability references appear only in internal/operator-authorized contexts. Status APIs and UI states expose safe correlation ids, event ids, statuses, and supportable messages. Browser code never receives raw token material, secret claims, broker credentials, Vault secrets, or observability stack credentials.

## Secrets and Environment

Non-local secrets are represented as Vault references, not literal values. The on-prem stack is required; public-cloud managed observability is prohibited for MVP. Deployment records capture versions, config references, check results, and promotion decisions without secret values.

## Audit Support

Administrative actions, role changes, failed authorization attempts, sensitive reads, publication failures, smoke failures, and deployment readiness checks emit structured access or operational logs with correlation id. Evidence supports later audit without exposing raw payload archives.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
