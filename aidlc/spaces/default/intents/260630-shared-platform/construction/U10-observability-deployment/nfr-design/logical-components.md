# Logical Components - U10 Observability Deployment

## Component Overview

U10 standardizes observability and deployment readiness across `identity-service`, `reference-data-service`, U04 publishing, `apps/auth`, `apps/reference-data`, Docker Compose profiles, Nginx routing, Vault references, registry conventions, health endpoints, smoke checks, ELK, Prometheus/Grafana, and Jaeger/OpenTelemetry.

## Components

### Correlation Middleware

Accepts a valid inbound correlation id or generates one at the first trusted boundary. It propagates the id through BFF calls, service calls, audit/change history, outbox rows, Kafka event envelopes, JSON logs, trace spans, status APIs, and safe UI states.

### Structured Logging Adapter

Emits JSON logs with stable safe fields and masking for secrets, tokens, credentials, restricted payloads, and unsafe PII. Logs are sent to an ELK-compatible collection path.

### Metrics Exporter

Exposes Prometheus-compatible metrics for request latency, errors, authorization decisions, outbox lag, event freshness, publication attempts, health, and smoke status using bounded labels.

### Trace Exporter

Uses OpenTelemetry to propagate trace/span context and exports to Jaeger through the approved collector path. Spans record dependency timings and failure boundaries.

### Publication Health Reporter

Consumes U04 outbox and publisher status to expose pending, in-progress, retrying, published, failed, recovery-required, lag, and freshness signals.

### Health Endpoint Set

Provides liveness and readiness endpoints for services and BFF apps. Readiness includes required dependency checks, while liveness remains process-focused.

### Smoke Runner

Runs environment smoke checks for auth, reference read/write path, persistence, outbox/event evidence, correlation evidence, health, and basic observability signal presence.

### Deployment Descriptor Set

Defines Docker Compose core and optional observability profiles, Nginx routing, image registry names/tags, Vault secret references, health/smoke commands, and deployment records.

### Dashboard and Search Pack

Provides Grafana dashboards, ELK searches, and Jaeger trace views organized around health, smoke, latency, errors, authorization outcomes, outbox lag, freshness, publication attempts, and correlation lookup.

### Safe Status Surfaces

Lets existing apps show safe correlation ids, event ids, publication status, denied/error states, and support handoff information without creating a custom operations portal.

## Dependency Direction

Services and apps emit logs, metrics, and traces. Outbox and publisher components emit publication health. Health/smoke consume runtime endpoints and status APIs. Dashboards consume collected telemetry. Deployment descriptors bind the on-prem runtime shape without introducing public cloud or Kubernetes-only assumptions.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.
