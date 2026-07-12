# Intent Statement — P3-01 Multi-Entity / Multi-Company Operation

> **Phase 3.** Answers provisional (recommended defaults) — reconfirm at Phase 3 start; cross-cutting, so validate against all modules first.

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §3 Scalability ("additional carrier legal entities/agencies (multi-company)"), §Enterprise Business Constraints
2. `docs/enterprise-technical-environment.md` (security/authorization model, tenancy posture — note deferred decisions)
3. `docs/shared-platform-module-vision.md` (identity/authorization) + `services/identity-service`
4. Stable Phase-1/2 modules (this scopes their data by entity)

## Intent

The platform supports **multiple carrier legal entities / agencies**: every business record is scoped to an operating entity, users see and act only within their entitled entities, and cross-entity leakage is impossible. This is the "multi-company carrier operation" the roadmap names for Phase 3. **Driver: Shared Platform team (all modules contribute).**

## Vertical Slice Definition

One entity-scoped journey end-to-end: seed two carrier entities → a user of entity A creates a booking (scoped to A) → runs it through quote-to-cash → a user of entity B **cannot see or act on** it → the owning entity travels on every record, event, and API call.

- **Layers cut:** identity/authorization → every module's domain + persistence (entity scope) → APIs → events (entity in envelope) → UI (entity context).
- **Thinnest viable form:** two entities, row-level scoping + authorization on the Booking spine; extend to other modules as units.
- **Deferred:** entity-specific configuration/branding, inter-entity transactions, entity hierarchy/agency delegation depth.

## In Scope / Out of Scope

- **In:** operating-entity as a first-class dimension, row-level data scoping, authorization by entity, entity carried in the event envelope + correlation, entity context in the UI/session.
- **Out:** separate-database tenancy, per-entity infra, billing between entities.

## Actors & Journey

An agency user logs in scoped to their entity, works only their bookings/journeys; a shared-services user with multi-entity rights can switch context explicitly.

## Cross-Module Seams (must be real)

Authorization (identity-service) enforces entity scope on every command; the event envelope carries the owning entity so downstream modules scope consistently; no seam allows cross-entity read/write.

## Standards Alignment

No new external standard; extends the envelope + authorization model. Entity identifiers stable and referenced, not duplicated.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) two entities seeded; (2) user A creates + confirms a booking; (3) user B (entity B) cannot list, open, or act on it via UI or API (authorization denies, audited); (4) the owning entity is present on the record, the `booking.confirmed` event, and the CMM journey; (5) a multi-entity user switches context and sees the right scope; (6) both audits green.

## Dependencies

Most of Phase 1 (stable modules to scope) + W2-01 (auth/shell). Sequence early in Phase 3 — later Phase-3 intents assume entity scope.

## Suggested Scope & Sizing

`enterprise` (cross-cutting, security-sensitive). ~5 vertical units: (U01) entity model + identity scoping; (U02) Booking spine entity-scoped end-to-end; (U03) events + envelope entity; (U04) CMM + Charge scoping; (U05) UI entity context + switch.

## Open Questions

1. Isolation model?
   - A. Row-level entity scoping + authorization (recommended — one deployment, simplest to operate)
   - B. Separate schema per entity
   - C. Separate database/deployment per entity
   - X. Other
   - `[Answer]:` A *(provisional — security review required before commit)*
