# Frontend Components - U01 Charge Agreement Walking Skeleton

## Component Tree

| Component | Responsibility |
| --- | --- |
| `ChargeAgreementWorkbench` | First-screen usable workbench surface. |
| `RuntimeStatusBanner` | Shows backend/reference/auth status. |
| `AgreementListPanel` | Empty-state list placeholder with stable dimensions. |
| `AgreementDetailPanel` | No-selection placeholder. |
| `AgreementEditorPanel` | Disabled skeleton for the future create/edit flow. |
| `ActiveLookupPanel` | Disabled skeleton for the future Booking lookup preview. |

## State Model

| State | Source |
| --- | --- |
| `moduleInfo` | BFF call to backend module info endpoint or local fallback. |
| `runtimeStatus` | BFF aggregation of module info and environment flags. |
| `selectedAgreementId` | Local state, initially absent. |

## Interaction Rules

1. The primary screen is the workbench, not a landing page.
2. Buttons that are not implemented yet must be disabled with clear labels.
3. The layout must not jump when backend status changes.
4. No create/edit claim is made until U06 implements real write behavior.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.