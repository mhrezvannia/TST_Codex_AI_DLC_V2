# W3-04 Booking Request Completeness — Risk and Sequencing Rationale

## Source Alignment

The rationale consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. It uses the approved DAG as topology and the guided human decision as the economic choice; it does not infer business scores, dates or staffing.

## Chosen Heuristic

The sequence is **walking-skeleton-first, then risk-first within the DAG**.

1. B01/U01 is mandated by affirmed practice and validates the real architecture before breadth.
2. B02/U03 precedes B03/U02 because the cross-owner confirmation-grade schedule contract is a Conditional-GO seam already touched by PB-01; resolving its full provenance/degradation behavior reduces shared-authority risk early.
3. B04/U04 precedes B05/U05 because additive legacy migration, restart and correction are XL data-integrity risks and U06 consumes the live Correct route. U04 and U05 are dependency-independent, so this is an economic choice rather than a new edge.
4. B06–B08 follow forced dependencies: current correction+validation enable exact pricing; pricing enables confirmation; confirmation enables final operational convergence.

No numeric WSJF/CD3 score is published. Approved artifacts contain no calibrated user-business value, time-criticality or Cost of Delay numbers; assigning them would create false precision. The qualitative matrix makes the judgment inspectable.

## Qualitative Decision Matrix

| Bolt | User value | Cross-owner uncertainty | Data/compatibility risk | Relative size | Sequencing implication |
|---|---|---|---|---|---|
| B01 U01 | High | High — Shared Platform/LinerCore | High — new typed spine/operation recovery | L | First: separately gated architecture proof |
| B02 U03 | High | High — Shared Platform schedule | High — stale/partial/temporal authority | L | Before U02: resolve schedule contract risk already exposed by B01 |
| B03 U02 | High | High — Reference Data/W2-02 | Medium — field/null/bounds round-trip | L | After B02 by risk decision; required before U04/U05 |
| B04 U04 | High | Medium — Booking/operations | Critical — migration/restart/lost-fact risk | XL | Before U05: attack largest independent data-integrity risk |
| B05 U05 | High | High — Shared Platform validation | High — stale/denied/provider semantics | L | After B04 by risk decision; both required by U06 |
| B06 U06 | High | High — Charge | Critical — commercial accuracy/idempotency | XL | Dependency-forced after U04/U05 |
| B07 U07 | High | High — CMM/Kafka/Schema Registry | Critical — event compatibility/false physical facts | XL | Dependency-forced after U06 |
| B08 U08 | High | High — all seams/LinerCore/operations | High — convergence/privacy/evidence debt | XL | Final dependency sink and integrated confidence gate |

“High” labels are ordinal comparisons for planning discussion, not numerical WSJF inputs or production risk probabilities.

## DAG Validation

The ordered path is a valid topological sort of `unit-of-work-dependency.md`:

```text
B01/U01 -> B02/U03 -> B03/U02 -> B04/U04 -> B05/U05 -> B06/U06 -> B07/U07 -> B08/U08
```

- U03 and U02 both require only U01; choosing U03 first is permitted.
- U04 and U05 both require U02+U03; choosing U04 first is permitted.
- U06 waits for both U04 and U05; U07 waits for U06; U08 waits for U07.
- There is no topological deviation to justify. The plan selects one of the multiple valid branch orders for explicit risk reasons.

## Risk Register

| Risk | Likelihood | Impact | Earliest Bolt | Trigger/evidence | Treatment and owner |
|---|---|---|---|---|---|
| Named owners/backups/capacity remain unknown | High until confirmed | High | B01 | Any required readiness field remains TBD | Delivery facilitator blocks Bolt entry; user approves roster/plan change |
| Shared Platform schedule facts incomplete/unavailable | Medium | Critical | B01/B02 | Contract/test data lacks cutoff/deadline/version/degradation truth | Shared Platform owner resolves; no guessed milestone; dependent Bolt BLOCKED |
| W2-02 multiline primitive unavailable/incompatible | Medium | High | B03 | Released `@erp/ui` lacks approved TextArea/counter contract | LinerCore owner publishes/fixes; no Booking-local substitute; B03 BLOCKED |
| Legacy upcast loses or fabricates facts | Medium | Critical | B04 | Representative corpus, rerun or baseline drift fails | Pair migration owner+quality; additive ledger/restart proof; no destructive rewrite |
| Reference validation drifts from captured request | Medium | High | B05 | Fingerprint/version mismatch or denial invokes provider | Shared Platform+Booking contract tests; fail closed and preserve request |
| Charge fallback/duplicate/malformed acceptance | Medium | Critical | B06 | Captured input differs or duplicate effect/guessed total appears | Bilateral fixtures/provider proof, same-identity journal and zero-duplicate gate |
| Undiscovered consumer or Avro mismatch | Medium | Critical | B07 | Inventory/schema compatibility or live consumer proof incomplete | CMM/Kafka owners block cutover; single destination; no silent dual publication |
| CMM creates physical journey from demand | Medium | Critical | B07 | Any synthetic ID/journey/movement row after confirm | Dedicated pending path, exact event/read tests, activation gate and rollback |
| Canonical UI forks LinerCore or second `/bookings` behavior | Low/Medium | High | B01/B08 | App-to-app import, local primitive/theme or divergent route appears | LinerCore review, mapping/fidelity audit and compatibility delegate only |
| Live evidence unavailable or reused | Medium | Critical | Every Bolt/B08 | Missing stack/browser/audit prerequisite or stale evidence tag | Quality/operations mark BLOCKED; protect serialized run; never infer PASS |

## Confidence Progression

| After Bolt | Confidence earned only if hypothesis passes |
|---|---|
| B01 | Core architecture and truthful create/reopen/idempotency work on the real stack |
| B02 | Schedule authority and degradation are trustworthy |
| B03 | Commercial breadth and design-system/reference integration preserve facts |
| B04 | Brownfield migration/correction is safe and recoverable |
| B05 | Current validation is a deterministic pricing gate |
| B06 | Commercial pricing is exact across all recovery states |
| B07 | Confirmation handoff is compatible, idempotent and physically truthful |
| B08 | One secure/accessibly operable workflow closes all live evidence |

Failure of a hypothesis stops at that Bolt’s gate and feeds a scoped revision; it does not authorize later Bolts or a weaker DoD.

## Replanning Rules

- A change in owner availability may propose another DAG-valid branch order only before affected Bolts begin and through user approval; B01 remains first.
- A new dependency or changed unit boundary returns to Units Generation/Application Design as directed by the engine.
- A contract scope change returns to the accountable provider and relevant AI-DLC gate.
- No risk treatment may introduce copied authority, local shared-UI workaround, new service, guessed default, skipped live check or parallel unapproved Bolt.
