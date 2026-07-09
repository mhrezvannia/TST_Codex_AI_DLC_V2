# Frontend Components - U09 Booking Handoff Contract

## Applicability

U09 does not add a separate frontend surface, but U06's `ActiveLookupPreview` is the local visual proof of the Booking handoff.

## Preview Behavior

| State | UI behavior |
| --- | --- |
| Match | Show agreement number and terms. |
| No match | Show no-match reason and keep query editable. |
| Invalid query | Show validation summary. |
| Service unavailable | Show non-destructive error banner. |

## Handoff

The preview and documented examples should use the same API contract Booking will consume.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.