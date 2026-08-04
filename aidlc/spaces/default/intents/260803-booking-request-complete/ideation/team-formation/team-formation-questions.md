# Team Formation Questions — W3-04 Booking Request Completeness

## Established delivery context

- Inputs reviewed: `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`.
- Booking is the single Driver. Shared Platform owns the voyage/reference contribution; Charge owns pricing review; CMM reviews the confirmation contract; LinerCore/W2-02 owns shared UI governance.
- No AWS services or AWS Professional Services are applicable because the platform is on-premises.
- No named human roster, allocation percentage, timezone distribution, or hard deadline is documented. The team plan must not invent them and must revalidate availability in Delivery Planning.

## Pending team decisions

1. What staffing basis should Team Formation use?
   - A. Produce a role-based accountable plan using the existing owning teams and AI-DLC specialist roles; leave named individuals and exact allocations TBD for Delivery Planning (recommended)
   - B. Pause until a named human roster is provided
   - C. Treat W3-04 as a solo-developer effort
   - X. Other
   - `[Answer]: A — Role-based accountable plan; names/allocations deferred to Delivery Planning.`

2. What team topology best fits W3-04?
   - A. Booking stream-aligned Driver with time-boxed collaboration from Shared Platform and Charge, CMM contract review, and design/quality/security/compliance enabling support (recommended)
   - B. One permanent cross-module team jointly owns every service
   - C. Separate layer teams own frontend, backend, database, and testing
   - X. Other
   - `[Answer]: A — Booking stream-aligned Driver with time-boxed contributors and enabling support.`

3. How should unknown capacity be handled?
   - A. Record availability as TBD/no known blocker, avoid utilization guesses, sequence the critical path, and require named capacity confirmation in Delivery Planning (recommended)
   - B. Assume every required role is full-time and immediately available
   - C. Assume all contributors are available only part-time at a fixed percentage
   - X. Other
   - `[Answer]: A — Capacity TBD; revalidate without guessing.`

4. What collaboration mode should be preferred?
   - A. Focused mob/pair sessions for the high-risk field dictionary, voyage contract, migration, pricing, and event seams; solo execution for well-understood bounded tasks, with contract-owner review (recommended)
   - B. Full-team mobbing for all work
   - C. Independent solo work with asynchronous review only
   - X. Other
   - `[Answer]: A — Focused mob/pair sessions for high-risk seams; reviewed solo execution for bounded tasks.`

5. How should unspecified time zones and locations be handled?
   - A. Use async-first artifacts/contracts and recorded decisions, with scheduled synchronous reviews only for high-risk seams and gates; do not assume co-location (recommended)
   - B. Assume one co-located team and synchronous communication
   - C. Delay planning until every location is known
   - X. Other
   - `[Answer]: A — Async-first artifacts and recorded decisions; synchronous reviews only for high-risk seams and gates.`

6. Are external partners or contractors required?
   - A. No external partner is currently required; use existing teams and AI-DLC roles, and reopen only if a verified skill/capacity gap remains (recommended)
   - B. Engage an enterprise TMS vendor for implementation
   - C. Engage AWS Professional Services
   - X. Other
   - `[Answer]: A — No external partner currently required; reopen only for a verified skill or capacity gap.`

7. Who holds decision rights?
   - A. User/Booking product owner approves stage/scope gates; Booking technical owner decides Booking design; Shared/Charge/CMM owners approve their contracts; LinerCore owner approves shared UI changes; quality/security/compliance gate exit evidence (recommended)
   - B. Delivery lead decides every product and contract question
   - C. Each implementer decides independently within their files
   - X. Other
   - `[Answer]: A — Accountable owners retain product gates, Booking design, cross-module contracts, shared UI governance, and exit-evidence decisions.`

## Consolidated confirmation

- `[Answer]: Confirmed — role-based Booking driver; time-boxed contributors and enabling support; capacity/names/locations deferred to Delivery Planning; focused seam collaboration; async-first; no external partner; accountable domain owners.`

## Ambiguity and gap analysis

- `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md` establish ownership topology, required capabilities, dependency order, and the Conditional GO constraints.
- Named individuals, backups, allocation windows, time zones, and a delivery calendar are not documented and are intentionally not invented. Delivery Planning must resolve them before commitment.
- Shared Platform ownership of the authoritative voyage cutoff/documentation-deadline contribution is required, but named availability remains unconfirmed.
- Roster-level coverage for migration/upcast, Pact/provider testing, Avro compatibility, LinerCore governance, accessibility, security/privacy, and live operations remains to be verified.
- No known blocker or verified skill gap currently requires a vendor, contractor, cloud provider, or AWS Professional Services.
