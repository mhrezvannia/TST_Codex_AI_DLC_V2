# Unit-to-Story Map - W2-04 Container Journey & Track-Trace

## Source Alignment

This map assigns every outcome in `stories.md` and its linked FR/NFR/AC in
`requirements.md` to the vertical units defined from `components.md`,
`component-methods.md`, `services.md`, `component-dependency.md`, and
`decisions.md`. A story may span units when each unit delivers an independently
observable increment; no assignment authorizes a horizontal layer-only DoD.

## Story Coverage by Unit

| Story | U01 PB-01 skeleton | U02 lifecycle/rejections | U03 authorized degraded access | Coverage result |
| --- | --- | --- | --- | --- |
| US-01 Event-created journey and expected plan | Full: ordered migration/upgrade; valid intake; idempotent booking replay; invalid/inactive intake; Allocated plan and seq-0 PLN | Plan remains stable while actuals advance | Existing journey is the authorized/degraded read subject | Covered |
| US-02 Find and inspect canonical timeline | Initial populated list/detail with plan + GTOT + invalid attempt evidence | Full accepted/rejected GTOT/LOAD/DISC/GTIN timeline | Loading, empty/not-found, retryable error, denied, and degraded accessible states | Covered |
| US-03 Capture next valid DCSA movement | Valid GTOT happy path | LOAD/DISC/GTIN, field/reference validation, pending/success, retry/restart recovery | Capture disabled/denied when authorization or reference validation cannot support it | Covered |
| US-04 Understand duplicate rejection | Durable request/disposition schema and explicit 409 type | Same occurrence plus same/conflicting key API/UI/audit evidence; Booking transport replay disposition | Denied/degraded attempts remain distinct from duplicate semantics | Covered |
| US-05 Correct out-of-sequence move | DISC-before-LOAD returns exact `OUT_OF_SEQUENCE_MOVEMENT` with LOAD-next evidence | Remaining invalid-next-code cases and correction without re-entry | Denied/degraded capture never reaches transition evaluation | Covered |
| US-06 Consume ordered status into Booking | Seq-0/seq-1 applied receipt and projection | Seq-2 through seq-4 plus duplicate/stale/legacy-seq-0/unassigned-or-invalid dispositions and outbox recovery | Not applicable beyond unchanged-state checks for denied capture | Covered |
| US-07 See latest progress from Booking | GTOT latest status, pending/applied state, and canonical CMM link | LOAD/DISC/GTIN latest states plus retry/degraded presentation | Booking remains unchanged when denied/degraded capture produces no status | Covered |
| US-08 Enforce read-only and capture permissions | Positive read/capture assignments | Permission invariant retained for every valid capture | Full: read-only/direct 403, actor audit, Identity-down fail closed, authorized Reference Data degraded read/capture-disabled | Covered |
| US-09 Reproduce release-grade vertical evidence | PB-01 and migration evidence checkpoint | Lifecycle/rejection/ordering/recovery evidence checkpoint | Authorization/degradation evidence checkpoint; serialized Compose, full viewport/theme matrix, guards, audits, and W1 distinction remain at the intent Exit Gate | Covered |

## Story Implementation Order Within Each Unit

These are behavioral steps inside each unit, not a recommendation for unit or
Bolt sequencing.

### U01 - PB-01 Journey-to-Booking Walking Skeleton

1. Establish US-08 positive/read-only Identity assignments needed by protected routes.
2. Drive US-01 through the real Booking event and inspect the persisted plan.
3. Expose the initial US-02 CMM list/detail timeline.
4. Capture US-03 GTOT and propagate it through US-06.
5. Render US-07 latest progress in Booking with the CMM canonical link.
6. Exercise the first US-05 DISC-before-LOAD rejection and record the U01 portion of US-09 evidence.

### U02 - Ordered Lifecycle and Observable Rejections

1. Extend US-03 through LOAD, DISC, and GTIN with US-06 ordered propagation.
2. Complete US-02 and US-07 accepted timeline/latest views for each transition.
3. Exercise US-04 duplicate occurrence and idempotency-key variants.
4. Exercise remaining US-05 invalid-next-code cases and unchanged-state checks.
5. Record the full lifecycle/rejection portion of US-09 evidence.

### U03 - Authorized Degraded Journey Access

1. Open the U01 persisted journey as Equipment Control and Customer Service through US-02/US-08 authorized reads.
2. Exercise Customer Service deep-link/direct capture denial and prove US-08 unchanged state/audit identity.
3. Stop Identity and prove fresh list/detail/capture fail closed with actionable UI/API behavior.
4. Restore Identity, stop Reference Data, and prove an authorized persisted read remains available while capture is disabled and direct capture cannot mutate state.
5. Record the authorization/degradation portion of US-09 evidence; the global release matrix remains in the intent Exit Gate.

## Cross-cutting Story Relationships

- US-08 is a vertical prerequisite and ongoing invariant, not a separate auth layer unit.
- US-06 always travels with the accepted CMM movement that produces its status; consumer work cannot satisfy a unit alone.
- US-02 owns the canonical full timeline; US-07 remains Booking latest-only and links to CMM.
- US-04 and US-05 travel with accepted capture behavior because unchanged-state proof requires a real prior acceptance.
- US-09 accumulates evidence in every unit and closes only at the intent Exit Gate; it does not create a test-only unit.

## Coverage Verification

- All nine approved stories are assigned.
- All three units implement user-visible stories and cross domain, persistence, contract, API, and UI seams where needed.
- FR-01 through FR-14 and AC-01 through AC-12 remain reachable through their story mappings.
- NFR-01 through NFR-10 are exercised inside the relevant live behavior, with release-level closure at the intent Exit Gate across all units.
- No unit adds EDI, a public DCSA API, multi-leg routing, fleet registry, depot stock, M&R, D&D, or other deferred scope.
