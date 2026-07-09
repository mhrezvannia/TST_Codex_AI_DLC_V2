# Reliability Design - U05

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Use stable `ApiErrorResponse` fields and preserve no-match lookup as HTTP 200. Expose standard Spring health.

## Recovery

Clients can retry read endpoints; writes rely on expected version for conflict safety.
