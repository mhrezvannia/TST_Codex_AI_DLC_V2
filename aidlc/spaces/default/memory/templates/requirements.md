<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces standards alignment + live-behavior acceptance. -->

# Requirements — <intent name>

## Functional Requirements

<Numbered FRs. Each is a capability of the vertical slice, traceable to the intent statement and a user story.>

## Data & Standards Alignment

<For every data concept in scope, name the standard it conforms to (DCSA Booking / T&T, UN/LOCODE, ISO 6346, SMDG, ISO 4217 currency) and the canonical field name. This section is the contract between requirements and the domain-entities schema — they must agree.>

## Cross-Module Contracts

<Every contract this intent produces or consumes, by name (pricing.request, booking.confirmed, containermovement.status, …), with producer/consumer and sync/async style, referencing contracts/ and docs/enterprise-contracts/.>

## Non-Functional Requirements

<Performance, reliability, security, observability requirements relevant to this slice. Keep proportional to scope.>

## Acceptance Criteria (live behavior)

<Given/When/Then per FR, expressed as behavior observable on the running stack. "The system persists X" → "After POST, the record is retrievable and the detail page renders it." Acceptance is demonstrated on the real runtime, not by unit tests alone.>

## Assumptions & Constraints

<Enterprise constraints (from enterprise-technical-environment.md) and any deferred decisions this intent must NOT silently fill in.>

## Open Questions

1. Any requirement blocked on a deferred enterprise decision?
   - A. None — all inputs available (recommended)
   - B. Yes (list the blocking decisions and who owns them)
   - X. Other
   - `[Answer]:`
