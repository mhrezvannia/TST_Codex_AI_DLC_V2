# Business Logic Model - U05 REST API and OpenAPI

## Scope

U05 exposes the application service through REST and a documented OpenAPI contract. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Endpoint Workflow

| Endpoint | Behavior |
| --- | --- |
| `GET /api/charge-agreements` | Search agreements with filters and pagination. |
| `POST /api/charge-agreements` | Create Draft agreement. |
| `GET /api/charge-agreements/{id}` | Return agreement detail. |
| `PUT /api/charge-agreements/{id}` | Update Draft agreement with expected version. |
| `POST /api/charge-agreements/{id}/approve` | Approve valid Draft agreement. |
| `POST /api/charge-agreements/{id}/suspend` | Suspend Approved agreement. |
| `POST /api/charge-agreements/{id}/expire` | Expire agreement. |
| `GET /api/charge-agreements/active-lookup` | Return active match or no-match response for Booking. |

## Request Handling

1. Normalize correlation ID.
2. Validate DTO shape.
3. Map DTO to application command/query.
4. Invoke application service.
5. Map result or error to HTTP response.

## Contract Handoff

U06 consumes the same endpoints through Next.js BFF route handlers. U09 documents active lookup examples for Booking.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U05 covers required CRUD, lifecycle, error, correlation, and active-lookup contract behavior.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.