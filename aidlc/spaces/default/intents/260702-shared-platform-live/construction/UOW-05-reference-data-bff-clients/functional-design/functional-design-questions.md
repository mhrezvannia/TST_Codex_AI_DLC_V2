# Functional Design Questions - UOW-05 Reference Data BFF Clients

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Questions and Answers

- Data source: [Answer]: BFF routes call identity-service and reference-data-service server-side, not local arrays.
- Error mapping: [Answer]: map 401, 403, 404, 409, 422, and 503 into UI-safe payloads with correlation id.
- Session: [Answer]: derive BFF context from auth session summary and request headers.

