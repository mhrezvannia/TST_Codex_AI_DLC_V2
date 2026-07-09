# Business Logic Model - UOW-05 Reference Data BFF Clients

## Context

This Functional Design consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Request Workflow

1. Receive browser request at Next.js route handler.
2. Create or read correlation id.
3. Resolve safe session summary.
4. For permission routes, call identity-service effective-permissions or authorize.
5. For reference routes, call reference-data-service with correlation id and actor context.
6. Map backend response to UI view model.
7. Map backend errors to UI-safe status and payload.

## Mutation Workflow

1. Validate request body shape at BFF boundary.
2. Check permission through identity-service.
3. If denied, return 403 without calling reference-data-service mutation.
4. If allowed, call reference-data-service mutation.
5. Return persisted record, history/status links, and correlation id.

