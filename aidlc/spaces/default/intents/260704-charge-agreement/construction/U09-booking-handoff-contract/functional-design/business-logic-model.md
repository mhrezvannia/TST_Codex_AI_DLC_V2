# Business Logic Model - U09 Booking Handoff Contract

## Scope

U09 documents and verifies the active lookup behavior needed before Customer Booking begins. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Lookup Contract Flow

1. Booking sends customer and shipment context.
2. Charge Agreement validates query shape.
3. Service resolves Approved agreements active on effective date.
4. Service filters by lane or origin/destination and commodity when present.
5. Response returns either matched agreement terms or a no-match result.

## Required Examples

| Example | Expected |
| --- | --- |
| Approved matching agreement | `matched=true` with terms. |
| Draft matching agreement | `matched=false`, inactive status excluded. |
| Suspended/Expired agreement | `matched=false`, inactive status excluded. |
| No agreement | `matched=false`, no applicable agreement reason. |
| Missing customer/date | Validation error. |

## Handoff

Booking implementation can begin only after active lookup is implemented and verified.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U09 protects the module boundary and defines deterministic match/no-match behavior for Booking.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.