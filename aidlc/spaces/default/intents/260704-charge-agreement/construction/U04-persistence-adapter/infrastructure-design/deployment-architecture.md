# Deployment Architecture - U04

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Architecture

`charge-agreement-service` connects to Postgres using the existing local runtime pattern. Schema changes are owned by the service dataaccess module.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable.
