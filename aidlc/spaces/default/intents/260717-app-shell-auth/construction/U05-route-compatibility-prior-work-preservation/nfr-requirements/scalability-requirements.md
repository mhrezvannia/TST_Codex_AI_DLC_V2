# Scalability Requirements - U05 Route Compatibility and Preservation

## Source Context

These scalability requirements consume U05 `business-logic-model.md`, U05 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U05 route compatibility should remain simple and stateless.

## Scaling Requirements

| ID | Requirement | Rationale |
| --- | --- | --- |
| SCALE-01 | Route aliases are deterministic and do not require database or service lookups. | Keeps route handling cheap. |
| SCALE-02 | Compatibility does not duplicate Booking data loading beyond canonical route behavior. | Avoids doubled backend load. |
| SCALE-03 | Preservation checks are build/evidence-time activities, not runtime user-path dependencies. | No runtime scale impact. |
| SCALE-04 | U05 does not add new shell modules or W4-01 migration surfaces. | Keeps navigation scope bounded. |

## Load Assumptions

Compatibility is a local proof concern for existing links. Production legacy-link volume is not specified, but deterministic route mapping should scale with normal shell routing.

## Escalation Triggers

- Compatibility route performs backend calls before redirect/resolution.
- Old and canonical routes both load Booking data for one user action.
- Preservation evidence tooling becomes required runtime dependency.
