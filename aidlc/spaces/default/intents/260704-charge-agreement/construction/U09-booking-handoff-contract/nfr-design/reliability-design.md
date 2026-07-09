# Reliability Design - U09

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

No-match remains successful. Invalid query and service outage have stable error responses and correlation IDs.

## Recovery

Booking can retry transient 503 responses but should not retry deterministic validation errors.
