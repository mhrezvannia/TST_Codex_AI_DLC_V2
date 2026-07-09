# Scalability Design - U01

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Keep the backend stateless and the UI independently deployable. Use the reverse proxy route as the stable browser entry point.

## Capacity

No data scaling design is needed until API and persistence units are implemented.
