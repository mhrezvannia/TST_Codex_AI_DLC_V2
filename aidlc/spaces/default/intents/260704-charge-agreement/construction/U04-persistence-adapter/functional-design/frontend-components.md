# Frontend Components - U04 Persistence Adapter

## Applicability

U04 has no direct frontend components.

## UI Contract Impact

The persistence adapter enables the UI to rely on durable agreement list/detail state once U05 and U06 expose it.

## Handoff

U05 maps repository-backed application results to REST responses. U06 consumes those REST responses through BFF route handlers.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.