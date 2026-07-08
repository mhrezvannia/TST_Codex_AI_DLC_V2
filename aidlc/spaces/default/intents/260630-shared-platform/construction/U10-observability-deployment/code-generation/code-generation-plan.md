# Code Generation Plan - U10 Observability Deployment

## Source Trace

This plan implements U10 from `business-logic-model.md`, `business-rules.md`, `security-design.md`, and `deployment-architecture.md`.

U10 adds safe correlation, logging, observability descriptors, smoke/readiness checks, and deployment-readiness metadata for the on-prem Docker Compose profile. It must not create downstream runtime modules, public-cloud observability services, or a custom operations portal.

## Implementation Steps

- [x] Step 1: Add shared observability helpers.
  - Traceability: BR-U10-001 through BR-U10-010, BR-U10-032 through BR-U10-034.
  - Add correlation id validation/generation and structured log masking helpers in `@erp/utils`.

- [x] Step 2: Add observability stack descriptors.
  - Traceability: BR-U10-011 through BR-U10-018, BR-U10-027 through BR-U10-031.
  - Add Prometheus, OpenTelemetry collector, Grafana provisioning, dashboard placeholders, and Jaeger/ELK local descriptors under `infrastructure/observability/`.

- [x] Step 3: Wire Compose observability profile.
  - Traceability: BR-U10-022 through BR-U10-031.
  - Update `compose.yaml` observability services with ports, volumes, and collector/prometheus/grafana config.

- [x] Step 4: Add smoke/readiness validation.
  - Traceability: BR-U10-024 through BR-U10-026.
  - Add a Node smoke script that validates observability descriptors, correlation-safe evidence, and Compose profile wiring without requiring live services.

- [x] Step 5: Add tests and documentation.
  - Traceability: Standard test strategy.
  - Add helper tests and observability smoke tests. Update observability README with safe telemetry and Vault-reference guidance.

- [x] Step 6: Run verification.
  - Traceability: U10 security and readiness rules.
  - Run helper tests, smoke validation, Compose config validation, package typecheck, source scans for secrets/public-cloud/downstream runtime, and record limitations.

## Test Strategy

The active strategy is Standard. U10 must include executable tests for correlation/log masking and static smoke validation for descriptors. Live Grafana/Prometheus/Jaeger/ELK startup is optional in this shell and should be verified later through Docker Compose on a suitable runner.

## Approval

This plan is ready for review before U10 implementation.
