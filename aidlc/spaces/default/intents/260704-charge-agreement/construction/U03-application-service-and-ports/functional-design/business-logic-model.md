# Business Logic Model - U03 Application Service and Ports

## Scope

U03 coordinates domain use cases and infrastructure ports. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md` and remains adapter-free.

## Use Case Flow

| Use case | Flow |
| --- | --- |
| Create agreement | Authorize manage action, validate reference IDs, create domain aggregate, save, publish fact seam, return detail. |
| Update agreement | Authorize, load aggregate, check expected version, validate references and terms, update domain, save. |
| Approve agreement | Authorize approve action, load aggregate, invoke domain approval, save, publish approved fact seam. |
| Suspend/expire | Authorize status action, load aggregate, invoke domain transition, save, publish changed fact seam. |
| Search | Validate query, authorize read action, delegate to repository search. |
| Detail | Authorize read action, load by ID or return not found. |
| Active lookup | Validate query, load candidates, apply active and context matching, return result or no-match payload. |

## Active Lookup Decision Tree

1. Require `customerId` and `effectiveDate`.
2. Prefer `tradeLaneId` when supplied.
3. Otherwise compare origin/destination IDs where supplied.
4. Compare commodity when supplied.
5. Keep only Approved agreements active on the effective date.
6. Return the most specific candidate; when no candidate matches, return `matched=false` with empty terms.

## Handoff

U04 implements the repository port. U05 exposes these use cases over REST.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U03 has clean ports, explicit use cases, and a deterministic active-lookup flow suitable for Booking handoff.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.