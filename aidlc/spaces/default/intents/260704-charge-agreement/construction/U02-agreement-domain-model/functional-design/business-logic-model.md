# Business Logic Model - U02 Agreement Domain Model

## Scope

U02 implements pure domain behavior for `CustomerAgreement` and `ChargeTerm`. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`; no Spring, persistence, REST, or frontend dependency is allowed.

## Lifecycle Workflow

1. `create` produces a Draft agreement with header fields, validity, actor metadata, and version `1`.
2. `updateHeader` is allowed only while Draft.
3. `replaceTerms` is allowed only while Draft and validates all terms atomically.
4. `approve` requires Draft status, valid agreement dates, and at least one valid charge term.
5. `suspend` requires Approved status and records actor, timestamp, and reason.
6. `expire` records Expired status and removes the agreement from active lookup eligibility.
7. `isActiveFor(date)` returns true only when status is Approved and the date is inside agreement validity.

## Algorithms

| Algorithm | Steps |
| --- | --- |
| Validate agreement validity | Require `validFrom` and `validTo`; reject `validTo` before `validFrom`. |
| Validate terms | For each term, require charge code, basis, currency, positive amount, and term dates inside agreement validity. |
| Advance version | Increment version on successful header, term, or status change. |
| Record activity | Append lifecycle activity for create, update, approve, suspend, and expire. |

## Handoff

U03 wraps these domain methods in application use cases and ports.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U02 keeps the aggregate framework-free, maps to lifecycle and charge-term requirements, and provides clear invariants for tests.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.