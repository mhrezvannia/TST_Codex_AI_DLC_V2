# Frontend Components - U02 Agreement Domain Model

## Applicability

U02 is backend domain-only. It has no direct frontend implementation.

## UI Contract Impact

The frontend will later mirror these domain concepts:

| Domain concept | Future UI use |
| --- | --- |
| `AgreementStatus` | Status badges and enabled/disabled lifecycle actions. |
| `ChargeBasis` | Term basis select options. |
| Domain validation errors | Form validation summary and inline field messages. |
| Activity entries | Detail panel audit timeline. |

## Handoff

U06 consumes these concepts through DTOs exposed by U05, not by importing domain code into the frontend.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.