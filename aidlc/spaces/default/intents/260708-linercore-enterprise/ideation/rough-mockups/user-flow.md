# User Flow - LinerCore Enterprise

## Source Context

This artifact consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`

The flow design uses `design-inputs/claude-ui-export/` as the preferred visual and UX baseline while replacing prototype behavior with real module behavior.

## Primary User Entry Points

| Entry point | Primary user | Starts from | Leads to |
|-------------|--------------|-------------|----------|
| Work queue | Any authenticated operator | Enterprise Shell | Assigned exceptions, recent bookings, module workspaces |
| New booking | Booking desk | Booking module | Flow 1, then Flow 2 |
| Agreement or tariff edit | Commercial manager | Pricing and Agreement Workspace | Pricing readiness, D&D rules, auditability |
| Movement capture | Operations user | Container Movement Workspace | Flow 3 |
| D&D review | Booking desk or commercial reviewer | D&D Outcome and Exception Queue | Flow 4 |
| Booking amendment | Booking desk | Booking detail | Flow 5 |
| Runtime health | Platform administrator | Operations | Local runtime and Operation evidence |

## Flow 1 - Booking Creation to Confirmation

```text
[Booking desk logs in]
        |
        v
[New booking]
        |
        v
[Enter customer, references, route, POL, POD, equipment, commodity]
        |
        v
[Validate reference data and permissions]
        |
        +-- invalid --> [Inline correction or exception queue]
        |
        v
[Request pricing from Charge]
        |
        +-- timeout/no result --> [Manual pricing workflow]
        |
        v
[Display pricing.result with itemised charges and pricingRef]
        |
        v
[Run operational/capacity validation]
        |
        +-- failed --> [Operational exception queue]
        |
        v
[Confirm booking]
        |
        v
[Persist booking revision and publish booking.confirmed]
```

UI surfaces:

- Booking Creation and Confirmation screen.
- Pricing rail with itemised charges, retry, timeout, manual fallback, pricingRef, and audit link.
- Work queue entries for manual pricing and operational validation exceptions.

Contract and module mapping:

| Step | Owner | Integration |
|------|-------|-------------|
| Booking facts and lifecycle | Customer Booking | Booking API |
| Pricing determination | Charge Calculation & Customer Agreement | `pricing.request`, `pricing.result` |
| Reference validation | Shared Platform | Reference APIs/events |
| Confirmation event | Customer Booking | `booking.confirmed` |

## Flow 2 - Confirmed Booking to CMM Journey

```text
[booking.confirmed published]
        |
        v
[CMM consumes event]
        |
        v
[Create equipment journey]
        |
        v
[Derive expected movements from route, legs, equipment, POL/POD]
        |
        v
[Display journey with expected timeline]
        |
        v
[Reconcile future bookingRevision changes]
```

UI surfaces:

- Booking detail shows "CMM journey created" status.
- Container Journey screen shows expected movement timeline and bookingRevision.
- Operations view shows event lag, schema compatibility, and outbox status.

Contract and module mapping:

| Step | Owner | Integration |
|------|-------|-------------|
| Event publication | Booking | `booking.confirmed` |
| Journey creation | Container Movement Management | Event consumer and CMM API |
| Event transport | Shared Platform | Kafka, Schema Registry, outbox |

## Flow 3 - Movement Capture to Booking Lifecycle Update

```text
[Operations user captures movement]
        |
        v
[Validate against DCSA v2.2 movement rules and journey context]
        |
        +-- duplicate --> [Deduplicate and show duplicate history]
        |
        +-- late/out-of-order --> [Accept defensively and mark sequence warning]
        |
        +-- invalid --> [Movement validation exception]
        |
        v
[Derive movement status]
        |
        v
[Publish containermovement.status]
        |
        v
[Booking consumes status]
        |
        v
[Booking updates lifecycle and operational history]
```

UI surfaces:

- Movement capture form.
- Journey timeline with planned, estimated, and actual states.
- Booking detail lifecycle panel.
- Exception queue for invalid or quarantined movement facts.

Contract and module mapping:

| Step | Owner | Integration |
|------|-------|-------------|
| Movement validation/status | Container Movement Management | CMM API, `containermovement.status` |
| Booking lifecycle update | Customer Booking | Movement-status consumer |
| Event transport | Shared Platform | Kafka, Schema Registry, outbox |

## Flow 4 - Movement Boundary to D&D Result

```text
[Booking receives containermovement.status]
        |
        v
[Booking evaluates lifecycle and D&D boundary relevance]
        |
        +-- not relevant --> [Store movement state only]
        |
        v
[Booking sends pricing.dnd-request]
        |
        +-- timeout/no result --> [Manual D&D review queue]
        |
        v
[Charge applies D&D rules, free time, rates, chargeable days]
        |
        v
[Charge returns pricing.dnd-result]
        |
        v
[Booking stores D&D charge and audit trail]
        |
        v
[User reviews outcome or exception]
```

Ownership guardrail:

- Booking decides whether a movement status triggers a D&D request.
- Charge calculates free time, rates, and chargeable days.
- CMM only reports movements and does not decide D&D relevance.

UI surfaces:

- D&D Outcome screen shows trigger evidence from Booking and calculation evidence from Charge.
- Manual review queue handles timeout, ambiguity, rule conflict, or rejected result.
- Audit trail shows correlationId, movement source, request/result IDs, pricingRef, and user actions.

Contract and module mapping:

| Step | Owner | Integration |
|------|-------|-------------|
| Boundary detection | Customer Booking | Movement-status consumer |
| D&D calculation | Charge Calculation & Customer Agreement | `pricing.dnd-request`, `pricing.dnd-result` |
| Movement truth | Container Movement Management | `containermovement.status` |

## Flow 5 - Booking Amendment and Reconciliation

```text
[Booking desk opens confirmed booking]
        |
        v
[Create amendment]
        |
        v
[Change customer facts, route, equipment, commodity, voyage, or references]
        |
        v
[Evaluate conditional repricing and operational validation]
        |
        +-- repricing needed --> [Request pricing again]
        |
        +-- validation needed --> [Operational/capacity validation]
        |
        v
[Review changes and confirm amendment]
        |
        v
[Increment bookingRevision]
        |
        v
[Publish revised confirmation or revision event as required]
        |
        v
[CMM reconciles journey and expected movements]
```

UI surfaces:

- Booking amendment drawer or full-page edit mode.
- Difference summary before reconfirmation.
- CMM reconciliation banner when route/equipment/voyage facts affect expected movements.
- Exception queue when amendment cannot be reconciled automatically.

Contract and module mapping:

| Step | Owner | Integration |
|------|-------|-------------|
| Amendment lifecycle | Customer Booking | Booking API |
| Conditional repricing | Booking + Charge | `pricing.request`, `pricing.result` |
| Journey reconciliation | Booking + CMM | booking confirmation/revision event path |

## Navigation Flow

```text
[Enterprise Shell]
       |
       +--> [Pricing & Agreements]
       |          |
       |          +--> [Agreement detail]
       |          +--> [Tariff editor]
       |          +--> [D&D rule editor]
       |          +--> [Pricing simulation]
       |
       +--> [Booking]
       |          |
       |          +--> [New booking]
       |          +--> [Booking detail]
       |          +--> [Amendment]
       |          +--> [Manual pricing]
       |
       +--> [Container Movement]
       |          |
       |          +--> [Journey detail]
       |          +--> [Movement capture]
       |          +--> [Status event history]
       |
       +--> [Operations]
                  |
                  +--> [Exception queues]
                  +--> [Runtime health]
                  +--> [Contract tests]
                  +--> [Runbooks]
```

The Claude export's workflow ribbon remains useful for one booking journey:

```text
Agreement -> Booking -> Track & trace -> D&D & invoice
```

For the enterprise application, the ribbon is a contextual journey indicator, not the whole navigation system.

## Decision and Error Recovery Points

| Decision or failure | UI response | Recovery owner |
|---------------------|-------------|----------------|
| Missing active agreement | Pricing rail shows tariff fallback or manual pricing | Charge + Booking |
| Pricing timeout | Retry, circuit-breaker status, manual pricing queue | Booking |
| Capacity validation failure | Operational exception with reason and alternatives | Booking/Operations |
| Duplicate movement | Deduplication banner and duplicate history | CMM |
| Late or out-of-order movement | Sequence warning, accepted event history, derived status rationale | CMM |
| D&D ambiguity | Manual D&D review with trigger evidence and missing facts | Booking + Charge |
| Service unavailable | Degraded module panel with unaffected modules still usable | Shared Platform/Operations |
| Permission denied | Explain missing capability, do not expose hidden actions | Identity/Authorization |

## Accessibility Flow Requirements

- Every flow starts with a skip link and logical heading sequence.
- Module rail items need accessible names matching visible module names.
- Workflow ribbons must be navigable as ordered steps with current step state.
- Pricing, D&D, status, and exception updates must use polite live regions.
- Destructive or publishing actions require explicit buttons and review summaries.
- All tables and timelines must support keyboard navigation, row expansion, sorting, and filtering.
- Error messages must be text-visible and tied to the failing field or row.

## Completion Evidence Expected Later

These rough flows do not prove completion. Later stages must turn them into:

- user stories and acceptance criteria;
- refined mockups and component specifications;
- OpenAPI, Avro, AsyncAPI, Pact, and message-pact artifacts;
- real frontend screens bound to real APIs and permissions;
- automated tests for all five end-to-end business flows;
- local runtime and observability evidence.
