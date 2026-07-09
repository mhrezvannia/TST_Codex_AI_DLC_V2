# Scalability Design - U09

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Keep contract stateless. Backend can scale independently from future Booking workers.

## Growth

Avoid Booking-specific database coupling that would block service scaling.
