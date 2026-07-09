# Shared Infrastructure - U06

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

Uses monorepo frontend tooling, shared local auth conventions, reference-data API, charge-agreement API, and reverse proxy.

## Boundaries

The UI owns workbench state and BFF normalization only.
