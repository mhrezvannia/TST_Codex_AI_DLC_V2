# Reliability Design - U08

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Report `passed`, `blocked`, and `failed` separately. Host-runtime checks are not invalidated by optional Compose blockers.

## Recovery

Each failed check includes URL, port, or process hint for local repair.
