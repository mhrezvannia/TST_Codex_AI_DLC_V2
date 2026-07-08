# Security Design - U06 Reference Data App

## Security Goals

U06 preserves the BFF security model for reference administration. Browser clients do not call backend services directly, protected workflows are authorized through BFF/server paths, sensitive data is minimized, and UI affordances do not replace backend authorization.

## Access Control

BFF route handlers call `identity-service` or approved session claims before protected workflows. Protected mutations fail closed when authorization data is unavailable. Users with read but not write permission receive read-only list/detail experiences, while users without read permission see access denied with correlation id and request-access path where available.

Control hiding and disabling are usability signals only. `reference-data-service` and BFF authorization remain authoritative for mutation and protected read behavior.

## Data Protection

Party/Customer screens show classification and access cues when PII or commercial sensitivity is present. UI-facing data excludes internal database keys, raw tokens, secrets, stack traces, unauthorized policy internals, and direct service credentials.

Event id and correlation id are copyable only where safe and with accessible labels.

## Validation and Errors

Service validation maps to fields and summaries without exposing stack traces. Duplicate, stale, authorization, not-found, dependency-unavailable, and validation failures remain distinguishable. Access-denied states show requested area/action and correlation id without leaking sensitive policy detail.

Request-access affordances do not grant permissions automatically.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
