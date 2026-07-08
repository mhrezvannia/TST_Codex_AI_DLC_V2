# Monitoring Design - U09 Local Seed Compose

## Metrics and KPIs

U09 records service wait duration, seed run duration, per-pack timing, per-target-service timing, created/updated/skipped/failed counts, smoke duration, dependency timeout count, validation failures, immutable conflicts, and correlation id.

## Logging Strategy

Seed/smoke logs include seedPackId, seedVersion, target service, validation path, failure category, endpoint, and correlation id. Logs exclude production data, real personal data, passwords, tokens, and secrets.

## Tracing Configuration

Smoke checks propagate correlation ids through BFF/API calls where available, so support can tie local smoke failures to service logs and event/status evidence.

## Alerts and Dashboards

Local optional observability may display seed/smoke status, but core Compose success does not require the observability profile.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
