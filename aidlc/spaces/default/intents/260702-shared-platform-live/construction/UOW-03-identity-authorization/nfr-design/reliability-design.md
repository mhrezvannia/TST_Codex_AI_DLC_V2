# Reliability Design - UOW-03 Identity Authorization

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Persistence unavailable returns controlled service error.
- Authorization never falls back to allow.
- Role assignment save and audit append are in one service operation boundary.
- Health endpoint reports service up only when required local dependencies are reachable.

## Recovery

- Seed apply can restore local role assignments.

