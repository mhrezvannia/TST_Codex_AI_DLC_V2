# User Stories Assessment — W3-04 Booking Request Completeness

Evidence basis: `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`.

## Decision

**Execute User Stories.** W3-04 is a user-facing, Standard-depth brownfield feature whose value and risk are best controlled through vertical, testable operator outcomes rather than requirements alone.

## Rationale

Booking-desk and customer-service users must create, reopen, correct, validate, price, confirm, and inspect a commercially complete request. The journey includes six separately authorized actions, legacy-incomplete records, authoritative Reference Data and schedule dependencies, Charge outcomes, confirmation publication, CMM pending assignment, and one canonical LinerCore UI. Stories add the actor, value, state/recovery, and incremental delivery context needed to turn the 30 functional and 10 non-functional requirements into coherent end-to-end slices.

## Factors Considered

- **Project type:** Brownfield feature across the shared shell/BFF, Booking service, Reference Data, Charge, Kafka/Schema Registry, and CMM.
- **User-facing scope:** One repeated operational workflow with explicit keyboard, responsive, authorization, and context-preservation behavior.
- **Complexity:** Canonical field/schedule authority, additive migration, exact pricing, idempotent confirmation, and multiple degraded outcomes.
- **Coordination:** Booking is the Driver; Shared Platform, Charge, CMM, and UI Platform own bounded contributions.
- **Team practice:** PB-01 must prove the real shared-shell create/reopen spine first; later breadth builds on it with tests alongside code and honest live evidence.

## Highest-Value Story Areas

1. Create and reopen the truthful PB-01 request spine with quantity greater than one and no physical equipment ID.
2. Complete canonical commercial fields and authoritative schedule provenance.
3. Correct legacy, incomplete, invalid, stale, and conflicting requests without record duplication or data loss.
4. Validate and price the exact current request across every Charge outcome.
5. Confirm once, publish `booking.confirmed`, and establish CMM pending assignment without synthetic containers.
6. Inspect the operational detail and execute exactly one permitted recovery/action in the canonical `/booking` composition.
7. Prove authorization, accessibility, responsive behavior, contracts, migrations, live Compose behavior, and audits for this intent.

## UI Governance Boundary

Approved W3-04 requirements and scope lead; security/accessibility/technical standards follow; then LinerCore `MASTER.md`, the shared-shell contract, and approved Rough Mockups. Booking owns domain workflow/page composition, `apps/shell` owns authenticated chrome, and `packages/ui` owns tokens/primitives. No Booking request page override exists. User Stories shall not introduce a local theme, duplicate `/bookings` implementation, new shared primitive, or Refined Mockups decision; the prescribed UI/UX Pro Max generation remains deferred until Requirements Analysis and User Stories are both approved.
