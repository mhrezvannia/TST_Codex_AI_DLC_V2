# Domain Entities - UOW-01 Local Runtime Packaging

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Entities

| Entity | Attributes | Lifecycle |
| --- | --- | --- |
| PrerequisiteCheck | id, name, requiredVersion, actualVersion, status, remediation | discovered -> classified -> reported |
| PortCheck | port, serviceName, status, owningProcess | discovered -> classified -> reported |
| RuntimeProfile | name, composeProfiles, appMode, serviceMode | selected -> validated -> used |
| ReadinessSummary | status, blockers, warnings, evidencePaths | created -> written -> consumed by smoke/quality |

## Relationships

- `ReadinessSummary` contains many `PrerequisiteCheck` and `PortCheck` results.
- `RuntimeProfile` determines which services are checked and which ports are required.

