# Unit-to-Story Map - W2-03 Charge Tariffs & Agreements

## Mapping Contract

This map assigns every Must outcome in `stories.md` and every mandatory release constraint to the six units derived from Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`, with requirement coverage checked against `requirements.md`. “Primary” means the unit owns the story's decisive behavior; “supporting” means it supplies an integration or proof seam. Within-unit sections are unordered coverage and logical constraints, not implementation sequence.

## Story Coverage Matrix

| Story | Outcome | Primary unit | Supporting units |
| --- | --- | --- | --- |
| US-01 | Find and inspect Charge authority | U01 Rate Authority, U03 Agreement Authority | U02 Routing/BFF, U06 Acceptance |
| US-02 | Create a valid Draft rate version | U01 Rate Authority | U02 Routing/BFF, U06 Acceptance |
| US-03 | Approve immutable non-overlapping rate authority | U01 Rate Authority | U06 Acceptance |
| US-04 | Build Draft agreement from exact approved versions | U03 Agreement Authority | U01 Rate Authority, U02 Routing/BFF, U06 Acceptance |
| US-05 | Approve/version agreement without rewriting history | U03 Agreement Authority | U01 Rate Authority, U06 Acceptance |
| US-06 | Receive real agreement-basis itemised price | U04 Pricing Provider | U03 Agreement Authority, U05 Booking Consumer, U06 Acceptance |
| US-07 | Fall back to complete tariff basis | U04 Pricing Provider | U01 Rate Authority, U05 Booking Consumer, U06 Acceptance |
| US-08 | Persist/display typed immutable snapshot | U05 Booking Consumer | U04 Pricing Provider, U06 Acceptance |
| US-09 | Reprice pricing-affecting amendment and retain history | U05 Booking Consumer | U04 Pricing Provider, U06 Acceptance |
| US-10 | Enter manual-required state for no rate | U04 Pricing Provider, U05 Booking Consumer | U06 Acceptance |
| US-11 | Preserve ambiguity and provider-failure meaning | U04 Pricing Provider, U05 Booking Consumer | U06 Acceptance |
| US-12 | Inspect OPEN manual-case evidence | U04 Pricing Provider/Manual Cases | U02 Routing/BFF, U06 Acceptance |
| US-13 | Enforce authorization and provenance | U02 Routing/BFF | U01, U03, U04, U05, U06 |
| US-14 | Complete workflows accessibly | U02 Routing/BFF | U01, U03, U04, U05, U06 |
| US-15 | Use views at required widths/themes | U06 Acceptance | U01, U02, U03, U04, U05 |

## Mandatory Quality-Constraint Coverage

| Constraint | Primary unit | Supporting units | Evidence boundary |
| --- | --- | --- | --- |
| QC-01 Additive migration, integrity, compatibility | U06 Acceptance | U01, U03, U04, U05 | Baseline upgrade/backfill/restart/restore, immutability, provider-consumer and legacy snapshot proofs. |
| QC-02 Isolated live proof and manager protection | U06 Acceptance | U01-U05 | Wrapper/project manifest, guards before/after, 8088 untouched, API/DB/UI/correlation scenarios. |
| QC-03 Performance and blocking quality gates | U06 Acceptance | U01-U05 | Raw 100+ sample p99, coverage, browser matrix, quality gates and both audits. |

## Within-Unit Coverage and Logical Constraints

No within-unit implementation order is selected here. The following unordered sets describe story coverage and acceptance constraints; Delivery Planning/Construction decides sequencing.

### U01 Rate Authority

- US-01 covers readable rate identity, query, detail and history.
- US-02 covers valid Draft creation/edit.
- US-03 covers approval, overlap/concurrency rejection, immutability and successor history.
- US-13/US-14 apply to every command/view.
- Logical constraint: approval acceptance requires an existing valid Draft, but this does not prescribe task order.

### U02 Charge Domain Routing and BFF

- US-13 covers session-derived subject/capability/correlation and denied behavior.
- US-14 covers stable route/loading/error/focus/live-region patterns and the Charge-local DS-01 wrapper.
- US-01/US-12 use the route contract for deep links and protected evidence access.
- US-15 uses existing LinerCore responsive/theme tokens; U06 owns the final matrix.

### U03 Agreement Authority

- US-01 covers agreement list/detail/history and version/link identities.
- US-04 covers a Draft linked to exact Approved U01 versions.
- US-05 covers approval, successor, suspend/expire and immutable history.
- US-13/US-14 apply to all agreement commands and views.
- Logical constraint: exact Approved U01 links must exist before an agreement can satisfy approval criteria.

### U04 Pricing Provider and Manual Cases

- US-06/US-07 cover the canonical enriched success contract for agreement and tariff bases.
- US-10 covers no-rate terminal receipt, one OPEN case and exact 404 response.
- US-11 covers ambiguity and every non-success distinction without partial price.
- US-12 covers authorized read-only OPEN no-rate/ambiguity evidence.
- US-13/US-14 cover service/human identity, provenance and accessible manual evidence.
- Shared constraint: all success/failure fixtures use the same canonical provider contract and all listed outcomes are required for unit completion.

### U05 Booking Consumption and Repricing

- US-08 covers typed append-only storage, provider mapping and legacy decode.
- US-06/US-07 cover rendered authoritative agreement/tariff itemisation.
- US-09 covers pricing-input detection, explicit Reprice and prior/current history.
- US-10/US-11 cover no-rate, ambiguity, outage, denied, invalid, conflict and pending projections without totals.
- US-13/US-14 cover authorization, correlation and accessible async recovery.

### U06 Isolated Acceptance and Preservation

- US-13 covers end-to-end authorization/provenance and regression preservation.
- US-14 covers keyboard/focus/live-state behavior.
- US-15 covers the four-width/two-theme visual interaction matrix.
- QC-01 covers migration/integrity/compatibility evidence.
- QC-02 covers isolated live scenario/guard evidence.
- QC-03 covers measured performance and blocking gates/audits.

These unordered relationships do not recommend economic Bolt sequencing.

## Cross-Cutting Story Map

| Cross-cutting story | Required behavior in each affected unit |
| --- | --- |
| US-13 Authorization/provenance | U01/U03 commercial audit; U02 session/capability boundary; U04 service/case/result evidence; U05 Booking result/outage evidence; U06 denied/spoofed/correlation proof. |
| US-14 Accessible workflow | U01/U03 forms/actions/history; U02 route/focus/live-region foundation and honest DS dependencies; U04 manual queue states; U05 pricing/reprice states; U06 automated/keyboard evidence. |
| US-15 Responsive/theme use | U01/U03/U04/U05 components use shared tokens and named overflow; U02 retains stable base-path routes; U06 captures every required width/theme. |
| QC-01 | Schema writers live in U01/U03/U04/U05; U06 owns integrated baseline/restart/compatibility observation. |
| QC-02/QC-03 | Product units expose test/observability seams; U06 owns release evidence and never upgrades an unobserved claim to PASS. |

## Coverage Verification

- All 15 Must outcome stories have at least one primary implementing unit.
- QC-01, QC-02 and QC-03 remain explicitly non-story release constraints and are assigned to U06 with contributing units.
- Every unit has one or more assigned user stories: U01 (US-01-US-03), U02 (US-13-US-14 plus supporting US-01/US-12/US-15), U03 (US-01/US-04-US-05), U04 (US-06-US-07/US-10-US-14), U05 (US-06-US-11/US-13-US-14), U06 (US-13-US-15).
- Every requirement family is reachable: FR-001-FR-205 through U01-U03; FR-301-FR-407 through U04; FR-501-FR-507 through U05; FR-601-FR-606 through U01-U05; FR-701-FR-706 and NFR-001-NFR-010 through contributing units plus U06 evidence.
- No unit claims manual quote/resolution, a new service/cloud deployment, shared shell/UI redesign, or rewriting the W1 waiver as a real PASS.

## Upstream Sources

- Application Design: `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`
- Requirements Analysis: `requirements.md`
- User Stories: `stories.md`
