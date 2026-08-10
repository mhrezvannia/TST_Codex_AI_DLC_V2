# W3-04 Booking Request Completeness — Architecture Decisions

## Decision status and scope

The team selected **Guided recommendations** in `application-design-questions.md`; Option A is accepted for Q1–Q8. These decisions are proposed architecture for W3-04 and remain subject to the formal Application Design approval gate. They do not claim implementation or live evidence.

## ADR-001 — Canonical Booking UI is a Booking-owned route subtree in the shared shell

**Status:** Proposed for approval  
**Decision:** Keep `apps/shell/app/booking/**` as the single canonical `/booking` composition. The UI platform owns root layout/navigation/tokens/primitives; Booking owns the route subtree and workflow components. Keep `apps/booking` as the Booking BFF. Convert duplicate `apps/booking/app/bookings/**` pages and plural shell routes into redirects or thin delegates.

**Rationale:** This fits the brownfield topology and LinerCore single-shell contract with the smallest reversible change. Product ownership is explicit without making frontend boundaries mirror microservices or adding app-to-app imports.

**Consequences:** Booking changes route-owned files inside `apps/shell` under agreed ownership. UI-platform changes still require W2-02. Duplication checks become a quality gate.

**Reversibility:** Medium. Route-owned components could later move to an approved domain package without changing public URLs/BFF contracts.

**Alternatives rejected:**

- Extract a new Booking UI package now: mechanically clear but adds package/build/import scope before the vertical slice proves a reusable boundary.
- Keep both shell and Booking-app page stacks: violates FR-024 and guarantees behavior drift.
- Move canonical UI to `/bookings`: contradicts the approved shell route.

## ADR-002 — Same-record correction uses one dedicated route and full replacement PUT

**Status:** Proposed for approval  
**Decision:** Add `/booking/{bookingId}/correct` as a server-rendered correction route that initializes the same Booking-owned request-form composition used by `/booking/new`, then add `PUT /api/bookings/{bookingId}` and matching BFF/shell forwards. The payload is the full typed request, explicit optional nulls, `expectedRevision`, idempotency key, actor, and correlation. It replaces request values on the same booking lineage and invalidates stale evidence when the basis changes.

**Rationale:** Full replacement makes preservation and clearing semantics deterministic and keeps correction distinct from W3-03 commercial amendment behavior.

**Consequences:** Clients must send a complete correction representation. Optimistic conflicts are explicit; the UI preserves local input and requires refresh/reapply. Create and correction remain one implementation with two explicit route modes, so back/cancel/focus behavior stays deterministic without turning Overview into a hidden edit state.

**Reversibility:** High. A later PATCH can coexist if a real use case appears; PUT remains a valid deterministic contract.

**Alternatives rejected:**

- Partial PATCH: ambiguous omitted-versus-cleared optional values and more complex evidence invalidation.
- Reuse `/amend`: conflates repair of an incomplete request with post-booking amendment semantics.
- Create a replacement draft: violates same-record correction and audit lineage.
- Inline edit mode on Overview: viable but makes route/deep-link/dirty-cancel semantics less explicit than the dedicated correction route while providing no scope reduction.

## ADR-003 — Reference and voyage access crosses a Booking facade/port

**Status:** Proposed for approval  
**Decision:** Browser code calls only the Booking BFF. Booking exposes bounded option/voyage facade queries and delegates to Reference Data adapters. Booking commands revalidate through authoritative outbound ports. No copied master dataset is introduced.

**Rationale:** This preserves one browser trust boundary, correlation, permissions, and domain-shaped error behavior while retaining Reference Data ownership.

**Consequences:** Booking must maintain thin anti-corruption mappings and safe subset-level failure handling. Reference Data APIs may need additive schedule fields.

**Reversibility:** Medium-high. The facade could later be extracted, but browser and domain contracts remain stable.

**Alternatives rejected:**

- Browser fan-out to Reference Data: additional session/error boundary and fragmented recovery.
- Booking-owned replicated masters: ownership violation and synchronization burden.
- Cross-service SQL: prohibited by service-owned database rules.

## ADR-004 — Pre-confirmation coordination remains synchronous; Booking persists outcomes

**Status:** Proposed for approval  
**Decision:** Reference/schedule validation and Charge pricing/status use bounded synchronous ports. Booking persists fingerprints, authority versions, terminal/uncertain dispositions, timestamps, request identities, and correlations. A unified Booking operation journal and `GET /api/bookings/operations/{operationId}` provide non-mutating recovery for uncertain create, correct, validate, price, and confirm commands, including create before a booking ID is returned. Only confirmed-booking handoff is asynchronous.

**Rationale:** Existing ports and BFF timeout behavior already support this interaction style. Persisted outcomes provide deterministic recovery without a new orchestrator or eventual-consistency form workflow.

**Consequences:** Provider latency is visible at command boundaries; uncertainty must be modeled, not hidden. The opaque client operation identity is also the idempotency key and is actor/tenant scoped. `IN_PROGRESS`/`OUTCOME_UNKNOWN` allow refresh only; `NOT_ACCEPTED` permits one same-identity retry only when non-acceptance is proven; expired uncertainty is manual/inspect, not blind retry.

**Reversibility:** Medium. A future asynchronous provider adapter can implement the same Booking-facing status contract if scale/evidence warrants it.

**Alternatives rejected:**

- Asynchronous validation/pricing commands: adds topics, consumers, correlation state, and eventual UX beyond W3-04.
- New workflow/orchestration service: splits Booking authority and creates distributed state management.
- Local cache/fallback: risks stale or fabricated authority.

## ADR-005 — Complete requests use explicit snapshot schema v2 and additive projections

**Status:** Proposed for approval  
**Decision:** Classify legacy flat snapshots as v0 and current unversioned canonical `routing`/`equipment` snapshots as v1 on read. Write new/updated records with `schemaVersion: 2`, typed complete-request state, and additive relational projections. Record restartable backfill outcomes in a Booking migration ledger.

**Rationale:** The current codec relies on structural detection. An explicit version closes ambiguity and provides a durable migration/restart contract while retaining tolerant reads.

**Consequences:** Upcasters must preserve unknown legacy attributes and mark unsupported facts incomplete. Projection is rebuildable, not a second authority. Migrations are additive and rollback is application/configuration based.

**Reversibility:** Medium-high. Readers retain v0/v1; v2 writes can be paused. Additive schema remains harmless if application rollback occurs.

**Alternatives rejected:**

- Extend attribute-map/shape detection indefinitely: weakens traceability and baseline-drift evidence.
- Destructive in-place rewrite: unsafe rollback and lost-fact risk.
- Fabricate defaults during backfill: violates truthfulness and correction requirements.

## ADR-006 — Confirmation rolls out a versioned canonical event and a distinct CMM pending-assignment path

**Status:** Proposed for approval  
**Decision:** Booking confirmation atomically commits aggregate state, activity/audit, idempotency, confirmation snapshot, and outbox. The outbox publishes the exact checked-in `BookingConfirmed` Avro record on `booking.confirmed`: `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`, and nested booking/routing/equipment `data`. Command idempotency is not an Avro field. CMM consumes it through a new pending-assignment application path that accepts quantity greater than one and null equipment ID and creates no journey.

**Rationale:** The existing CMM confirmed consumer constructs a `ContainerJourney`, which is not truthful before physical assignment. An additive consumer path avoids overloading that aggregate and provides a safe compatibility rollout from `booking.events`.

**Consequences:** Consumer inventory and bounded compatibility evidence are mandatory before legacy retirement. CMM adds its own pending-assignment persistence/idempotency transaction and extends the existing `GET /api/container-movement/bookings/{bookingId}/journey` OHS with a negotiated v2 `PENDING_ASSIGNMENT`/`JOURNEY_AVAILABLE` representation. Booking calls it with authenticated service and actor context under 500 ms connect/1.5 s read bounds; confirmed+authorized-404 is `HANDOFF_PENDING`, not acceptance, while denied and unavailable remain distinct. Each outbox row freezes one destination: current-contract rows only to `booking.confirmed`, legacy only to `booking.events`; per-event dual publication is prohibited. W3-04 confirmation is enabled only after the canonical consumer is healthy, and the legacy mapper rejects/quarantines the current contract before journey mutation.

**Reversibility:** High during the compatibility window: producer cutover can be disabled and legacy configuration retained until convergence. Committed outbox state remains recoverable.

**Alternatives rejected:**

- Mutate the existing event/consumer in place: rollback and undiscovered-consumer hazard.
- Continue creating a journey with null/synthetic ID: makes a physical fact out of commercial intent.
- Booking writes CMM state directly: database ownership and atomicity violation.

## ADR-007 — Retain Next.js server reads, focused client state, and the established BFF security boundary

**Status:** Proposed for approval  
**Decision:** Use server-rendered reads and focused client components with local form/action state. Extend `forwardToBookingBff`/`proxyBooking` and add explicit per-operation permission policies. Use LinerCore contracts and released `@erp/ui` primitives. Consume the W2-02-owned shared multiline `TextArea`/counter when released; do not patch `packages/ui` or create a local substitute.

**Rationale:** This matches the current App Router stack and team practices. The workflow does not need a cross-application client state/query framework; authoritative state is already persisted in Booking.

**Consequences:** Client code owns only transient input/pending/focus state. Reads use `no-store` where current operational truth matters. Security checks remain layered at BFF and service. Cargo-description implementation evidence remains BLOCKED until the shared primitive release is consumable; the rest of the architecture does not fork around it.

**Reversibility:** High. A focused library can be introduced later behind view-model interfaces if observed complexity justifies it.

**Alternatives rejected:**

- Add Redux/RTK or another client query/store: unapproved dependency and duplicate server-read state.
- Direct browser-to-service/provider calls: bypasses same-origin/session/safe-error controls.
- Edit `packages/ui` or add a Booking-local multiline control: violates Wave A ownership and would fork the explicitly identified shared `TextArea` dependency.

## ADR-008 — Preserve the existing Compose deployment target; AWS is portability review only

**Status:** Proposed for approval  
**Decision:** Reuse existing services, service-owned PostgreSQL databases, Kafka/outbox, BFFs, health checks, auditing, and observability. Add only configuration/migrations needed by W3-04. Create no AWS resource or cloud-only dependency.

**Rationale:** The approved project target is local/on-premise Compose. Cloud expansion would not improve the feature outcome and would invalidate scope assumptions.

**Consequences:** Capacity/SLO claims remain local evidence only. Portability requires standard protocols, configuration-driven endpoints, deterministic migrations, and stateless runtime assumptions.

**Reversibility:** High. The same ports/adapters can be deployed on another platform later without redesigning the domain.

**Alternatives rejected:**

- Managed cloud queue/database/orchestration: scope and provider mismatch.
- AWS-specific credentials/configuration: explicitly prohibited unless the user changes providers/target.

## ADR-009 — Hexagonal Booking boundaries remain the application architecture style

**Status:** Proposed for approval  
**Decision:** Extend existing domain-core, application-service, inbound API, outbound data/reference/pricing/messaging adapters, and container wiring. Do not introduce a parallel CRUD/service architecture for the new fields.

**Rationale:** Brownfield `architecture.md` and `component-inventory.md` show established hexagonal seams and transactional outbox behavior. The feature adds domain invariants and cross-authority coordination that belong behind those seams.

**Consequences:** API/BFF DTOs are mapped to commands/value objects; persistence JSON/projection types do not leak into domain or UI. Ports are contract-tested.

**Reversibility:** Low need, high cost. This is an existing project rule, not a W3-04 experiment.

**Alternatives rejected:**

- Controller-to-repository CRUD for new request fields: bypasses aggregate invariants and transaction boundaries.
- Shared persistence model across services: violates data ownership.

## ADR-010 — LinerCore overrides external UI generation recommendations

**Status:** Proposed for approval  
**Decision:** Apply only UI/UX Pro Max recommendations compatible with the approved operational-console contract: semantic grouping, data density, persistent labels, keyboard focus, skeleton/status feedback, responsive stacking, and non-color state meaning. Reject its Enterprise Gateway/hero/sales composition, logo carousel, replacement Cinzel/Josefin typography, alternate palette, decorative effects, generic spinner-first behavior, and dark-default styling.

**Rationale:** `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, executable `@erp/ui`, and approved Refined Mockups are binding authorities. External recommendations are advisory.

**Consequences:** UI implementation uses the existing shell, tokens, released primitives and page patterns in light and dark themes. Booking-owned live/status regions wrap shared primitives only where the primitive contract requires composition. The missing shared `TextArea`/counter remains a UI Platform dependency, not permission for a local workaround.

**Reversibility:** High for page composition within the same design system; low for introducing a local theme because that remains prohibited.

**Alternatives rejected:**

- Adopt the generated “Enterprise Gateway” visual direction: marketing framing conflicts with the operational workflow.
- Add alternate typography/palette/spinner/chart primitives: design-system fork and accessibility/fidelity risk.

## Cross-decision consequences

Together these ADRs establish one vertical flow and two local transaction boundaries:

```text
/booking UI -> shell forwarder -> Booking BFF -> Booking hexagonal application
  -> Booking PostgreSQL transaction
  -> bounded Reference Data / Charge calls with persisted outcomes
  -> Booking confirmation + outbox transaction
  -> booking.confirmed
  -> CMM pending-assignment transaction
```

The design deliberately accepts eventual consistency only after confirmation. It preserves correction and provider-failure recovery without inventing facts. It also makes deployment ordering, compatibility inventory, and live evidence part of the design rather than post-hoc tasks.

## Risks and mitigations

| Risk | Mitigation / decision owner |
|---|---|
| Shell route ownership creates review ambiguity | CODEOWNERS/team plan assigns `/booking` subtree to Booking; shell primitives remain UI-platform owned |
| Full PUT loses optional values | Typed form initializes from full projection; explicit null semantics; round-trip/property/contract tests |
| Reference/Charge latency exceeds BFF boundary | Persist uncertainty and exact recovery; record local duration; no invented production SLO |
| Uncertain create has no booking ID | Query the Booking operation journal by the original opaque idempotency identity; authorization is actor/tenant scoped and refresh is non-mutating |
| Snapshot upcast misclassifies old records | Explicit v0/v1 detection, source digest, ledger, drift rejection, restart tests |
| Event cutover duplicates downstream effect | Immutable single destination per outbox row, separate topic/group subscriptions, consumer idempotency, and no per-event dual publication |
| CMM legacy path still creates journeys | W3-04 activation waits for canonical consumer; legacy mapper rejects the canonical record before mutation; assert one pending assignment and zero journey/movement rows |
| Journey view infers CMM acceptance from Booking state | Bind to the exact CMM booking-journey OHS; only HTTP 200 pending/journey proves acceptance, 404 is Handoff pending, and denied/unavailable remain distinct; no copy is persisted |
| Permission drift across layers | One operation-policy matrix tested at BFF and service; denial precedes provider/mutation |
| UI recommendation forks LinerCore | Design-system mapping/fidelity audit; stop and escalate any genuine primitive gap |
| Shared `TextArea` release is unavailable or incompatible | Keep cargo-field implementation evidence BLOCKED; W2-02 resolves and publishes the primitive; W3-04 never forks it locally |

## Upstream basis and traceability

The ADR set consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. UI decisions incorporate `mockups.md`, `interaction-spec.md`, `design-system-mapping.md`, and `accessibility-checklist.md`. The decisions collectively cover FR-001–FR-030, NFR-001–NFR-010, and US-01–US-12; approval authorizes downstream design, not PASS evidence.
