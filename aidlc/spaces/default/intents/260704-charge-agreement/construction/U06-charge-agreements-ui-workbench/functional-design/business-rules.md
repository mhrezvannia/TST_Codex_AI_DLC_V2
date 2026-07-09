# Business Rules - U06 Charge Agreements UI Workbench

## UI Rules

| ID | Rule | Source |
| --- | --- | --- |
| U06-R1 | The workbench must support create and edit, not only viewing. | `requirements.md` FR-3.3 |
| U06-R2 | Validation errors preserve form input. | `requirements.md` FR-3.5 |
| U06-R3 | Approval controls are disabled when domain/API state makes approval invalid. | `requirements.md` FR-3.4 |
| U06-R4 | Active lookup no-match is displayed as a normal result. | `requirements.md` FR-4.4 |
| U06-R5 | The UI does not create or mutate Shared Platform reference records. | `requirements.md` FR-5.3 |

## Accessibility Rules

1. Use semantic page landmarks and headings.
2. Inputs require labels.
3. Validation summary receives focus after failed save.
4. Status changes are announced using accessible status text.

## Failure Rules

BFF/API failures show non-destructive banners. The editor draft stays in memory after failed requests.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.