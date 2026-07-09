# Frontend Components - U08 Local Runtime, Seed, Smoke, Readiness

## UI Evidence Points

| Component | Runtime evidence |
| --- | --- |
| `RuntimeStatusBanner` | Shows backend, auth, reference-data, and mode status. |
| `AgreementTable` | Shows seeded or created agreement. |
| `AgreementDetail` | Shows approved status and terms. |
| `ActiveLookupPreview` | Shows lookup match or no-match. |

## Local Behavior

The workbench should remain usable when optional Compose-only services are blocked, as long as host-runtime backend and Shared Platform dependencies are available.

## Handoff

Screens and smoke output together prove the module is functionally runnable.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.