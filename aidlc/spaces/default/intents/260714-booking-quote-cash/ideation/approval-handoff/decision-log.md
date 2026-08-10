# Ideation Decision Log - W1-01 Booking Quote-to-Cash

## Source Trace

This log records decisions carried from `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, `ideation/market-research/competitive-analysis.md`, `ideation/feasibility/feasibility-assessment.md`, `ideation/feasibility/constraint-register.md`, `ideation/team-formation/team-assessment.md`, and `ideation/rough-mockups/wireframes.md`.

## Decisions

| ID | Stage | Decision | Rationale | Consequence / trace |
|---|---|---|---|---|
| ID-001 | Intent Capture | Deliver the complete thin booking spine, not a backend-only slice | User value requires no re-keying and visible movement return | Intent DoD and all six proto-Units |
| ID-002 | Intent Capture | Limit shape to one direct leg, one dry FCL line, quantity one, USD | Smallest contract-true carrier workflow | Scope-document release boundary |
| ID-003 | Intent Capture | Require live journey, restart/redelivery, automated gates, both audits | Tests alone cannot prove real seams | PU-06 and evidence bundle |
| ID-004 | Market Research | Treat LinerCore as an internal carrier platform, not standalone SaaS | Avoid unsupported market-size/product positioning | Competitive alternatives analysis |
| ID-005 | Market Research | Build carrier-specific domain; adopt W0, DCSA, and mature tooling | Preserves ownership and reversibility | Build-vs-buy recommendation |
| ID-006 | Feasibility | Local Compose is the authoritative W1 runtime | No approved cloud target exists; W0 stack is proven | PostgreSQL host port 55432/default override |
| ID-007 | Feasibility | Preserve existing Booking records through explicit compatibility | Destructive reset is not brownfield acceptance | PU-01 migration fixture |
| ID-008 | Feasibility | Prove Kafka consumers, then remove HTTP callbacks with no steady-state dual delivery | Prevents hidden coupling and duplicate delivery | PU-04-PU-06 sequence |
| ID-009 | Feasibility | Internal controlled data; minimize event payloads and preserve audit context | W1 does not require card/health data or PII expansion | Contract/data review |
| ID-010 | Feasibility | Prove frozen timeout/retry/idempotency behavior without invented volume targets | No defensible load target is supplied | Contract and redelivery tests |
| ID-011 | Scope | All cross-module and browser seams are release-blocking parts of one walking skeleton | Dropping a seam destroys the user outcome | Six Must proto-Units |
| ID-012 | Scope | Sequence contracts/migration first and keep UI incremental | Highest risks must surface before cutover | Backlog dependency DAG |
| ID-013 | Scope | No deadline waives migration, contract, Compose, tests, or audits | No calendar commitment is supplied | Fixed exit policy |
| ID-014 | Team | User owns approvals; Codex drives one active intent | Reflects actual operating model without fictional staffing | Team assessment and RACI |
| ID-015 | Team | Booking leads one stream-aligned mob with specialist review hats | One journey crosses multiple ownership boundaries | Mob assignments and review triggers |
| ID-016 | UX | Use Booking-local list, create, and stable detail routes | Supports navigation, refresh, recovery, and shareable state | Wireframes and user flow |
| ID-017 | UX | Lead detail with booking/status/route/lifecycle, then equipment/quote/movement | Matches booking-desk scan priorities | Detail information hierarchy |
| ID-018 | UX | Reuse `@erp/ui` and inherit W2-02 visuals only | User requested visual inheritance without W2 scope expansion | Operational-console direction |
| ID-019 | UX | Support responsive operations layouts and WCAG 2.1 AA | W1 must be usable beyond one mouse/desktop path | Accessibility annotations and test targets |
| ID-020 | UX | Show movement Pending, poll while pending, expose last checked and Refresh | CMM is asynchronous but operator feedback must remain clear | Detail status states |
| ID-021 | Handoff | Carry migration, contracts, consumer atomicity, frontend baseline, and Compose proof as blockers | Feasibility is conditional on these controls | Inception design/test obligations |
| ID-022 | Handoff | Approve targeted build and role-based delivery without financial/date claims | Evidence supports work, not invented capacity | Initiative GO recommendation |

## Rejected Alternatives

| Alternative | Rejected because |
|---|---|
| Backend-only confirmation | Does not prove CMM return or booking-desk outcome |
| Full roadmap in W1 | Violates vertical thin-slice boundaries and named intent ownership |
| Flat domain with wire-only translation | Keeps incorrect concepts and perpetuates mapping drift |
| Destructive Booking reset | Fails brownfield compatibility and audit expectations |
| Permanent HTTP plus Kafka delivery | Obscures idempotency and preserves request coupling |
| Full liner/TMS suite as W1 prerequisite | Program-level procurement with unknown fit/cost/timeline |
| Single three-column workbench | Lacks stable routes, state recovery, and real detail navigation |
| Full W2 shell/design migration | Pulls unrelated ownership and scope into W1 |
| Raw broker diagnostics as primary UX | Exposes transport internals instead of business state |

## Open Decisions For Inception

Implementation details remain open only where Ideation intentionally did not prescribe them:

- exact legacy snapshot upcaster versus migration mechanism;
- Spring Kafka acknowledgement/error-handler configuration and whether a shared consumer helper is justified;
- exact API DTO shapes and internal domain value objects while preserving wire names;
- polling interval/backoff and UI component composition within approved behavior;
- final Unit/Bolt packaging after reverse engineering and requirements traceability.

None authorizes scope expansion or changes the frozen contract and exit boundaries.
