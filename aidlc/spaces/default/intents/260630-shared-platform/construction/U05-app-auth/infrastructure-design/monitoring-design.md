# Monitoring Design - U05 Auth App

## Metrics and KPIs

U05 emits metrics for sign-in render duration, callback handler duration, Keycloak exchange duration, identity-service session summary duration, current-session latency, sign-out handler duration, request-access submit duration, auth error classes, callback failure classes, and session invalid/expired outcomes.

Metric labels remain bounded by route, operation, result, error class, dependency, and environment.

## Logging Strategy

Structured BFF logs include app, route, operation, safe subject summary where available, result, error code, dependency, and correlation id. Logs exclude access tokens, refresh tokens, ID tokens, PKCE verifier, nonce secrets, client secrets, raw provider responses, stack traces, and sensitive claims.

## Tracing Configuration

OpenTelemetry spans cover sign-in start, callback validation, Keycloak token exchange, session creation, identity-service summary call, current-session, sign-out, access denied, and request-access routing.

## Alerts and Dashboards

Dashboards track callback failure rate, Keycloak latency, identity-service latency, session-summary failures, sign-out failures, request-access volume, and auth app health/readiness.

## Incident Response

Safe error pages and denied states expose correlation ids for support handoff. Operators diagnose through BFF logs/traces and dependency metrics rather than raw browser token state.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
