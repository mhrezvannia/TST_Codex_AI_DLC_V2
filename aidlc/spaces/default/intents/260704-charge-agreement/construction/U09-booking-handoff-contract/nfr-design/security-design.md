# Security Design - U09

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Booking consumes the REST contract with auth/correlation context. The response exposes only terms needed by Booking.

## Boundary

Direct database access by Booking is forbidden.
