# Business Rules - U07 Shared Platform Integration

## Integration Rules

| ID | Rule | Source |
| --- | --- | --- |
| U07-R1 | Charge Agreement stores Shared Platform stable IDs only. | `requirements.md` FR-5.1 |
| U07-R2 | The module must not create or mutate reference records. | `requirements.md` FR-5.3 |
| U07-R3 | Missing required reference IDs fail validation. | `requirements.md` FR-2.5 |
| U07-R4 | Reference service outage must not erase in-progress UI input. | `stories.md` US-7 |

## Fallback Rules

1. UI can show cached/fallback demo labels only as local fallback.
2. Backend must not silently accept unknown reference IDs when validation is configured.
3. Readiness evidence must state whether live reference integration or fallback data was used.

## Security Rules

Reference calls use the same local auth/correlation conventions as existing Shared Platform apps.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.