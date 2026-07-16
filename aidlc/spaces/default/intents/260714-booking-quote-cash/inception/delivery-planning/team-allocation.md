# Team Allocation - W1-01 Booking Quote-to-Cash

## Operating Model

One stream-aligned W1-01 mob owns all three Bolts. The user is stakeholder and approval owner; Codex is implementation driver in the dedicated worktree. Booking remains journey owner while Charge, CMM, Shared Platform, UI, quality, data, and live-proof responsibilities are explicit rotating hats rather than invented named staff or parallel teams.

## Bolt Assignments

| Bolt | Driver | Required navigator/reviewer hats | User role | Capacity stance |
|---|---|---|---|---|
| B01 Real Bidirectional Journey | Codex / Booking journey owner | Charge, CMM, Shared Platform, data migration, UI, contract, quality, live proof | Approve schema exception/waiver already recorded; approve mandatory skeleton gate | One active Bolt; tests/evidence included in scope |
| B02 Replay and Restart Safety | Codex / Booking journey owner | Booking/CMM data, messaging, Charge idempotency, quality, live proof | Construction gate only if ladder selects gated; decide any exception | One active Bolt; no competing intent work |
| B03 Live Release Acceptance | Codex / Booking journey owner | Quality, UI/accessibility, performance, contracts, operations/live proof | Final gate and merge authorization | One active Bolt through evidence/audits |

## Responsibility Matrix

| Deliverable/decision | User | Codex | Booking | Charge | CMM | Platform | UI | Quality/live proof |
|---|---|---|---|---|---|---|---|---|
| Scope, exceptions, phase/Bolt gates | A | R | C | C | C | C | C | C |
| Booking domain/API/DB/BFF | I | R | A | I | C | I | C | C |
| Pricing contract/provider | I | R | A | C | I | I | C | C |
| `booking.confirmed` producer/consumer | I | R | A | I | C | C | I | C |
| `containermovement.status` producer/consumer | I | R | C | I | A | C | C | C |
| Shared messaging adoption | I | R | C | I | C | A | I | C |
| Accessible Booking workflow | I | R | A | I | C | I | C | C |
| Tests, Compose, performance, audits | I | R | C | C | C | C | C | A |

Legend: A = accountable, R = responsible, C = consulted, I = informed. Roles describe repository ownership and review criteria; Codex may execute multiple hats but cannot silently waive their evidence.

## Engagement Checkpoints

- Charge review fires when pricing OpenAPI/Pact/provider semantics or claim/idempotency behavior changes.
- Booking/CMM producer-consumer review fires for either canonical event contract, key, ordering, retry, or DLT behavior.
- Shared Platform review fires only if service-local adoption cannot work and shared publisher/registrar/relay source would change.
- Data review fires before any migration/backfill is accepted and after two-restart preservation proof.
- UI/quality review fires for each visible state and before screenshot/accessibility evidence.
- User approval remains mandatory at the B01 walking-skeleton gate and the Delivery/phase gates; the post-B01 ladder controls only later Bolt gates.

## Branch and Handoff Discipline

- Use short-lived Bolt work with squash integration under the affirmed `integ/main-reconciled` program target; preserve the current intent record and unrelated user changes.
- A Bolt handoff includes changed paths, focused/broad test results, live evidence paths, unresolved risk, and exact contract/migration impact.
- No calendar date, velocity, staff utilization, or multi-team throughput is promised.

## Source Coverage

Allocation traces requirements and acceptance in `requirements.md`, actors/outcomes in `stories.md`, UI responsibilities in `mockups.md`, component ownership in `components.md`, units in `unit-of-work.md`, sequencing constraints in `unit-of-work-dependency.md`, story ownership in `unit-of-work-story-map.md`, and the one-mob/branch/deployment stance in `team-practices.md`.
