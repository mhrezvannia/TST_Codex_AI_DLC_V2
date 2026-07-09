# Design System Mapping - LinerCore Enterprise

## Source Context

This artifact consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It maps the Claude UI export direction to implementable frontend conventions using the existing Next.js/Yarn/Turbo workspace and shared `@erp/*` package approach.

## Visual Baseline

| Area | Refined decision |
|---|---|
| Typography | IBM Plex Sans for UI text; IBM Plex Mono for identifiers, codes, timestamps, currency, and technical references where available |
| Density | Operational density, compact spacing, scannable tables, no marketing-style hero screens |
| Color | Light workspace, navy shell accents, blue active states, teal/green success, amber warning, red critical |
| Shape | Panels and cards at small radius, generally 8px or less unless existing components require otherwise |
| Layout | Left rail, top bar, content grid, contextual right rail, route tabs/ribbon |
| Motion | Minimal transitions for panel open/close, status changes, and loading states |

## Component Mapping

| UX component | Implementation target | Notes |
|---|---|---|
| App shell | Shared layout in enterprise app | Top bar, rail, landmarks, skip link |
| Icon rail | Shared navigation component | Icons require labels/tooltips/accessibility names |
| Journey ribbon | Booking-context component | Shows Agreement -> Booking -> Track and trace -> D&D only inside journey |
| Evidence rail | Shared aside panel | Pricing, D&D, audit, movement status, runtime health |
| Data table | Shared table component | Sort/filter/keyboard row actions, responsive column priority |
| Stepper | Shared workflow component | Step states: active, blocked, complete, overridden |
| Status chip | Shared status primitive | Text plus icon; color never sole signal |
| Exception drawer | Shared drawer/modal pattern | Focus trap, escape behavior, return focus |
| Audit timeline | Shared timeline component | CorrelationId, occurred/received times, user actions |
| Health tile | Operations component | Service state, runbook link, trace/log link |

## Module Component Inventory

### Shared Platform

- ReferenceDataTable.
- CapabilityAssignmentPanel.
- EventOutboxStatus.
- ContractHealthPanel.
- SeedValidationPanel.

### Charge And Agreement

- AgreementHeader.
- ApplicabilityEditor.
- TariffChargeGrid.
- PricingSimulationPanel.
- DndRuleEditor.
- PricingAuditRail.

### Booking

- BookingFactsForm.
- BookingStepper.
- PricingEvidenceRail.
- CapacityValidationPanel.
- AmendmentDiffPanel.
- BookingLifecycleTimeline.

### CMM

- JourneyHeader.
- ExpectedMovementTimeline.
- MovementCaptureForm.
- MovementValidationPanel.
- StatusDerivationRail.
- MovementEventHistory.

### Operations

- WorkQueueTable.
- ExceptionDetailDrawer.
- RuntimeHealthGrid.
- FlowEvidencePanel.
- ObservabilityLinksPanel.
- RunbookLauncher.

## State Tokens

| Token | Meaning | Example |
|---|---|---|
| `state.info` | Neutral operational state | Draft, pending |
| `state.success` | Completed and verified | Confirmed, published |
| `state.warning` | Needs attention but not failed | Late movement, stale data |
| `state.danger` | Blocking failure | Contract failed, service down |
| `state.manual` | Manual fallback path | Manual pricing, D&D review |
| `state.readonly` | Permission-limited state | Read-only audit access |

## Accessibility Mapping

| Component | Requirement |
|---|---|
| Rail navigation | `nav` landmark, accessible labels, visible focus, current page state |
| Tables | Header semantics, keyboard row expansion, sortable controls with announcements |
| Drawers/modals | Focus trap, labelled title, escape/close, return focus |
| Status chips | Icon/text label, non-color-only state |
| Steppers | Ordered list semantics, current step, blocked reason |
| Timelines | Ordered list with event type, time, status, and source |
| Live updates | Polite live region for pricing, movement status, D&D result, runtime health |

## Frontend Package Alignment

The implementation should stay aligned with the existing frontend structure in `component-inventory.md` and `team-practices.md`:

- Next.js applications under `apps/*`.
- Shared UI primitives under `packages/ui`.
- Shared auth under `packages/auth`.
- Shared API client utilities under `packages/api-core`.
- Shared configuration under `packages/config`.
- Strict TypeScript and no explicit `any`.

No new component stack is introduced by this stage. Application Design can decide whether the enterprise UI is one integrated app or multiple apps behind the reverse proxy.

## Source Traceability

| Source | Design-system implication |
|---|---|
| `wireframes.md` | Confirms operational shell, module workspaces, right rail, and journey ribbon |
| `user-flow.md` | Confirms flow-specific state transitions and error recovery |
| `stories.md` | Confirms personas, permissions, and user-visible workflows |
| `requirements.md` | Confirms real APIs/events, security, no fake completion, runtime, and contracts |
| `team-practices.md` | Confirms existing stack alignment and testable walking skeleton stance |

