# Scalability Design - U05

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Keep controllers stateless. Active lookup contract stays HTTP-based for future Booking scale-out.

## Growth

Rate limiting and caching can be added at proxy/API gateway later.
