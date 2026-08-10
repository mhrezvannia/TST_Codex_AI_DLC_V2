# External Dependency Map - W2-04 Container Journey & Track-Trace

## Source Alignment

Dependencies derive from `requirements.md`, `stories.md`, refined `mockups.md`,
application `components.md`, `unit-of-work.md`,
`unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and
`team-practices.md`. "External" here means outside the W2-04 mob's decision
boundary, including other repository owners and the serialized acceptance slot;
it does not imply a public vendor or cloud service.

## Gated Dependencies

| Dependency/gate | Owner | Lead time/status | Consuming Bolt/gate | What it blocks | Mitigation/workaround |
| --- | --- | --- | --- | --- | --- |
| W2-02 design-system foundation merge | W2-02 UI owner | Pending; must merge first | B01-B03 UI synchronization; final gate | Final visual/live acceptance and W2-04 merge, not safe backend work | Build only CMM-owned composition against current contract; do not edit `packages/ui`; sync integration after merge. |
| Booking status contract/consumer co-sign | Booking owner | Review at contract change | B01/B02 | Contract/projection closure | Keep producer ownership and backward compatibility; parallel provider/consumer work behind reviewed schemas. |
| Identity catalog/evaluator and exact assignments | Identity owner | Existing seam; acceptance fixtures required | B01/B03 | Protected reads/capture and outage proof | Use exact read/capture permission tuples; no actor fallback or authorization cache. |
| Active Reference Data route/location/equipment | Reference Data owner | Existing seam/data availability | B01/B02/B03 | Valid intake/capture and degraded scenario | Stable IDs only; explicit invalid/inactive outcomes; authorized last-known read, capture disabled on outage. |
| Exclusive `linercore-wave-a` Compose slot | Wave A release coordinator | Schedule immediately before each live run | Every Bolt live DoD and final gate | Live evidence only | Continue non-live checks while waiting; one controller; no manager-demo commands; demo guard before/after. |
| Integration baseline synchronization after W2-02 | Integration owner + W2-04 driver | After W2-02 merge | Final gate | Final visual/live evidence and merge | Rebase/merge per repository policy, preserve prior intents, rerun affected fast checks before stack reservation. |
| W1 evidence/waiver record | Release/audit owner | Existing immutable history | Final gate | Audit interpretation | Reference, do not rewrite; later PASS remains separate. |

## Non-blocking Coordination

| Party | Why informed | Does not authorize |
| --- | --- | --- |
| W2-03 Charge team/session | Coordinate shared integration and live-stack timing | W2-04 code changes, contract ownership, or a DAG dependency |
| W2-02 UI owner before merge | Clarify shared primitive availability and page integration | W2-04 redesign of shared shell or `packages/ui` |
| Platform/security reviewers | Review broker/outbox/RBAC/audit evidence | Public-cloud expansion or new identity mechanisms |

## Dependency Failure Policy

- Missing owner sign-off blocks only the seam that owner controls; it does not
  broaden scope or justify a placeholder.
- A deterministic contract, migration, authorization, or acceptance failure is
  blocking. Only one evidence-preserving retry is allowed for an environmental
  live-stack failure.
- Stack unavailability is scheduling pressure, not permission to target port
  8088, reuse another session's Compose project, or claim completion from mocks.
- No EDI provider, public DCSA API, fleet registry, depot, M&R, D&D, SaaS,
  vendor, or AWS dependency exists in this intent.

## Readiness Checklist

- [ ] B01 contract reviewers and preserved W1 migration fixture available.
- [ ] Identity/Reference Data acceptance identities and data prepared.
- [ ] B01 gate approved before B02/B03 completion.
- [ ] Booking co-sign complete for status contract/projection changes.
- [ ] W2-02 merged and W2-04 synchronized before final visual acceptance.
- [ ] Exclusive `linercore-wave-a` slot reserved with one controller.
- [ ] Demo guard, audit tools, and evidence path available.

