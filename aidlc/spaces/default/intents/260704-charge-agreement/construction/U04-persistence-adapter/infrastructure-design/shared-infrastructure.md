# Shared Infrastructure - U04

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

Postgres is shared local infrastructure, but Charge Agreement owns its schema/tables.

## Boundaries

Do not share database tables with Booking or Reference Data.
