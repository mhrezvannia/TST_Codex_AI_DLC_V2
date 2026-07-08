# Security Requirements - U10 Observability Deployment

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines safe structured logs, audit/outbox correlation, frontend/BFF status surfaces, Vault references, and approved observability stack. `business-rules.md` requires masking secrets/tokens/restricted payloads, safe reason codes, safe dashboard/status links, and no browser operational credentials. `requirements.md` fixes NFR-006 through NFR-012, C-002, C-006, and no public cloud.

## Telemetry Safety Requirements

- Logs must mask secrets, tokens, credentials, and restricted payload values.
- Authorization logs include safe decision outcome and reason code only.
- Publication failures expose safe reason code and affected event id without payload secrets or stack traces.
- Browser code must not receive raw token material, secret claims, broker credentials, or observability stack credentials.
- Metric labels must avoid high-cardinality or sensitive values.

## Access Requirements

- Dashboard links/references appear only in internal/operator-authorized contexts.
- Status APIs and UI states expose safe correlation ids, event ids, and statuses.
- Non-local secrets are represented as Vault references, not literal values.
- On-prem stack is required; public-cloud managed observability is prohibited.

## Audit and Compliance Requirements

- Administrative actions, role changes, failed authorization attempts, sensitive reads, publication failures, and smoke failures emit structured access or operational logs.
- Correlation id links UI errors, logs, traces, audit/change history, outbox rows, and event envelopes.
- Evidence supports later audit without exposing secrets.

## Non-Goals

- No custom operations portal with independent credentials.
- No public external telemetry surface.
- No raw payload log archive.

