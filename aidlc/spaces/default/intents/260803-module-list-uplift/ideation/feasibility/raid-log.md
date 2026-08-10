# RAID Log — W4-01 Module List-Detail Uplift

## Sources and Scoring

Sources: `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md`, validated against the indexed codebase, `compose.yaml`, and Nginx configuration.

Risk score uses Likelihood (L) × Impact (I), each 1–5. Priority: 15–25 High, 8–14 Medium, 1–7 Low.

## Risks

| ID | Risk | L | I | Score | Treatment / owner | Exit evidence |
|---|---|---:|---:|---:|---|---|
| R-01 | Container frontend/mount work is underestimated because no current app exists | 4 | 5 | 20 High | Mitigate: verify W2-04 contracts before stories/design; isolate Unit 3; module + platform owners | Authenticated list/detail/action route, health, Compose, Nginx, and live provider evidence |
| R-02 | Provider query/action gaps are hidden by UI assumptions | 4 | 4 | 16 High | Mitigate: approve per-module capability matrix; block unsupported cells visibly | Requirements traceability and exercised blocked/degraded states |
| R-03 | Teams create local primitives/themes to meet ordered designs quickly | 3 | 5 | 15 High | Avoid: `@erp/ui` dependency gate and design-system review | No local fork/hardcoded-color detector findings |
| R-04 | Charge consolidation regresses mature routes, proxy limits, or authorization | 3 | 4 | 12 Medium | Mitigate: reuse route helpers/BFF behavior; parity and negative-path tests | Legacy action matrix, route regression, denied/error evidence |
| R-05 | Canonical `/booking` versus `/bookings` paths break cross-links or return context | 3 | 4 | 12 Medium | Mitigate: approve route registry and redirects before implementation | Exact record links and back-navigation observed |
| R-06 | Three-module accessibility/state evidence exceeds wave capacity | 3 | 4 | 12 Medium | Mitigate: shared interaction contract, per-unit evidence, early keyboard/async-state tests | Required breakpoints, themes, WCAG AA, and announcements pass |
| R-07 | Full Compose resource pressure creates flaky acceptance evidence | 3 | 3 | 9 Medium | Mitigate: isolated project name, required profiles, health waits, resource monitoring | Repeatable live-stack audit run |
| R-08 | New infrastructure or regulatory scope is assumed without evidence | 2 | 4 | 8 Medium | Avoid: change triggers C-18–C-21 and explicit approval | No unapproved service/account/data-flow diff |

## Assumptions

| ID | Assumption | Validation / owner | Failure response |
|---|---|---|---|
| A-01 | W2-01 shell/auth and W2-02 `@erp/ui` outputs remain closed and consumable | Dependency audit — platform owners | Block affected shared seam; do not fork |
| A-02 | W2-03 Agreement and W2-04 Journey services/contracts remain compatible | Contract/live-service tests — domain owners | Revise capability matrix and affected unit scope |
| A-03 | Reference Data provider endpoints preserve current permission/error semantics | Contract tests — Reference owner | Mark affected behavior blocked and assign provider dependency |
| A-04 | Current TypeScript/Next.js and domain teams are available within the program wave | Delivery planning — delivery owner | Re-sequence within DAG or approve governed partner capacity |
| A-05 | No new PCI/PHI processing, personal-data category, residency region, or external audience is introduced | Requirements/data-flow review — compliance owner | Trigger formal compliance assessment |
| A-06 | Existing deployment topology can host one additional current-pattern frontend mount without a new AWS service/account | Infrastructure review — platform owner | Escalate evidence to infrastructure-design gate |

## Issues

| ID | Current issue | Severity | Owner | Resolution condition |
|---|---|---|---|---|
| I-01 | `apps/container-movement` is absent | High | Container/module owner | Current-stack app/BFF route exists from verified W2-04 truth |
| I-02 | Compose has no Container Movement frontend service or health check | High | Platform owner | Service and health dependency operate in isolated live stack |
| I-03 | Nginx has no Container Movement canonical route | High | Shell/platform owner | Authenticated location and assets/API routing pass |
| I-04 | Reference Data and Charge retain legacy workbench presentation paths | Medium | Module owners | Canonical list/detail routes replace or redirect legacy entrypoints |
| I-05 | Provider capability matrix is not yet approved | Medium | Product/domain owners | Requirements Analysis records supported, blocked, and owner cells |

## Dependencies

| ID | Dependency | State | Needed for | Evidence |
|---|---|---|---|---|
| D-01 | W2-01 App Shell & Auth | Closed, verify | All units | Shell mount/session pattern and live auth |
| D-02 | W2-02 Design-System Foundation | Closed, verify | All units | `@erp/ui`, tokens, page patterns, audits |
| D-03 | W2-03 Charge Tariffs & Agreements | Closed, verify | Unit 2 | Agreement/rate/D&D routes and BFF contracts |
| D-04 | W2-04 Container Journey Track & Trace | Closed, verify | Unit 3 | Service, event model, Booking identifiers, approved designs |
| D-05 | Reference Data services/W0-02 completeness | Closed, verify | Unit 1 | Provider query/action/permission contracts |
| D-06 | Product, domain, UI, accessibility, quality reviewers | Schedule | Every gate | Recorded approvals and defect disposition |

## RAID Decision

Proceed with mitigation. R-01 through R-03 are high-priority controls and must appear in Requirements, Stories, Refined Mockups, Application Design, and unit exit evidence. I-01 through I-03 are planned Unit 3 work, not proof of infeasibility. Any unresolved provider capability remains blocked with an owner and cannot be counted as completed behavior.
