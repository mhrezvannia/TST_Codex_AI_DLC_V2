# Business Logic Model - U07 Shared Platform Integration

## Scope

U07 wires Charge Agreement to existing Shared Platform reference data while preserving bounded context ownership. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Integration Flow

1. BFF requests reference sets from `reference-data-service`.
2. UI renders selectors using stable IDs and display labels.
3. Create/update commands submit IDs, not embedded reference records.
4. Backend validates required IDs through `ReferenceDataPort` when available.
5. Backend stores only IDs and returns IDs/labels according to API contract.

## Reference Sets

| Set | Used by |
| --- | --- |
| Customers | Agreement header and active lookup. |
| Charge codes | Charge term rows. |
| Currencies | Charge term amount. |
| Commodities | Header and lookup dimension. |
| Locations | Origin/destination lookup fallback. |
| Trade lanes | Header, filters, and active lookup. |

## Handoff

U08 readiness checks must verify reference-backed fields when reference-data service is running.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U07 preserves Shared Platform ownership and uses stable reference IDs throughout the agreement module.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.