# Performance Design - U04

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Use indexes on customer, status, validity, trade lane, and agreement foreign keys. Enforce pagination on search.

## Validation

Repository tests seed enough data to prove query paths stay bounded locally.
