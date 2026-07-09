# Frontend Components - U07 Shared Platform Integration

## Component Additions

| Component | Integration responsibility |
| --- | --- |
| `ReferenceSelect` | Shared selector for customers, lanes, commodities, charge codes, currencies, and locations. |
| `ReferenceStatusBanner` | Shows live/fallback/error state for reference data. |
| `AgreementEditor` | Uses reference-backed fields instead of free-text IDs. |
| `ActiveLookupPreview` | Uses customer/lane/location/commodity selectors. |

## State Model

`referenceOptions` are loaded per set and cached in page state. Failed loads produce set-specific errors while keeping editor draft state intact.

## Interaction Rules

Selectors must expose ID-backed values and human-readable labels. They must not include create-new-reference affordances.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.