# Security Design - U03 Reference Domain API

## Security Goals

U03 protects canonical reference state by allowing access only through approved provider and admin APIs. It prevents direct database consumers, rejects unsafe inputs before repository calls, applies U02 authorization for protected operations, and records structured audit evidence for successful mutations and sensitive reads.

Party and Customer data are treated as confidential where they contain PII or commercially sensitive attributes. Provider DTOs expose business-safe identifiers and display values, not internal database keys or persistence internals.

## Access Control

Admin mutation controllers require authenticated caller context, correlation id, requested operation, target reference set, and target record identity before invoking the U02 authorization adapter. Authorization denial or dependency uncertainty stops the flow before validation side effects, persistence, audit append, or domain-fact creation.

Provider reads use authorization where the functional model requires protected reads. Read-only denials return a standard error or read-denied signal without leaking record existence beyond the approved error contract.

## Input and Domain Validation

All commands validate reference set, business key, display value, status transition, relationship ids, version, reason, filter fields, search terms, sort keys, and pagination bounds. Validation rejects duplicate active keys, orphan ports, Location/Port re-parenting, inactive relationship references, invalid TradeLane region pairs, stale versions, unsupported include flags, and unbounded search/filter requests.

Validation happens in application/domain services before persistence. Repository ports receive typed criteria rather than raw caller strings.

## Data Exposure

Provider DTOs include only stable id, approved code, display label, status, version, type, and relationship summaries required by consumers. Admin detail/history endpoints may include before/after values, actor, reason, and correlation metadata only for authorized callers.

Internal primary keys, persistence schema names, raw audit storage fields, and future expansion fields remain internal to the service boundary.

## Audit and Evidence

Successful admin mutations append change history with actor, operation, timestamp, before/after values, reason, record id, version, and correlation id. Sensitive Party/Customer reads and protected admin actions emit structured security logs with operation, subject, reference set, result, and correlation id.

Audit history is append-only at the application boundary. Later storage hardening can add tamper-evidence without changing the functional flow.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
