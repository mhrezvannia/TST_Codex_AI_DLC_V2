# Shared Infrastructure - U05

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

Uses reverse proxy, contract directory conventions, identity, reference-data, Postgres, and later event broker seams.

## Boundaries

Future Booking consumes REST/OpenAPI, not Charge Agreement database tables.
