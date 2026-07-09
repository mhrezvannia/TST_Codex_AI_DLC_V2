# Domain Entities - U08 Local Runtime, Seed, Smoke, Readiness

## Evidence Structures

| Structure | Fields |
| --- | --- |
| `ReadinessCheck` | `name`, `url`, `status`, `durationMs`, `category`, `message` |
| `SmokeScenario` | `name`, `steps`, `expected`, `actual`, `result` |
| `DemoAgreementSeed` | Agreement header, terms, expected lookup query. |
| `RuntimeMode` | `host-runtime`, `compose`, `blocked` |

## Seed Data Relationships

The demo agreement references customer, trade lane, commodity, charge code, and currency IDs from Shared Platform seed data.

## Output

Readiness evidence should be machine-readable enough for scripts and human-readable enough for the workflow record.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.