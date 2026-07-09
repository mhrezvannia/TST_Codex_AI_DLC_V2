# Interaction Specification - LinerCore Enterprise

## Source Context

This interaction specification consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It turns the refined mockups into route, component, state, API/event, and permission behavior for downstream Application Design.

## Global Interaction Model

### Navigation

- The left rail changes module workspace and preserves user context.
- The top global search searches booking ID, container ID, agreement ID, customer reference, correlationId, and exception ID.
- The contextual journey ribbon appears only when the user is inside a booking journey. It is not the whole application navigation.
- Breadcrumbs show module, object type, and identifier.

### Object Identity

| Object | Visible identifier |
|---|---|
| Booking | booking ID, bookingRevision, customer reference, correlationId |
| Agreement | agreement ID, version, status, effective date |
| Container journey | booking ID, container/equipment ID, journey ID, bookingRevision |
| Movement event | event ID, source, occurred time, received time |
| D&D result | request ID, result ID, rule ID, pricingRef, correlationId |
| Exception | exception ID, module, owner, severity, correlationId |

### State Language

Use explicit operational labels: Draft, Pending pricing, Pricing failed, Manual pricing required, Capacity failed, Confirmed, Journey pending, Movement invalid, Status published, D&D pending, D&D manual review, Runtime degraded.

## Component Specifications

### EnterpriseShell

Purpose: frame all authenticated enterprise work.

Props/data:

- currentUser, roles, capabilities.
- environment, healthSummary.
- activeModule.
- globalSearchQuery.

Behavior:

- Hide or disable actions by capability.
- Preserve current module and object state when opening exception details.
- Announce route changes for screen readers.

### WorkQueueTable

Purpose: cross-module actionable work.

Columns:

- Severity, module, object reference, status, owner, SLA/SLO impact, correlationId, updated time, next action.

Behavior:

- Filter by module, owner, severity, and exception type.
- Row open navigates to the owning module detail route.
- Bulk assignment requires supervisor or platform capability.
- Empty state shows "No assigned work" and module shortcuts.

### BookingStepper

Purpose: represent booking progression without hiding validation.

Steps:

1. Request.
2. Capacity.
3. Pricing.
4. Confirm.

Behavior:

- Step states: not started, active, completed, blocked, overridden.
- Confirmation button remains disabled until required gates pass or approved fallback exists.
- Stepper exposes blocking reason and link to exception or validation panel.

### PricingEvidenceRail

Purpose: show Charge result inside Booking.

Fields:

- pricingRef, agreement/tariff source, itemised charges, total, currency, idempotency key, correlationId, timeout/retry state.

Behavior:

- Re-price creates a new request only when Booking state allows it.
- Manual pricing link opens exception workflow.
- Result details show audit source and line-item basis.

### MovementTimeline

Purpose: show expected and actual movement state.

Behavior:

- Expected movement rows are derived from booking route and equipment facts.
- Actual events can be expanded to show occurred time, received time, source, validation state, and ordering warnings.
- Duplicate/late/out-of-order states use icon plus text, not color alone.

### DndOutcomePanel

Purpose: show Booking trigger evidence and Charge calculation evidence.

Behavior:

- Left side displays movement boundary and Booking trigger decision.
- Right side displays Charge result with free time, chargeable days, rate, total, rule ID, and audit.
- Manual review path appears for timeout, no rule, conflict, or rejected result.
- Labels must make ownership clear: "Booking trigger" and "Charge calculation".

### ContractHealthPanel

Purpose: prevent fake integration readiness.

Behavior:

- Shows OpenAPI, Avro, AsyncAPI, HTTP Pact, message-pact, and Schema Registry compatibility.
- Markdown-only contract documents display as "authority exists, executable contract missing".
- Failed contract opens owning module and latest verification output.

## Flow Interactions

### Flow 1 - Booking creation to confirmation

1. Ben opens `/booking/new`.
2. UI loads customer/reference data and validates capabilities.
3. Ben enters booking facts and saves draft.
4. Ben requests pricing.
5. Booking sends pricing request; UI enters pending pricing.
6. Charge returns pricing result; UI displays itemised charges.
7. Ben runs operational validation.
8. If validation passes, Confirm becomes enabled.
9. Confirm creates confirmed booking state and publishes `booking.confirmed`.

Failure handling:

- Pricing timeout opens manual pricing.
- Capacity failure opens operational exception.
- Event publication failure shows outbox retry and prevents false completion claim.

### Flow 2 - Confirmed booking to CMM journey

1. CMM consumes `booking.confirmed`.
2. Journey appears in Movement workspace.
3. Expected moves are visible with revision source.
4. Booking detail shows CMM journey status.

Failure handling:

- No CMM journey after event publication shows event lag/outbox state.
- Revision mismatch opens CMM reconciliation exception.

### Flow 3 - Movement capture to Booking lifecycle

1. Omar opens journey.
2. Omar captures planned, estimated, or actual movement.
3. CMM validates movement.
4. CMM derives status and publishes `containermovement.status`.
5. Booking consumes status and updates lifecycle.

Failure handling:

- Invalid movement creates correction task.
- Duplicate is linked to original event.
- Late/out-of-order event shows warning and status recalculation or exception.

### Flow 4 - D&D trigger to result

1. Booking receives movement status.
2. Booking evaluates D&D boundary.
3. Booking sends `pricing.dnd-request`.
4. Charge calculates free time, rates, chargeable days, and total.
5. Booking stores result and shows D&D outcome.

Failure handling:

- No rule, conflict, timeout, or rejected result opens D&D manual review.
- UI never presents CMM as D&D decision owner.

### Flow 5 - Booking amendment and reconciliation

1. Ben opens confirmed booking and starts amendment.
2. UI shows diff and affected checks.
3. Booking conditionally reprices and revalidates.
4. Ben reconfirms.
5. bookingRevision increments.
6. CMM reconciles expected journey/movements.

Failure handling:

- Repricing failure opens pricing exception.
- Reconciliation failure opens CMM exception.

## Permission Matrix

| Action | Booking desk | Commercial manager | Movement controller | Supervisor | Platform admin | Read-only auditor |
|---|---|---|---|---|---|---|
| Create booking | Yes | No | No | Optional | No | No |
| Approve manual pricing | No | Yes | No | Optional | No | No |
| Configure D&D rules | No | Yes | No | No | No | No |
| Capture movement | No | No | Yes | Optional | No | No |
| Approve operational override | No | No | No | Yes | No | No |
| Manage reference data | No | Optional | No | No | Yes | No |
| View audit | Own module | Own module | Own module | Cross-module | Cross-module | Cross-module |

## Error And Recovery Patterns

| Error | UI response | Recovery |
|---|---|---|
| Permission denied | Explain missing capability, show request-access path if allowed | Platform admin assigns capability |
| Pricing timeout | Pending rail changes to timeout with retry/manual path | Retry or manual pricing |
| No applicable agreement/tariff | Manual pricing exception | Commercial manager resolves |
| Invalid movement | Field and row-level validation | Correct or quarantine |
| Duplicate movement | Link duplicate to original | No duplicate status |
| Late/out-of-order movement | Timeline warning and recalculation/exceptions | Review by movement controller |
| Schema compatibility failure | Contract panel blocks readiness | Contract owner fixes |
| Service unavailable | Degraded panel and affected flows | Runbook, logs, traces |

## Traceability

| Source | Interaction coverage |
|---|---|
| `wireframes.md` | Converts rough screens into component and state behavior |
| `user-flow.md` | Defines Flow 1 through Flow 5 interactions |
| `stories.md` | Maps US-SP, US-CHG, US-BKG, US-CMM, US-UI, and US-RUN stories to UI actions |
| `requirements.md` | Preserves module ownership, contracts, runtime, security, and no-fake-completion requirements |
| `team-practices.md` | Supports enterprise walking skeleton and testable local runtime evidence |

