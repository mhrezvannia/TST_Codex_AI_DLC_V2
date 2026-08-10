# Unit of Work Story Map - W3-01 Vertical D&D Rules and Rates

## Source authority and mapping rules

This map traces approved `stories.md` and `requirements.md` through the four units derived from Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, LinerCore `mockups.md` and `team-practices.md`. Unit boundaries are in `unit-of-work.md`; hard topology is in `unit-of-work-dependency.md`.

Stories cross units only when a walking skeleton proves a thin real path before a later slice completes the story's breadth. `Primary` names the unit accountable for the full story outcome; `Foundation` names a real accepted subset. This map does not create component stories or a test-only release unit.

## Story-to-unit matrix

| Unit | US-01 Author terms | US-02 Govern versions | US-03 Calculate snapshot | US-04 Safe attempts | Intent-level verification |
| --- | --- | --- | --- | --- | --- |
| `dnd-author-price-walking-skeleton` | Primary representative vertical; foundation for all types | Lifecycle foundation | Happy-path foundation | Successful-attempt/audit foundation | Contract fixture/signoff producer; focused vertical proof |
| `dnd-version-trigger-governance` | Completes all types/applicability/UI breadth | Primary | Successor/trigger prerequisite | Standard enrichment release/replay support | W2 runtime/replay and lifecycle/UI evidence |
| `dnd-exact-historical-calculation` | - | Historical linkage support | Primary/completes | Exact success/no-rate distinction foundation | Numeric/timezone/historical/performance evidence producer |
| `dnd-safe-attempts-evidence` | Authorization/audit support | Denied/evidence support | Preserves exact success contract | Primary/completes | Error/security/concurrency/evidence producer |

Every story has one primary completion owner and every unit delivers an observable part of at least one approved story. Final RV evidence is verified/collected at the intent exit gate, not owned by a fifth unit.

## US-01 - Author deterministic D&D terms

**Requirements:** FR-01, FR-02, FR-09, FR-12; NFR-03, NFR-06.

| Acceptance responsibility | Vertical owner |
| --- | --- |
| Representative fixed rule, derived DCSA bounds/side, exact terms/basis, create and approve through real UI/API/persistence | `dnd-author-price-walking-skeleton` |
| All three types, complete filters/reference validation, overlap handling, edit/approval/successor and AgreementVersion UI states | `dnd-version-trigger-governance` |
| Exact authorisation/no-disclosure and outcome-evidence states | `dnd-safe-attempts-evidence` |

Unit 1 proves the live architecture; Unit 2 completes US-01 breadth without splitting UI/backend/test layers into separate releases.

## US-02 - Govern immutable commercial versions

**Requirements:** FR-03, FR-10, FR-12; NFR-02, NFR-07; FR-11 through trigger/signoff evidence.

| Acceptance responsibility | Vertical owner |
| --- | --- |
| Versioned aggregate, one immutable approval and attributable activity foundation | `dnd-author-price-walking-skeleton` |
| Full immutable lifecycle, overlap serialization, successor lineage, history/AgreementVersion UI and metadata-only fresh W2 triggers | `dnd-version-trigger-governance` |
| Old versus successor exact historical use | `dnd-exact-historical-calculation` |
| Denied mutation and bounded audit dispositions | `dnd-safe-attempts-evidence` |

The signed contract is produced once in Unit 1; Unit 2 owns trigger runtime/replay behavior, not contract regeneration or a second signoff.

## US-03 - Calculate an exact echoed pricing snapshot

**Requirements:** FR-04, FR-05, FR-07, FR-10; NFR-01, NFR-02.

| Acceptance responsibility | Vertical owner |
| --- | --- |
| Exact request/result fixture, representative immutable receipt/terms validation, port-local zero/non-zero provider path | `dnd-author-price-walking-skeleton` |
| Successor and exact fresh trigger/basis evidence prerequisite | `dnd-version-trigger-governance` |
| Agreement/Tariff, old/successor, same-day/within-free/non-zero/timezone-boundary completeness and performance harness | `dnd-exact-historical-calculation` |
| Preserve success bytes/formula while completing all failed-attempt dispositions | `dnd-safe-attempts-evidence` |

The primary completion owner is Unit 3; Unit 1's happy path is the separately gated walking skeleton, not a duplicate horizontal calculator unit.

## US-04 - Handle evaluation attempts safely

**Requirements:** FR-06, FR-08, FR-12; NFR-02, NFR-03, NFR-04.

| Acceptance responsibility | Vertical owner |
| --- | --- |
| Namespaced receipt/audit schema, authenticated successful attempt, atomic completion/replay foundation | `dnd-author-price-walking-skeleton` |
| Standard enrichment handled-release/replay invariants | `dnd-version-trigger-governance` |
| Exact success versus `NO_RATE` historical/applicability boundary | `dnd-exact-historical-calculation` |
| Full spoof/auth/forbidden/malformed/no-rate/validation/conflict/in-progress/replay/unavailable matrix, fencing and authorised nullable evidence query | `dnd-safe-attempts-evidence` |

Unit 4 is a user-observable safety/evidence slice across filters, provider, persistence, API, UI and proof; it is not a backend hardening or test-only unit.

## Within-unit implementation coherence

These sequences describe internal convergence for one vertical unit. They do not select an economic order between units beyond the hard DAG.

| Unit | Internal coherent sequence |
| --- | --- |
| `dnd-author-price-walking-skeleton` | 1. lock owned migration/contract seams; 2. establish Reference/Charge domain and persistence; 3. generate/sign fixtures; 4. connect provider and minimum UI; 5. run representative zero/non-zero vertical proof |
| `dnd-version-trigger-governance` | 1. consume foundation; 2. complete lifecycle/overlap/relationship services; 3. add W2 enrichment/release; 4. complete approval/successor/history UI; 5. run focused UI keyboard/a11y/responsive plus lifecycle/trigger/replay proof; 6. observe the named live DoD |
| `dnd-exact-historical-calculation` | 1. consume immutable lineage; 2. complete historical evidence resolution; 3. expand pure numeric/timezone cases; 4. expose authorised result evidence; 5. run focused UI keyboard/a11y/responsive plus historical/restart/performance proof; 6. observe the named live DoD |
| `dnd-safe-attempts-evidence` | 1. lock exact precedence/error matrix; 2. complete claims/fencing/releases; 3. complete disposition persistence/search; 4. expose denied/scoped evidence states; 5. run security/concurrency/audit proof |

## Requirements and acceptance coverage

| Group | Primary completion unit(s) |
| --- | --- |
| FR-01, FR-02, FR-09 | Units 1-2; Unit 4 completes denied/evidence states |
| FR-03, FR-10 lifecycle/trigger | Unit 2; Unit 3 proves historical/successor evaluation |
| FR-04, FR-05, FR-07 | Unit 3, founded by Unit 1 |
| FR-06, FR-08 | Unit 4 |
| FR-11 | Unit 1 owns contract/fixtures/signoff; Unit 2 owns runtime trigger/replay behavior |
| FR-12 | Unit 1 foundation, Unit 2 lifecycle activity, Unit 4 full attempt evidence/authorization |
| NFR-01 | Unit 3 harness; final owner accept/revise decision at intent exit |
| NFR-02 | Atomic foundation in Unit 1, lifecycle/replay in Unit 2, deterministic historical behavior in Unit 3, concurrency/error completion in Unit 4 |
| NFR-03 | Unit 1 trusted happy path, Unit 4 complete fail-closed/security matrix; final scanner resolution at exit |
| NFR-04 | Unit 1 success evidence, Unit 4 complete bounded disposition evidence/telemetry |
| NFR-05 | Focused changed-code proof in every unit; consolidated >=80% report at exit |
| NFR-06 | Minimum LinerCore path in Unit 1; focused component/keyboard/a11y/responsive proof at 375/1024 light/dark for Units 2-4; full 375/768/1024/1440 light/dark viewport/fidelity matrix at exit |
| NFR-07 | Unit 1 contract compatibility/signoff, Unit 2 Standard runtime/replay regression, integrated verification at exit |
| AC-01, AC-02, AC-10 | Units 1-2 and Unit 4 denied/audit completion |
| AC-03-AC-05, AC-07, AC-08 | Unit 3, with Unit 1/2 prerequisites |
| AC-06, AC-09 | Unit 4 |
| AC-11, RV-01-RV-05 | Attributable producer evidence from Units 1-4; integrated verification/collection at intent exit |

## Exit-gate mapping outside the unit list

The following remain mandatory but do not become a Unit of Work:

- isolated Compose observation of the integrated four-unit result, including demo guards and serialized environment ownership;
- Charge/Booking verification of Unit 1's signed fixture manifest and Unit 2's runtime/replay regression outputs;
- consolidated changed-line coverage, required security scanner/policy resolution and accepted/revised p99 evidence;
- Playwright at 375/768/1024/1440 in light/dark after W2-02 package prerequisites merge;
- green `aidlc-audit` and `erp-fidelity-audit`.

## Coverage verification

- All four approved stories have one primary completion owner and an attributable walking-skeleton foundation where needed.
- All FR-01-FR-12, NFR-01-NFR-07, AC-01-AC-11 and RV-01-RV-05 obligations map to a vertical unit producer and/or explicit intent exit verifier.
- All four units cross the layers exercised by their outcome and contain focused proof; no orphan unit or story exists.
- Migration/contract/signoff ownership is single and explicit in Unit 1; later units consume it.
- Booking runtime triggering and CMM integration remain unmapped because they are outside W3-01 scope.
