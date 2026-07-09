# Unit Story Map - LinerCore Enterprise

## Source Context

This artifact consumes `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. It maps every story from `stories.md` to one or more units from `unit-of-work.md`.

## Story To Unit Map

| Story | Primary unit | Supporting units |
|---|---|---|
| US-SP-001 - Authenticate enterprise users | `shared-platform-identity-security` | `local-runtime-foundation`, `enterprise-web-shell-and-workflows` |
| US-SP-002 - Enforce role and capability access | `shared-platform-identity-security` | `observability-quality-operation-readiness` |
| US-SP-003 - Maintain enterprise reference data | `shared-platform-reference-events` | `enterprise-web-shell-and-workflows`, `enterprise-seed-migrations-devex` |
| US-SP-004 - Publish reference-data events | `shared-platform-reference-events` | `contract-platform-catalog`, `observability-quality-operation-readiness` |
| US-SP-005 - Trace requests and events | `observability-quality-operation-readiness` | `shared-platform-identity-security`, all integration units |
| US-SP-006 - Validate executable contracts | `contract-platform-catalog` | `observability-quality-operation-readiness` |
| US-CHG-001 - Manage approved customer agreements | `charge-agreement-pricing-domain` | `shared-platform-reference-events`, `enterprise-web-shell-and-workflows` |
| US-CHG-002 - Determine active agreement or tariff fallback | `charge-agreement-pricing-domain` | `booking-charge-pricing-integration` |
| US-CHG-003 - Return itemised pricing | `charge-agreement-pricing-domain` | `booking-charge-pricing-integration`, `enterprise-web-shell-and-workflows` |
| US-CHG-004 - Handle pricing resilience | `booking-charge-pricing-integration` | `charge-agreement-pricing-domain`, `booking-lifecycle-domain`, `observability-quality-operation-readiness` |
| US-CHG-005 - Configure D&D rules | `charge-agreement-pricing-domain` | `enterprise-web-shell-and-workflows`, `enterprise-seed-migrations-devex` |
| US-CHG-006 - Calculate D&D results | `dnd-pricing-integration` | `charge-agreement-pricing-domain`, `booking-lifecycle-domain` |
| US-CHG-007 - Keep Charge out of Booking ownership | `observability-quality-operation-readiness` | `charge-agreement-pricing-domain`, `booking-lifecycle-domain` |
| US-BKG-001 - Create a booking | `booking-lifecycle-domain` | `shared-platform-reference-events`, `enterprise-web-shell-and-workflows` |
| US-BKG-002 - Price a booking | `booking-charge-pricing-integration` | `charge-agreement-pricing-domain`, `booking-lifecycle-domain` |
| US-BKG-003 - Resolve manual pricing | `booking-lifecycle-domain` | `charge-agreement-pricing-domain`, `enterprise-web-shell-and-workflows` |
| US-BKG-004 - Validate capacity and routing | `booking-lifecycle-domain` | `enterprise-seed-migrations-devex`, `enterprise-web-shell-and-workflows` |
| US-BKG-005 - Confirm and publish booking | `booking-confirmed-journey-integration` | `booking-lifecycle-domain`, `contract-platform-catalog` |
| US-BKG-006 - Amend and reconfirm a booking | `booking-lifecycle-domain` | `booking-confirmed-journey-integration`, `container-movement-domain` |
| US-BKG-007 - Consume movement status | `movement-status-booking-integration` | `booking-lifecycle-domain`, `container-movement-domain` |
| US-BKG-008 - Trigger D&D request | `dnd-pricing-integration` | `movement-status-booking-integration`, `charge-agreement-pricing-domain` |
| US-CMM-001 - Create journey from confirmed booking | `booking-confirmed-journey-integration` | `container-movement-domain`, `booking-lifecycle-domain` |
| US-CMM-002 - Derive expected movements | `container-movement-domain` | `booking-confirmed-journey-integration` |
| US-CMM-003 - Capture movement events | `container-movement-domain` | `enterprise-web-shell-and-workflows` |
| US-CMM-004 - Validate DCSA-aligned movements | `container-movement-domain` | `shared-platform-reference-events`, `observability-quality-operation-readiness` |
| US-CMM-005 - Handle event ordering problems | `container-movement-domain` | `movement-status-booking-integration` |
| US-CMM-006 - Publish movement status | `movement-status-booking-integration` | `container-movement-domain`, `contract-platform-catalog` |
| US-UI-001 - Use Claude UI baseline for navigation and layout | `enterprise-web-shell-and-workflows` | `observability-quality-operation-readiness` |
| US-UI-002 - Operate booking workflows in UI | `enterprise-web-shell-and-workflows` | `booking-lifecycle-domain`, all Booking integration units |
| US-UI-003 - Operate commercial pricing and D&D workflows in UI | `enterprise-web-shell-and-workflows` | `charge-agreement-pricing-domain`, `dnd-pricing-integration` |
| US-UI-004 - Operate movement workflows in UI | `enterprise-web-shell-and-workflows` | `container-movement-domain`, `movement-status-booking-integration` |
| US-UI-005 - Supervise exceptions and audit trail | `enterprise-web-shell-and-workflows` | `observability-quality-operation-readiness`, Booking/Charge/CMM units |
| US-RUN-001 - Start full local runtime | `local-runtime-foundation` | `enterprise-seed-migrations-devex`, `observability-quality-operation-readiness` |
| US-RUN-002 - Support development profiles | `local-runtime-foundation` | `enterprise-seed-migrations-devex` |
| US-RUN-003 - Seed deterministic enterprise data | `enterprise-seed-migrations-devex` | all service-domain units |
| US-RUN-004 - Validate contracts in CI and local | `contract-platform-catalog` | `observability-quality-operation-readiness` |
| US-RUN-005 - Observe enterprise flows | `observability-quality-operation-readiness` | all integration units |
| US-RUN-006 - Prove no fake completion | `observability-quality-operation-readiness` | all units |

## Unit Story Coverage

| Unit | Stories covered |
|---|---|
| `local-runtime-foundation` | US-SP-001, US-RUN-001, US-RUN-002 |
| `contract-platform-catalog` | US-SP-004, US-SP-006, US-BKG-005, US-CMM-006, US-RUN-004 |
| `shared-platform-identity-security` | US-SP-001, US-SP-002, US-SP-005 |
| `shared-platform-reference-events` | US-SP-003, US-SP-004, US-CHG-001, US-BKG-001, US-CMM-004 |
| `charge-agreement-pricing-domain` | US-CHG-001, US-CHG-002, US-CHG-003, US-CHG-005, US-CHG-006, US-CHG-007, US-UI-003 |
| `booking-lifecycle-domain` | US-BKG-001, US-BKG-003, US-BKG-004, US-BKG-006, US-BKG-007, US-UI-002 |
| `container-movement-domain` | US-CMM-001, US-CMM-002, US-CMM-003, US-CMM-004, US-CMM-005, US-CMM-006, US-UI-004 |
| `booking-charge-pricing-integration` | US-CHG-002, US-CHG-003, US-CHG-004, US-BKG-002, US-UI-002 |
| `booking-confirmed-journey-integration` | US-BKG-005, US-BKG-006, US-CMM-001, US-CMM-002 |
| `movement-status-booking-integration` | US-BKG-007, US-BKG-008, US-CMM-005, US-CMM-006 |
| `dnd-pricing-integration` | US-CHG-006, US-BKG-008, US-UI-003 |
| `enterprise-seed-migrations-devex` | US-SP-003, US-CHG-005, US-BKG-004, US-RUN-001, US-RUN-002, US-RUN-003 |
| `enterprise-web-shell-and-workflows` | US-SP-001, US-SP-003, US-CHG-001, US-CHG-003, US-CHG-005, all US-UI stories, selected Booking/CMM support stories |
| `observability-quality-operation-readiness` | US-SP-002, US-SP-004, US-SP-005, US-SP-006, US-CHG-004, US-CHG-007, US-CMM-004, all US-RUN stories |

## Intra-Unit Story Ordering

These are implementation-order hints inside each unit only. They do not select the cross-unit Bolt sequence.

| Unit | Intra-unit story order |
|---|---|
| `local-runtime-foundation` | US-RUN-002 -> US-RUN-001 |
| `contract-platform-catalog` | US-SP-006 -> US-RUN-004 -> event/API contract support for US-SP-004, US-BKG-005, US-CMM-006 |
| `shared-platform-identity-security` | US-SP-001 -> US-SP-002 -> US-SP-005 |
| `shared-platform-reference-events` | US-SP-003 -> US-SP-004 -> support validations for Charge/Booking/CMM stories |
| `charge-agreement-pricing-domain` | US-CHG-001 -> US-CHG-002 -> US-CHG-003 -> US-CHG-005 -> US-CHG-006 -> US-CHG-007 |
| `booking-lifecycle-domain` | US-BKG-001 -> US-BKG-003 -> US-BKG-004 -> US-BKG-006 -> lifecycle parts of US-BKG-007/US-BKG-008 |
| `container-movement-domain` | US-CMM-002 -> US-CMM-003 -> US-CMM-004 -> US-CMM-005 -> status derivation part of US-CMM-006 |
| `booking-charge-pricing-integration` | US-BKG-002 -> US-CHG-004 -> integration assertions for US-CHG-002/US-CHG-003 |
| `booking-confirmed-journey-integration` | US-BKG-005 -> US-CMM-001 -> reconciliation support for US-BKG-006 |
| `movement-status-booking-integration` | status event path for US-CMM-006 -> Booking consumer for US-BKG-007 -> boundary input support for US-BKG-008 |
| `dnd-pricing-integration` | US-BKG-008 trigger -> US-CHG-006 calculation/result -> UI evidence hooks for US-UI-003 |
| `enterprise-seed-migrations-devex` | US-RUN-003 -> seed support for US-SP-003, US-CHG-005, US-BKG-004 -> docs/profile support for US-RUN-001/US-RUN-002 |
| `enterprise-web-shell-and-workflows` | US-UI-001 -> US-UI-002 -> US-UI-003 -> US-UI-004 -> US-UI-005 |
| `observability-quality-operation-readiness` | US-SP-005 -> US-RUN-005 -> US-RUN-006 -> operation evidence for US-RUN-001/US-RUN-004 |

## Cross-Cutting Story Notes

- US-SP-005 and US-RUN-005 cut across all event/API flows and are owned by `observability-quality-operation-readiness` for evidence, with implementation hooks in each service/integration unit.
- US-RUN-006 applies to every unit as a completion guardrail.
- US-UI stories are implemented primarily in `enterprise-web-shell-and-workflows`, but they must call real APIs from domain and integration units.
- Manual pricing, operational override, movement exceptions, D&D fallback, and contract failures surface through both service units and the UI/audit unit.

## Coverage Verification

- Every story in `stories.md` is assigned to at least one primary unit.
- Every unit in `unit-of-work.md` has at least one mapped story.
- Cross-module stories are mapped to both primary business owner and supporting integration/evidence units.
- Boundary stories from `requirements.md` are preserved: Booking triggers D&D but does not calculate it; Charge calculates pricing/D&D but does not mutate Booking lifecycle; CMM reports movements/status but does not decide D&D relevance.

