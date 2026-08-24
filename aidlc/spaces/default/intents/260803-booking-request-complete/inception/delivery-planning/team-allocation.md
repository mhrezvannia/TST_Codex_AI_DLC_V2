# W3-04 Booking Request Completeness — Team Allocation

## Source Alignment

Allocation is derived from `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`, plus the executed Team Formation artifacts `team-assessment.md`, `skill-matrix.md`, and `mob-composition.md`. It preserves Booking as the stream-aligned Driver and provider/shared owners as time-boxed contributors.

## Allocation Status

The role topology is approved; named individuals, backups, actual capacity, locations, overlap windows and lead times remain `TBD`. Therefore this is a responsibility and readiness plan, not a staffing or calendar commitment. Each Bolt is BLOCKED before commitment until its accountable owner, delivery owner, critical backup and required review windows are recorded.

No contractor, vendor, AWS service or AWS Professional Services role is introduced. AI-DLC agents may execute/review scoped engineering artifacts, but they do not replace the user/product gate or Shared Platform, Charge, CMM and LinerCore contract decision rights.

### B01 Readiness Update

The user explicitly answered `confirm` on 2026-08-10 for the complete B01 entry set. For U01 Functional Design, the role-based Core Booking cell and required Shared Platform, identity/security, operations/platform, quality/accessibility, and audit support are therefore treated as available. Personal names, credentials, and calendar details were not supplied and are not inferred; the named roles below remain the accountable identities in this record. The confirmation is not reusable for later Bolts or as live acceptance evidence.

## Core Booking Delivery Cell

| Role | Persistent responsibility | Named owner | Backup | Capacity/window |
|---|---|---|---|---|
| Booking product owner/user delegate | Outcome, field semantics, priority and human gates | User/accountable role known; delegate TBD | TBD | TBD |
| Booking technical/domain owner | End-to-end design, aggregate/API/persistence and seam accountability | TBD | TBD | TBD |
| Booking frontend/BFF engineer | Canonical LinerCore composition, transport/policy and UI state | TBD | TBD | TBD |
| Booking backend/domain engineer | Aggregate, completeness, operation journal, validation/pricing/confirm orchestration | TBD | TBD | TBD |
| Booking data/migration engineer | Snapshot v2, projection, migration ledger/backfill and recovery | TBD | TBD | TBD |
| Quality/contract/accessibility engineer | Tests, contracts, migration, browser/a11y, Compose and audit evidence | TBD | TBD | TBD |
| Delivery facilitator | Readiness, sequence, decisions, capacity conflicts and gate coordination | TBD | TBD | TBD |

Security/privacy/compliance, operations/platform and UX/design are enabling roles engaged at the named checkpoints below. A person may cover compatible roles only after capacity and conflict-of-interest checks; critical seams require backup coverage.

## Bolt-to-Mob Allocation

| Bolt | Accountable delivery cell | Focused seam contributors/reviewers | Readiness checkpoint |
|---|---|---|---|
| B01 PB-01 spine | Core Booking cell | Shared Platform voyage owner; LinerCore/UX owner; accessibility/quality; security/privacy; Compose operations | All names/backups/windows and isolated stack slot before B01 commitment |
| B02 trusted voyage | Core Booking cell | Shared Platform voyage/reference owner; architect; UX; contract/quality | Contract owner, test data and provider window before B02 |
| B03 complete request | Core Booking cell | Reference Data role/options owner; W2-02/LinerCore owner; UX/accessibility; privacy/quality | Released compatible `TextArea` plus named provider/design reviewers before B03 |
| B04 correction/migration | Core Booking cell with data/migration pairing | Booking data owner; database operations; migration/quality; security/privacy | Representative sanitized corpus, restart window and owner/backup before B04 |
| B05 current validation | Core Booking cell | Shared Platform validation owner; security/privacy; contract/quality | Validation contract/data window and reviewers before B05 |
| B06 exact pricing | Core Booking cell with integration pairing | Charge contract/provider owner; contract QA; security/privacy; product | Bilateral mapping/fixtures/provider window and owner/backup before B06 |
| B07 confirmation/CMM | Core Booking cell with integration pairing | CMM consumer owner; Kafka/Schema Registry operations; contract QA; security/privacy | Consumer inventory, topic/schema/consumer readiness and reviewers before B07 |
| B08 operational convergence | Core Booking cell | LinerCore/UX; accessibility/quality; all affected provider owners; operations; security/privacy/compliance | Protected demo/Compose window, full browser/audit prerequisites and final reviewers before B08 |

## Focused Seam Sessions

| Session | Latest safe point | Decision owner | Required outcome |
|---|---|---|---|
| Voyage authority | Before B01 and refreshed before B02/B05 | Shared Platform | Typed complete schedule/validation contract, test data and degradation semantics |
| Field dictionary/shared UI | Before B03 | Booking product + LinerCore/W2-02 + Reference Data | Released primitive and canonical field/role/validation behavior |
| Migration/correction | Before B04 | Booking technical/data owner | Representative corpus, restart/backfill/conflict proof plan |
| Exact pricing | Before B06 | Charge owner with Booking integration | Exact mapping, outcome matrix, provider fixtures/window and duplicate proof |
| Compatible confirmation | Before B07 | Booking integration + CMM owner | Exact Avro/header mapping, inventory, pending-assignment path and read states |
| Live exit | Before B08 completion | Quality with Booking/operations | Same-run Compose/browser/contracts/audits evidence manifest |

## Decision Rights

| Decision | Accountable | Responsible/consulted |
|---|---|---|
| Scope, Inception and Bolt gates | User/Booking product owner | Delivery facilitator; Booking owner; quality/security consulted |
| Booking design/API/persistence | Booking technical owner | Booking cell; architect; provider owners consulted |
| Reference/voyage contract | Shared Platform owner | Booking integration/domain; quality consulted |
| Pricing provider contract | Charge owner | Booking integration; product and contract QA consulted |
| Confirmation consumer contract | Booking producer owner and CMM consumer owner | Contract QA, operations and privacy consulted |
| LinerCore/shared primitive | W2-02/LinerCore owner | Booking frontend, UX and accessibility consulted |
| Exit evidence | Quality/security accountable with Booking owner | All affected providers and operations consulted |

## Capacity and Escalation Rules

- No Bolt enters committed Construction with a critical role, backup or review window still `TBD`.
- Availability conflicts first trigger resequencing only when the alternative remains DAG-valid and the user approves any binding plan change; evidence is never weakened to preserve a date.
- Cross-owner contract changes return to the relevant focused seam and, if they alter approved scope/design/DAG, to an AI-DLC approval gate.
- Bounded well-understood tasks may be solo with owner review. High-risk invariants, migrations, provider/consumer mappings, shared UI, privacy or operational behavior require pairing or the focused mob.
- Async-first artifacts and recorded decisions are the default; synchronous time is reserved for seam resolution, demo and gates.

## Allocation Exit Check

The team topology is coherent and covers every Bolt, but roster readiness is not yet satisfied. Before B01, record actual names, backups, capacity/overlap windows and the protected Compose slot. Before each later Bolt, refresh only its required contributors. Until then the applicable Bolt is **BLOCKED**, not ready by assumption.
