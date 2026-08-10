# Risk and Sequencing Rationale - W2-03 Charge Tariffs & Agreements

## Decision Basis

The sequence in `bolt-plan.md` is a hybrid walking-skeleton-first and risk-first plan constrained by `unit-of-work-dependency.md`. It uses an ordinal WSJF-style comparison inspired by Cost of Delay/WSJF: business value, time criticality, risk reduction/opportunity enablement, and relative job size. No numeric composite is calculated because no measured Cost of Delay, capacity or duration inputs exist; project rules forbid fabricated precision.

Inputs are `requirements.md`, `stories.md`, refined `mockups.md`, Application Design `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. The affirmed first-slice rule makes B01 a separately gated one-real-rate skeleton; final value remains the full itemised agreement/tariff/reprice/manual release.

## Ordinal Economic Scorecard

| Bolt | Business value | Time criticality | Risk reduction / enablement | Relative size | Economic rationale |
| --- | --- | --- | --- | --- | --- |
| B01 Skeleton | Medium (not releasable) | High | Very high | M | Earliest falsifiable proof of migration, canonical HTTP, Booking snapshot and UI spine; reduces rework before full model. |
| B02 Rates/routing | High | High | High | L | Supplies all rate authorities, single migration ownership and stable Charge routes required downstream. |
| B03 Agreements | High | Medium | High | L | Enables agreement precedence/exact links; technically blocked by B02 completion. |
| B04 Full provider/manual cases | Very high | High | Very high | XL | Delivers Charge's final commercial authority and failure safety after B03; enables final Booking behavior. |
| B05 Booking reprice/failures | Very high | High | High | XL | Completes user-visible consumption/history/recovery; blocked by final provider semantics. |
| B06 Acceptance | Release-critical | Release-critical | Very high | XL | Converts implemented behavior into observed releasability; must follow every product unit and external gate. |

The table is comparative, not a mathematical WSJF score. Size does not justify violating the DAG or omitting release obligations.

## Why This Order

### B01 walking skeleton

The greatest early uncertainty is not rate CRUD alone; it is whether a real Charge-owned amount can traverse a new migration, canonical pricing provider, Booking port/codec/database and existing UI without hardcoded reconstruction. B01 touches that spine with one line because current v1 already permits one or more charges. It is gated, branch-progress-only behavior.

### B02-B03 authority foundation

B02 completes U01/U02, including all three rate categories and routing/BFF. B03 consumes them to complete agreement versions/links. Reversing them would violate exact-link and route dependencies. Combining them would enlarge cognitive scope and hide which authority model failed.

### B04-B05 provider then consumer

B04 replaces the provisional skeleton with final agreement-first/complete-tariff pricing and manual commercial cases. B05 then consumes the stable bilateral behavior for full snapshots, Reprice and negative outcomes. This avoids consumer inference against moving semantics while retaining required bilateral review.

### B06 release evidence

Acceptance is last by dependency, not low priority. Docker, demo guards, complete UI matrix, migration restart, regressions, performance and audits can only certify assembled behavior. Their owners/windows must be reserved early even though execution occurs in B06.

## Controlled DAG Deviation

`unit-of-work-dependency.md` says complete U04 depends on U03 and complete U05 depends on U04. B01 deliberately implements thin slices of U04/U05 before U03 to validate the spine. This is permitted only because:

- no Unit is marked complete in B01;
- the v1 contract already permits a single charge line;
- the skeleton does not claim agreement-first or complete-tariff semantics;
- B04 removes/absorbs provisional one-line behavior and proves final exactly-three-line rules;
- a separate user gate decides whether the risk proof is sufficient;
- B01 cannot merge as a release or satisfy U06.

If the implementation cannot isolate this partial behavior safely on the intent branch, B01 must be revised rather than shipping a runtime feature flag or weakening the final contract.

## Risk Register

| ID | Risk | Likelihood | Impact | Earliest controlling Bolt | Mitigation / gate |
| --- | --- | --- | --- | --- | --- |
| R01 | Skeleton becomes accidental partial product | Medium | Critical | B01 | Explicit non-release gate, no completed Units, B04 removal/absorption test, no production deployment. |
| R02 | Existing Charge SQL-init catalog cannot baseline safely | Medium | High | B01/B02 | Exact-catalog fail-closed strategy, baseline-shaped upgrade/restart/forward-repair tests, U01 sole migration owner. |
| R03 | Additive v1 fields/date/category behavior break old consumers | Medium | Critical | B01/B04 | Retain types/required fields, equal-date fixture, optional-in-schema/all-or-none runtime set, provider/consumer review. |
| R04 | Approval concurrency creates overlapping authorities | Medium | High | B02/B03 | Advisory-lock normalized keys, inclusive overlap tests, real PostgreSQL concurrency proof. |
| R05 | Agreement/tariff ambiguity yields partial or wrong price | Medium | Critical | B04 | Agreement-first zero-only fallback, exact three categories, ambiguity manual case, no partial result tests. |
| R06 | Booking flattens/overwrites or reconstructs pricing | Medium | Critical | B01/B05 | Typed append-only table/codec, legacy dual-read, field-for-field/provider-disabled tests. |
| R07 | Outage/no-rate/ambiguity meanings collapse | Medium | High | B04/B05 | Exact state matrix, one retry/five-operation circuit, Charge-case vs Booking-outage ownership tests. |
| R08 | W2-02 DS-01/02/03 gaps prevent a11y/ribbon proof | High until integrated | High | Reserve B02; gate B06 | Charge-local DS-01 only, explicit shared-owner handoff for DS-02/03, blocked cells never called PASS. |
| R09 | Docker/Compose unavailable | High in current sandbox | Critical for gates | Reserve before B01; execute B01/B06 | Assign Docker-capable release reviewer/runner; no live claim without it. |
| R10 | Manager demo port/project is mutated | Low with guard | Critical | B01/B06 | Wrapper-only `linercore-wave-a`, port 18088, guards before/after, abort on pre-guard failure. |
| R11 | W0/W1/W2 regressions or W1 waiver rewritten | Medium | High | B06 | Regression/evidence diff; preserve historical waiver and record any new proof separately. |
| R12 | Unverified staffing/capacity makes schedule fictional | High | Medium | Before Construction | Role/system-agent assignment only, WIP one, no dates, pause missing independent review. |
| R13 | Commercial/log evidence leaks sensitive values | Low/Medium | High | Every Bolt | Session/service authorization, safe audit fields, redaction tests, no payload metric labels. |
| R14 | Provisional local p99 is overstated as production SLO | Medium | Medium | B06 | Record environment/raw samples/concurrency and label <=800 ms as local acceptance only. |

## Go/No-Go Conditions by Transition

| Transition | Go condition | No-go response |
| --- | --- | --- |
| B01 to B02 | Skeleton gate accepted with real line evidence or an explicitly approved revised plan | Diagnose/revise spine; do not build full surface on unproven assumptions. |
| B02 to B03 | U01/U02 complete, migration ownership clean, rates/routes real | Correct authority/routing gaps. |
| B03 to B04 | Exact approved agreement links/lifecycle/history pass | Correct schema/domain ambiguity before pricing. |
| B04 to B05 | Final provider contract and success/manual meanings reviewed green | Hold consumer completion; fix bilateral mismatch. |
| B05 to B06 | Booking snapshot/reprice/failure fidelity and focused UI tests green | Fix consumer behavior before expensive live matrix. |
| B06 to release | Every guard/live/browser/performance/regression/audit gate observed green | Intent remains incomplete; no waiver invented by this plan. |

## Preserved Boundaries

- No generic pricing service, rules engine, event workflow, AWS topology or production pipeline.
- No modification of `packages/ui`, shared shell/navigation, typography or palette.
- No manual quote entry/resolution workflow.
- No commodity/weight rating dimension.
- No manager 8088 targeting.
- No reinterpretation of the original W1 waiver as a real PASS.

## Upstream Sources

- `requirements.md`
- `stories.md`
- refined `mockups.md`
- Application Design `components.md`
- `unit-of-work.md`
- `unit-of-work-dependency.md`
- `unit-of-work-story-map.md`
- `team-practices.md`

