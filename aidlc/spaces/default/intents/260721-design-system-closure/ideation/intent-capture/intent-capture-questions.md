# Intent Capture Questions — W2-02 Design-System Closure

## Context Already Fixed

The following constraints are already decided and are not being re-asked: feature scope; brownfield vertical closure; preserve the `c2f13dd` Wave A baseline and all prior merged W0-01/W0-02/W1-01/W2-01/W2-02 work; retain one authenticated shell; W2-02 ownership of `packages/ui`, shared tokens/primitives, Booking reference migration, and the LinerCore design-system master; isolated `linercore-wave-a` Compose verification; manager-demo protection; explicit W1 waiver history; live Playwright, `aidlc-audit`, and `erp-fidelity-audit` exit evidence.

## Q1. Which stakeholder outcome should lead trade-off decisions when closure details compete?

A. Balance Booking operator usability, frontend-developer reuse, and release/audit evidence as co-equal closure outcomes (recommended)
B. Prioritize the Booking operator's keyboard-only create-to-confirm workflow
C. Prioritize developer package adoption and release/audit readiness over operator-flow depth
X. Other (please specify)

[Answer]: A — Balance all (Recommended) — 2026-07-21T12:11:59Z — **Mode:** guided

## Q2. What should count as a completed Booking reference migration?

A. Every Booking interactive, data-display, and loading surface uses the applicable `@erp/ui` primitive; any unavoidable semantic HTML exception is documented and tested (recommended)
B. Migrate only the create, list, and detail routes' primary controls; secondary surfaces may retain local controls
C. Visual similarity is sufficient even if raw local controls remain
X. Other (please specify)

[Answer]: A — Every surface (Recommended) — 2026-07-21T12:11:59Z — **Mode:** guided

## Q3. Which live evidence bundle is required for closure?

A. Keyboard create-to-confirm, both themes, 375/768/1024/1440 viewports, loading/empty/error/denied states, lint-negative probe, relevant tests/build, and both audits on the isolated stack (recommended)
B. Source review plus tests and production build only
C. Live create-to-confirm plus basic screenshots, without the complete network-state and responsive matrix
X. Other (please specify)

[Answer]: A — Full matrix (Recommended) — 2026-07-21T12:11:59Z — **Mode:** guided

## Q4. When current implementation details conflict with closure requirements, which authority order should apply?

A. Active closure intent and binding LinerCore master, then observed DoD/preflight gap, then existing implementation; make the smallest compliant correction (recommended)
B. Preserve existing implementation even when a documented blocker remains
C. Allow the preflight report or ui-ux-pro-max advisory to override the binding master when they conflict
X. Other (please specify)

[Answer]: A — Binding order (Recommended) — 2026-07-21T12:12:53Z — **Mode:** guided

## Q5. What is the program-level completion action after all evidence gates pass?

A. Produce a durable W2-02 evidence package and mark W2-02 closed in the program backlog with its evidence path (recommended)
B. Produce evidence but leave the backlog as acceptance pending
C. Report the passing checks without changing program status
X. Other (please specify)

[Answer]: A — Close W2-02 (Recommended) — 2026-07-21T12:12:53Z — **Mode:** guided
