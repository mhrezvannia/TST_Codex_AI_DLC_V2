# Reliability Design - U01

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Backend health does not depend on reference-data, identity, Kafka, or Docker. UI route renders degraded dependency status without crashing.

## Recovery

Service restart is sufficient for skeleton recovery.
