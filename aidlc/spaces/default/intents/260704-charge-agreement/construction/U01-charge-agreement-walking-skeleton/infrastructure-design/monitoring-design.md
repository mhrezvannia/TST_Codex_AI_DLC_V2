# Monitoring Design - U01

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Checks

Monitor backend `/actuator/health`, module info, UI route, and reverse proxy route. Record host-runtime evidence only.

## Alerts

Local alerts are readiness failures with port and URL hints.
