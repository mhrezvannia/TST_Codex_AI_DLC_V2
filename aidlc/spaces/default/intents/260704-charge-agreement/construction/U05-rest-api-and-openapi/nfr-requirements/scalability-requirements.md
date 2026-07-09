# Scalability Requirements - U05

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Capacity

REST service remains stateless. Pagination is mandatory for search. Active lookup query parameters should stay index-friendly.

## Growth

Future Booking traffic should call active lookup through HTTP without sharing database connections.
