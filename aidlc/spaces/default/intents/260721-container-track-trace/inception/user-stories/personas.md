# Personas - W2-04 Container Journey & Track-Trace

## Source and Scope

These personas specialize the actors already established by `requirements.md`
and the brownfield `business-overview.md`. Their workflows use the existing
components catalogued in `component-inventory.md` and follow the PB-01 walking
skeleton and evidence posture in `team-practices.md`. They do not add a public
portal, EDI operator, fleet/depot user, maintenance user, or shared-shell owner.

## P1 - Elena, Equipment Control Operator

| Attribute | Definition |
|---|---|
| Role | Internal equipment-control operations clerk |
| Priority | Primary |
| Technical comfort | Medium; expert in operational codes, not transport internals |
| Frequency | Repeatedly throughout each operating shift |
| Authority | `container-movement:read` and `container-movement:capture-movement` through `EQUIPMENT_CONTROL` |

### Goals

- Find the journey created from a confirmed booking and assigned container.
- See expected LOAD/DISC, actual history, current lifecycle, and the next valid
  move without reconstructing state from multiple systems.
- Capture GTOT, LOAD, DISC, or GTIN with the correct location, time, source, and
  load state.
- Recover from a duplicate or out-of-sequence attempt without losing entered
  values or wondering whether accepted state changed.

### Pain Points

- The baseline CMM vocabulary is generic and does not match the DCSA-coded
  operational sequence used for the slice.
- Silent duplicate handling makes it unclear whether a command was accepted,
  ignored, or published twice.
- A latest-only status does not explain which expected or actual move comes next.
- Technical broker/schema details distract from the immediate operating action.

### Context and Accessibility Needs

Elena works in a dense operational console, may use a laptop or tablet, and
switches between Booking and Container Movement. She needs scannable text labels,
keyboard-complete capture, visible focus, an error summary linked to fields, and
status meaning that never depends on color. Rejected form input remains present
for correction.

## P2 - Sam, Customer Service User

| Attribute | Definition |
|---|---|
| Role | Internal customer-service agent answering booking-progress questions |
| Priority | Secondary |
| Technical comfort | Medium; understands booking and lifecycle language |
| Frequency | Several times per shift, usually from Booking detail |
| Authority | `container-movement:read` only through `CUSTOMER_SERVICE` |

### Goals

- See the latest applied container movement from Booking-owned data quickly.
- Distinguish pending propagation from an applied status or retryable delay.
- Open the canonical CMM journey when deeper expected/actual history is needed.
- Trust that an unauthorized capture attempt cannot alter operations data.

### Pain Points

- A status can appear delayed without enough explanation to distinguish normal
  propagation from a failure.
- Reconstructing a timeline from Booking would duplicate CMM ownership and risks
  conflicting answers.
- Over-permissioned read-only roles create operational and audit risk.

### Context and Accessibility Needs

Sam begins in Booking detail and follows a cross-link only when authorized. The
latest code, readable lifecycle, equipment, location, occurrence time, and
pending/applied state must be understandable without DCSA expertise. Read-only
UI must not expose a capture action and must provide a clear denied state if a
stale/deep link targets capture.

## P3 - Priya, Platform Operator and Release Reviewer

| Attribute | Definition |
|---|---|
| Role | Internal operator/reviewer responsible for release evidence and supportability |
| Priority | Supporting |
| Technical comfort | High; can inspect Kafka, Schema Registry, PostgreSQL, APIs, and Playwright evidence |
| Frequency | At release gates and when investigating delivery failures |
| Authority | Least-privilege operational reads plus controlled acceptance identities |

### Goals

- Reproduce the real booking-to-CMM-to-Booking path on the isolated Wave A stack.
- Correlate broker records, both service databases, API responses, UIs, and audit
  rows without using synchronous shortcuts.
- Prove duplicate/out-of-sequence attempts changed no accepted state.
- Protect the manager demo on port 8088 and keep historical W1
  BLOCKED/waiver/later-PASS records semantically separate.

### Pain Points

- Passing unit tests can conceal schema, broker, migration, or Compose drift.
- Environmental failures can tempt destructive volume resets or mislabeled PASS
  evidence.
- Cross-session stack contention makes acceptance results unreliable.

### Context and Accessibility Needs

Priya follows a deterministic, evidence-preserving runbook under one live-stack
controller. She needs stable correlation IDs, durable receipt/outbox outcomes,
explicit audit dispositions, and screenshots/traces that cover the required
viewports, themes, keyboard flow, and error states.

## Persona Relationships and Priority

1. **Elena drives core value.** Booking confirmation prepares her journey; her
   accepted capture creates the status facts consumed elsewhere.
2. **Sam consumes a bounded projection.** Sam uses Booking's latest status and
   links to CMM for the canonical timeline; Sam never authors movement state.
3. **Priya proves and operates the seam.** Priya verifies that Elena's action
   reaches Sam's view through the real asynchronous and persistence boundaries.

The relationship is not a handoff of ownership: CMM remains authoritative for
journey/history, Booking for its latest projection, Identity for permissions,
and Shared Platform for broker/schema/runtime infrastructure.

## Persona-to-Requirement Coverage

| Persona | Primary requirements |
|---|---|
| Elena | FR-01 through FR-09, FR-12, FR-13 |
| Sam | FR-03, FR-10 through FR-13 |
| Priya | FR-07 through FR-10, FR-12, FR-14 and NFR-01 through NFR-10 |

No additional persona is required for service identities: Booking and CMM are
system actors inside these user-valued stories, not artificial human personas.
