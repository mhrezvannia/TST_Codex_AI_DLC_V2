# Security Design - U04

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Use Spring/JDBC/JPA parameter binding; no dynamic SQL from raw user input. Agreement rows store commercial IDs and metadata only.

## Audit

Lifecycle activity rows preserve actor, time, action, and reason.
