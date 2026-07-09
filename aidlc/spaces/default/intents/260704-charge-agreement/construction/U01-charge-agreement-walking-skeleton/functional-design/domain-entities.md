# Domain Entities - U01 Charge Agreement Walking Skeleton

## Entity Scope

U01 does not introduce the full `CustomerAgreement` aggregate. It creates only boundary descriptors needed for bootstrapping and module discovery.

## Structures

| Structure | Fields | Purpose |
| --- | --- | --- |
| `ModuleInfo` | `serviceName`, `mode`, `version`, `capabilities` | Backend response proving the module endpoint works. |
| `WorkbenchStatus` | `backend`, `identity`, `referenceData`, `authMode` | UI view model showing local runtime state. |
| `CapabilityFlag` | `key`, `enabled`, `description` | Communicates skeleton versus implemented behavior. |

## Lifecycle

`ModuleInfo` is read-only and generated at request time. There is no persistence lifecycle in U01.

## Relationships

The skeleton references `identity-service` and `reference-data-service` as future consumers, but does not call or mutate them in this unit.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.