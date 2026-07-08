# Reliability Design - U06 Reference Data App

## Reliability Goals

U06 keeps reference administration usable through expired sessions, authorization uncertainty, backend dependency failures, validation errors, conflicts, and event-status outages. It preserves prior usable state and draft data wherever that helps recovery.

## Session and Authorization

Expired sessions are sent through the approved auth flow with a safe return path. Authorization unavailable fails protected actions closed. Read screens show authorization unavailable where needed rather than silently granting or hiding data.

## Service Failure Behavior

`reference-data-service` unavailability returns standard BFF error envelopes and UI retry/support states with correlation id. `identity-service` unavailability is distinguished from validation and service dependency errors.

Filter/search validation or network errors keep the previous usable result set visible. Event status unavailable renders a non-blocking warning while canonical record detail remains visible.

## Form Recovery

Validation errors preserve draft values and map to field and summary errors. Duplicate business keys and stale record conflicts are distinguished so users can correct or refresh without losing context. Deactivate/reactivate confirmations name the target record and consequence.

## Health, Smoke, and Accessibility

Smoke checks cover authenticated access, read-only and denied behavior, reference list/detail, one authorized mutation, and event status display where available. Status labels use text and accessible names, not color alone. Dynamic validation/status/freshness warnings use appropriate live-region behavior.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
