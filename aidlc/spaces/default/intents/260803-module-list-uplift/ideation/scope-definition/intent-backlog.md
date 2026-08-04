# Prioritized Intent Backlog — W4-01 Module List-Detail Uplift

## Sources and Backlog Semantics

Sources: `intent-statement.md`, `feasibility-assessment.md`, and `constraint-register.md`.

These are **proto-Units**, used to express value, dependency, and priority during Ideation. Units Generation later owns final Unit boundaries and the formal dependency DAG; Delivery Planning owns Bolt economics. All three are Must priority and independently mergeable, while the intent-level exit gate depends on all three.

## Prioritized Proto-Units

| Order | Proto-Unit | MoSCoW | Value | Risk reduction | Dependency | Acceptance headline |
|---:|---|---|---|---|---|---|
| 1 | Reference Data list-detail uplift | Must | Establishes usable admin find/inspect/action flow | Proves shared list/detail/state grammar against an existing provider | W2-01, W2-02, Reference/W0-02 | Canonical set/record routes, real states/actions, legacy workbench retired |
| 2 | Charge Agreements list-detail uplift | Must | Gives pricing users coherent Agreement/rate/D&D/history work | Proves mature route/BFF reuse without regression | Unit 1 interaction pattern; W2-01/02/03 | Mature routes preserved, legacy workbench retired, exact Booking links |
| 3 | Container Journey list-detail uplift | Must | Creates the missing operator journey surface | Resolves absent app/Compose/Nginx mount using verified W2-04 truth | Unit 1 pattern; W2-01/02/04; platform mount | Authenticated Journey routes, real event timeline/actions, exact Booking links |
| 4 | Integrated three-module evidence closure | Must | Establishes one reliable product experience | Detects shell, cross-link, theme, accessibility, and provider integration drift | Proto-Units 1–3 | Live Compose tour and both audits green |

## Sequencing Rationale

The chosen heuristic combines dependency-first and risk reduction:

1. **Reference Data first** is the smallest complete proof of the repeated pattern and shared state/accessibility contract.
2. **Charge second** validates that the pattern can wrap mature behavior without erasing domain-specific routes or constraints.
3. **Container third** tackles the largest implementation uncertainty after its interaction and component grammar is proven, while its contracts/mount are verified early during requirements and design.
4. **Integrated closure last** verifies that independent merges still produce one shell, exact cross-links, and consistent states.

Starting all three in parallel would multiply shared-pattern decisions and increase fork risk. Starting Container first would confront the missing-app surface before the repeated UI grammar is approved. Deferring Container would contradict the minimum intent outcome.

## Capability Backlog by Proto-Unit

### P1 — Reference Data

- Must: provider capability matrix and canonical list URL state.
- Must: record detail Summary/Attributes/History.
- Must: permission-aware legacy action parity and full operating states.
- Must: shell navigation and legacy workbench redirect/removal.
- Should: shared table/detail/state component mapping usable by later modules.

### P2 — Charge Agreements

- Must: reuse Agreement list/detail routes and BFF protections.
- Must: Summary/Rates/D&D/Status history with validity and lifecycle context.
- Must: exact Booking cross-link and return context.
- Must: legacy workbench retirement with negative/regression evidence.
- Should: preserve mature validation, limits, authorization, and provider error behavior unchanged.

### P3 — Container Movement

- Must: verify W2-04 query/action/identifier contracts.
- Must: create current-stack app/BFF route, Compose service/health, Nginx mount, and shell navigation.
- Must: Journey Summary/Movement timeline/Linked booking from real data.
- Must: DCSA-readable event meaning plus permitted movement actions/states.
- Must: exact Booking cross-link, accessibility/responsive, and live route evidence.

### P4 — Integrated closure

- Must: authenticated cross-module user tour on isolated Compose stack.
- Must: canonical direct URLs, refresh, return context, and route retirement.
- Must: light/dark, keyboard, WCAG AA, and 375/390/768/1024/1440 evidence.
- Must: `aidlc-audit` and `erp-fidelity-audit` green.

## Deferred Backlog

The following remain candidates for later intents, not W4-01 backlog items: saved views, bulk operations, global search, new domain actions, strategic procurement/optimization, predicted events, new carrier integrations, replacement-suite evaluation, new infrastructure topology, and admin/identity UI.

## Backlog Exit Rule

No proto-Unit may report completion from visual mocks, isolated component tests, or simulated provider behavior. Each requires a real authenticated path, real provider result or explicit blocked ownership, and its portion of the shared live evidence gate.
