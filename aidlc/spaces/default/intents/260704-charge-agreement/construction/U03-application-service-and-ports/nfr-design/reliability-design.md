# Reliability Design - U03

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Represent no-match lookup as a typed result. Distinguish validation, not-found, conflict, forbidden, and upstream-unavailable application errors.

## Recovery

Expected version protects retry behavior for updates.
