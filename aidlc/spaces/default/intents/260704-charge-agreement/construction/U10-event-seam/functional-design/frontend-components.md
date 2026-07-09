# Frontend Components - U10 Event Seam

## Applicability

U10 has no direct frontend component.

## UI Impact

The UI may later show event publication state in operational diagnostics, but MVP workbench behavior does not depend on live event publication.

## Handoff

Frontend workflows should not wait for Kafka. They rely on synchronous API results from U05/U06.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.