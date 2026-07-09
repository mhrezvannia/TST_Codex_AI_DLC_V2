# Shared Infrastructure - U07

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

Uses existing identity and reference-data services. Does not own those services or their schema.

## Access Boundaries

Read reference data; validate IDs; never mutate Shared Platform records.
