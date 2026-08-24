# Unit of Work Story Map - W4-01 Module List-Detail Uplift

## Source Alignment

This map assigns all 15 approved stories from `stories.md` to the four units derived from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, and `requirements.md`. It preserves each story's inherited acceptance contract and its explicit requirement trace. The combined Intent Exit Gate remains release-wide evidence and is not converted into a sixteenth story or a release-hardening unit.

## Story-to-Unit Map

| Story | Primary unit | Supporting unit(s) | Implemented outcome |
| --- | --- | --- | --- |
| US-001 - Enter only permitted module destinations | U01 | U02, U03, and U04 independently conform to W2-02's external platform contract | One shell navigation, fail-closed module read, direct denied state, read-only truth |
| US-002 - Preserve canonical links, safe return context, and retired routes | U01 | U02 owns Reference depth; U03 owns Charge retirement; U04 owns CMM canonical-first and cross-module origin cases | Direct refresh, safe same-module return, exact 308/404 matrix, no fictional CMM redirect |
| US-003 - Find a Reference record with provider-supported controls | U01 thin route/read foundation; U02 completion | None | Real set/record read first, then full provider query/state matrix |
| US-004 - Inspect a stable Reference record and its history | U01 thin stable detail; U02 completion | None | Shareable provider detail/history and complete failure/context states |
| US-005 - Create, validate, and update a Reference record safely | U02 | None | Supported create/update only; validation/version/deny/timeout truth |
| US-006 - Recover Reference work without fabricated fallback truth | U02 | None | Authorized source/time last-known behavior or provider error; fresh retry |
| US-007 - Find an Agreement with aligned provider filters | U03 | W2-02 platform contract is external, not a W4 unit dependency | Exact provider filters/page/order; no generic/client-simulated controls |
| US-008 - Inspect Agreement, version, rate, D&D, and status truth | U03 | None | Stable provider detail/history, D&D truth/unavailability, no guessed Booking link |
| US-009 - Execute legal Agreement lifecycle and version actions | U03 | None | Capability/provider-precondition commands with no optimistic lifecycle |
| US-010 - Review Charge and manual-pricing evidence without mutation | U03 | None | Read-only OPEN evidence; no resolution/repricing/zero-price workflow |
| US-011 - Discover recent Journeys without simulated controls | U04 | W2-02 platform contract is external, not a W4 unit dependency | New canonical recent list, provider order/limit, no client actor/search/page simulation |
| US-012 - Inspect a Journey timeline and exact Booking | U04 | None | Provider-owned ordered timeline and exact `/booking/[bookingId]` navigation |
| US-013 - Capture a movement without optimistic advancement | U04 | None | Signed/idempotent capture with accepted/rejected/pending/downstream-truth separation |
| US-014 - Navigate from Booking only to verified related records | U04 | W2-02 retains shell ownership; U04 owns the Booking adapter and safe origin contract | Exact Journey-by-Booking, signed bidirectional origin, honest Agreement blockers |
| US-015 - Inspect exact supporting rate-version evidence | U03 | None | Stable rate/version detail/history with validated Agreement context |

## Unit Story Backlogs and Internal Order

The order below is within each unit for coherent construction and test progression. It does not impose order between U02, U03, and U04.

### U01 `platform-reference-route-foundation`

1. US-001 - establish authenticated permitted navigation, direct denial, and read-only presentation.
2. US-002 - establish canonical refresh, route retirement, safe list return, and unsafe-target rejection.
3. US-003 (thin path) - render one real provider-backed Reference set/record list.
4. US-004 (thin path) - open one stable provider-backed Reference detail and return safely.

### U02 `reference-data-operational-completion`

1. US-003 - complete list query, paging, true-empty/filtered-empty, and all supported list states.
2. US-004 - complete Summary/Attributes/History, partial/stale/not-found/denied/error, and context behavior.
3. US-005 - add exact create/update capability, validation, conflict/version, pending, focus, and re-read outcomes.
4. US-006 - complete provider/Identity outage and authorized persisted-view recovery matrix.

### U03 `charge-agreements-operational-uplift`

1. US-007 - align list filters/page/order and URL refresh behavior.
2. US-008 - establish Agreement detail, immutable versions, rates, D&D, status, and honest relationship absence.
3. US-015 - add exact supporting rate-version list/detail/history and safe Agreement return context.
4. US-009 - add only legal Agreement/version lifecycle commands with typed rejection and re-read.
5. US-010 - add read-only OPEN manual-pricing evidence and capability-specific action absence.

### U04 `container-journeys-booking-uplift`

1. US-011 - create and mount the shared-shell recent-Journey route with provider-authoritative order/limit.
2. US-012 - add stable detail, provider-owned `timelineV1`, and exact Journey-to-Booking navigation.
3. US-014 - add Booking-to-Journey lookup and signed bounded origin behavior; retain Agreement blockers.
4. US-013 - add signed/idempotent capture and persisted/published/Booking-applied outcome separation.

## Cross-Cutting Story Responsibilities

US-001 and US-002 are consolidated under U01 for story-accountability because their actors and thin Reference route are exercised there. U02, U03, and U04 independently prove the applicable authorization, shared shell, canonical refresh, safe context, typed recovery, responsive/accessibility, and no-fork acceptance inherited by their own stories. W2-02 publishes the platform contract directly to each unit; this cross-cutting acceptance does not create U01 dependency edges.

US-003 and US-004 intentionally span U01 and U02: U01 proves the thinnest real UI-to-BFF-to-service-to-database Reference journey, while U02 completes the provider capability, state, history, mutation, and recovery depth. Neither unit can claim the other's completion evidence.

US-014 belongs to U04 because its shell-owned Booking adapter, safe origin contract, and CMM provider lookup must be exercised in the same vertical outcome under W2-02 ownership review. U01 supplies no Booking/CMM implementation prerequisite. The Agreement-to-Booking and Booking-to-Agreement directions remain blockers, not stories assigned to a fabricated implementation unit.

## Requirement-to-Unit Ledger

| Requirement | Disposition | Unit allocation |
| --- | --- | --- |
| FR-001 | shared | U01, U02, U03, U04 independently consume the one shell; U01 proves the first integrated Reference route |
| FR-002 | shared | U01/U02 Reference, U03 Charge, U04 CMM canonical routes and direct refresh |
| FR-003 | partial/primary | U01 thin provider read; U02 complete Reference list/detail/history |
| FR-004 | primary + blocked exits | U02 owns supported create/update and keeps unsupported lifecycle/Validate exits blocked |
| FR-005 | primary | U03 owns Agreement list/detail/rate/D&D/status truth |
| FR-006 | primary | U03 owns legal lifecycle/version actions and excludes manual resolution |
| FR-007 | primary | U04 owns Journey list/detail/timeline/Booking truth |
| FR-008 | primary | U04 owns capture and typed accepted/rejected/downstream outcomes |
| FR-009 | shared | U01 establishes Reference query validation; U02/U03/U04 own their exact provider controls |
| FR-010 | shared | Each unit owns its applicable list-state matrix |
| FR-011 | partial/shared | U01 thin Reference detail state; U02/U03/U04 own complete domain detail/action states |
| FR-012 | shared | Each unit owns current-request navigation/read/action presentation for its routes |
| FR-013 | shared primary | U02, U03, U04 own their mutation form/pending/focus/result behavior |
| FR-014 | primary + blocked | U04 owns Journey/Booking directions; U03 preserves blocked Agreement/Booking directions |
| FR-015 | shared | U01 establishes safe Reference context; U02/U03/U04 own domain/cross-module context |
| FR-016 | shared | U01-U04 reject unsafe return/origin input at their route boundaries |
| FR-017 | split primary | U01 owns Reference in-place root; U03 owns exact Charge retirement routes |
| FR-018 | primary | U04 owns canonical-first CMM entry with no legacy redirect |
| FR-019 | partial/shared | U01 establishes truthful failure boundary; U02/U03/U04 own domain last-known/degradation rules |
| FR-020 | shared | U01-U04 require current-request Identity authorization; no stale authorization |
| FR-021 | shared | U01-U04 own safe actionable messages and typed correlation evidence |
| FR-022 | shared | U01-U04 consume the common shell/list/detail grammar while retaining domain vocabulary |
| NFR-001 | shared + intent-exit | Each unit records its route/BFF sample; the integrated 10-user p95 verdict is intent-exit |
| NFR-002 | shared | Each unit proves WCAG behavior on its routes; integrated matrix repeats at exit |
| NFR-003 | shared | Each unit proves its routes at five widths/two themes; integrated matrix repeats at exit |
| NFR-004 | shared | Each unit proves real subject, server policy, no data flash/spoof/client authority |
| NFR-005 | shared | U01-U04 prove context retention/no silent advance for their recoverable outcomes |
| NFR-006 | intent-exit | U01-U04 contribute changed-frontend sets/tests; the pinned >=80% verdict is one final gate |
| NFR-007 | intent-exit | Unit-local checks contribute evidence; the combined blocking test/build/live/audit verdict is final |
| NFR-008 | intent-exit | Each unit contributes its changed security surface; one bounded W4 aggregator verdict gates merge |
| NFR-009 | shared | Every unit preserves strict TS/App Router/ports-and-adapters and no shared UI fork |
| NFR-010 | shared | Every unit distinguishes typed outcomes and retains safe correlation/audit evidence |
| NFR-011 | shared + blocker | Every unit labels evidence truthfully; U04/intent cannot finish with poison/replay exit open |
| NFR-012 | shared + intent-exit | Unit live proof uses only approved Compose boundary; manager guard/full release verdict is final |

## Coverage Verification

- Story inventory: 15 unique approved stories, US-001 through US-015.
- Assigned stories: 15 of 15; unassigned stories: 0; duplicated primary ownership: 0.
- U01 has four primary/thin-path story responsibilities; U02 has four; U03 has five; U04 has four.
- Every unit has at least one actor-valued story and an observed running-stack outcome.
- FR-001 through FR-022 and NFR-001 through NFR-012 each have an explicit disposition and precise unit or intent-exit allocation.
- The Intent Exit Gate stays outside the INVEST count and is exercised only after all unit outcomes integrate.
- Provider/platform exits remain dependencies with owners and evidence, never client-simulated story completion.

## Story Map Review Checklist

- [x] Every story maps to an implementing unit.
- [x] Every unit has stories and a user-observable outcome.
- [x] Cross-unit stories identify primary and supporting responsibilities.
- [x] Internal story order is stated without choosing an inter-unit critical path.
- [x] Shared shell, tokens, `@erp/ui`, data, and contract ownership are preserved.
- [x] Blocked capabilities and cross-links are not converted into unsupported stories.
- [x] Full FR/NFR and intent-exit evidence remains traceable.
