# NFR Requirements Questions - W4-01 (stage group: all four units)

## Source and Authority Alignment

This question set consumes each unit's `business-logic-model.md` and `business-rules.md` from Functional Design, `requirements.md`, and the brownfield `technology-stack.md` scan. **On why one question set covers four units.** This was a conductor judgment call, not a protocol entitlement. An earlier version of this file cited `stage-protocol.md` §"Within-Bolt Question Collection"; that citation was wrong and has been withdrawn — the approved `bolt-plan.md` puts exactly one Unit in each Bolt, so a clause about grouping questions across Units *within* one Bolt never applied here. The actual reason is narrower: the four Units share one verified stack, one Compose acceptance boundary, and one approved NFR-001 through NFR-012 target set, so four separate question files would have been four identical files presenting no additional decision. The same answered file is recorded in each Unit's `nfr-requirements/` directory so per-Unit traceability is preserved, and the artifacts are generated per Unit. If the reviewer or the human judges that per-Unit questioning would have surfaced something this shared set did not, that is a legitimate basis to reject this stage.

Most NFR content is already fixed upstream and is **not** re-asked here: NFR-001's warmed ten-user p95 targets (BFF list/detail <= 1,000 ms, route operational readiness <= 2,500 ms), NFR-002 WCAG 2.1 AA, NFR-003's five widths and two themes, NFR-004's real-subject/server-decision rule, NFR-005's context retention, NFR-006's >= 80 percent changed-frontend coverage, NFR-007's blocking gates, NFR-008's bounded `u02-security` scope, NFR-009's ownership boundaries, NFR-010's typed correlation evidence, NFR-011's evidence integrity, and NFR-012's isolated `linercore-wave-a` Compose boundary. Questions below cover only what those leave genuinely open at unit level.

## Questions

### Q1. How should the NFR-001 p95 budget be decomposed per unit?

A. Keep NFR-001's two thresholds as the binding acceptance gate and add a per-unit internal budget breakdown as non-binding engineering guidance — naming each unit's own route set, its Identity authorization call, its provider call(s), and any bounded Reference option call, so a regression can be attributed to a segment rather than only to the total (recommended)
B. State only the two NFR-001 totals per unit and attribute regressions later
C. Set new per-unit numeric thresholds that differ from NFR-001
D. Defer all performance decomposition to Operation
X. Other (please specify)

[Answer]: A - NFR-001 totals remain the binding gate; per-unit segment breakdown is non-binding engineering guidance (Recommended) - 2026-08-10T22:22:57Z - **Mode:** guided - User response: `A. Totals bind, breakdown guides (Rec)`

### Q2. What scalability posture should the artifacts state?

A. Record scalability as local acceptance capacity only — the warmed ten-concurrent-user fixture, provider-owned pagination bounds already fixed in Functional Design (Agreement page sizes 25/50/100, CMM `limit` 25/50/100, Reference option cap 50), and the explicit statement that no production load projection, autoscaling, capacity plan, or growth model is claimed because `technology-stack.md` and NFR-012 forbid inferring a cloud runtime (recommended)
B. Produce production load projections and scaling triggers
C. Assume a cloud autoscaling target and design for it
D. Omit scalability artifacts entirely
X. Other (please specify)

[Answer]: A - Local acceptance capacity only; no production projection, autoscaling, or growth model claimed (Recommended) - 2026-08-10T22:22:57Z - **Mode:** guided - User response: `A. Local acceptance capacity only (Rec)`

### Q3. What should `tech-stack-decisions.md` record for units that introduce no new technology?

A. Record the inherited verified stack with its scanned versions, state explicitly that the unit selects no new language, framework, database, cache, topic, or infrastructure tool, and list the decisions the unit actually does make within that stack — for example U04's new `apps/container-movement` deployable using the existing Next.js/TypeScript/`@erp/ui` toolchain — plus the `technology-stack.md` version and compatibility risks that touch this unit (recommended)
B. Omit the artifact for units that add no new technology
C. Re-evaluate and re-select the platform stack per unit
D. Record only the version table with no unit-level decisions
X. Other (please specify)

[Answer]: A - Inherited verified stack, explicit no-new-technology statement, plus the decisions the unit does make (Recommended) - 2026-08-10T22:22:57Z - **Mode:** guided - User response: `A. Inherited stack + real decisions (Rec)`

### Q4. How deep should per-unit security requirements go beyond the approved W4 contract?

A. Restate the binding W4 rules as unit-scoped, testable requirements — current-request authorization per exact capability, no provider call after DENY or Identity outage, no cached authorization, no data flash, trusted-header sanitation at the edge, server-owned actor/correlation/idempotency/replay evidence, safe-return and origin-token validation — and add only the threat considerations this unit actually introduces (for example U04's subject-assertion verification and capture-attempt-token binding, U03's replay-key derivation), with each stated so a test can falsify it; no new compliance regime, data classification scheme, or repository-wide security programme is invented (recommended)
B. Restate the W4 security contract verbatim without unit scoping
C. Introduce a new compliance/data-classification framework for W4
D. Defer security requirements to the intent-exit security gate
X. Other (please specify)

[Answer]: A - Unit-scoped, falsifiable restatement of the W4 security contract plus only unit-introduced threats (Recommended) - 2026-08-10T22:22:57Z - **Mode:** guided - User response: `A. Unit-scoped and falsifiable (Rec)`

## Ambiguity Analysis Placeholder

After answers are recorded, they will be checked against each unit's Functional Design, `requirements.md` NFR-001 through NFR-012, the verified `technology-stack.md` evidence limitations, and NFR-011/NFR-012's prohibition on promoting static or inferred evidence to live acceptance. Vague or contradictory answers must be resolved before generating the five per-unit artifacts.
