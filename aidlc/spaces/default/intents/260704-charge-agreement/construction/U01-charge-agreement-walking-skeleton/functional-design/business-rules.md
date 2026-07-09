# Business Rules - U01 Charge Agreement Walking Skeleton

## Runtime Rules

| ID | Rule | Source |
| --- | --- | --- |
| U01-R1 | The backend skeleton must not include persistence or domain dependencies beyond what is needed to boot. | `unit-of-work.md`, `components.md` |
| U01-R2 | The UI must be an actual workbench route for Charge Agreements, not a view-only claim of module completion. | `requirements.md`, `mockups.md` |
| U01-R3 | Health readiness for U01 is limited to process health and page availability. | `services.md`, `bolt-plan.md` |
| U01-R4 | Docker/Compose failures are reported separately from host-runtime success. | `requirements.md`, `team-practices.md` |

## Validation Rules

1. Backend compile must include the new service in Maven reactor wiring.
2. Frontend compile must include the new app in workspace package wiring.
3. Local ports must not conflict with existing `3000`, `3001`, `8082`, `8083`, or `8088`.
4. The UI shell must have semantic headings and landmarks.

## Error Handling

If downstream Shared Platform services are offline, U01 displays status as degraded but keeps the skeleton route available.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.