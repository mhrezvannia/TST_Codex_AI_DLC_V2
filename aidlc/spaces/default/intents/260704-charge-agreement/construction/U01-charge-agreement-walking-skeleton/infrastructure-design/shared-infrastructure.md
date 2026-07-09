# Shared Infrastructure - U01

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

Use existing monorepo tooling, local reverse proxy, and Shared Platform host-runtime conventions. U01 does not own shared databases or brokers.

## Boundaries

Charge Agreement skeleton owns only ports `8084` and `3002` plus route `/charge-agreements/`.
