# Ideation Decision Log - W2-03 Charge Tariffs & Agreements

This log consolidates decisions represented in [`intent-statement.md`](../intent-capture/intent-statement.md), [`scope-document.md`](../scope-definition/scope-document.md), [`intent-backlog.md`](../scope-definition/intent-backlog.md), [`competitive-analysis.md`](../market-research/competitive-analysis.md), [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md), [`constraint-register.md`](../feasibility/constraint-register.md), [`team-assessment.md`](../team-formation/team-assessment.md), and [`wireframes.md`](../rough-mockups/wireframes.md).

## Decisions

| ID | Decision | Rationale | Source/status |
|---|---|---|---|
| D-001 | Use Feature scope, Standard depth/test strategy, Brownfield safeguards | Persisted money, bilateral contract, two UI surfaces, live evidence | Intent approved |
| D-002 | Charge is the real pricing authority; Booking consumes/stores snapshots | Preserves bounded-context ownership and replaces hardcoded content | Intent approved |
| D-003 | Make no-rate `MANUAL_PRICING_REQUIRED` the focal degraded proof while preserving outage semantics | Prevents false/guessed prices and scope expansion | Intent approved |
| D-004 | Build bounded LinerCore capability now; preserve future adapter seam | Existing foundations and exact program integration reduce risk | Market Research approved |
| D-005 | Evaluate/release against isolated local Compose, not invented AWS scope | Canonical project acceptance and no cloud requirement | Feasibility approved |
| D-006 | Release is indivisible: administration, Booking price, reprice, manual state, UI, live/audit proof | Any isolated subset fails observable intent | Scope approved |
| D-007 | Sequence walking-skeleton/risk-first vertical outcomes | Retires contract/migration/integration uncertainty early | Scope approved |
| D-008 | Use one stream-aligned role-based mob; do not infer staffing | Cross-domain slice needs one accountable flow; roster absent | Team Formation approved |
| D-009 | Use stable Charge routes under shared shell; no global redesign | Shareable operational state and ownership boundary | Rough Mockups approved |
| D-010 | Rate lifecycle is Draft -> immutable Approved; window derives Scheduled/Effective/Expired | Meets approved-version need without a broader publication workflow | Rough Mockups resolved review |
| D-011 | OFR/BAF match lane + equipment; POL THC matches origin port + equipment | Category-specific thin-slice semantics | Rough Mockups resolved review |
| D-012 | Existing Booking pricing region renders minimum real lines/provenance/prior-current/manual state | Satisfies cross-domain UI acceptance without Booking-page redesign | Rough Mockups resolved review |
| D-013 | Pricing Analyst remains the stated create/edit/approve actor | Avoids an unapproved separation-of-duties role expansion | Rough Mockups resolved final review finding |
| D-014 | Commodity and all broader pricing dimensions remain absent | Protects the approved thin slice | Rough Mockups resolved final review finding |
| D-015 | Preserve both Product Lead NOT-READY verdicts and record post-limit fixes | Review history is evidence and must not be rewritten | Rough Mockups human-approved |
| D-016 | Preserve W1 blocked/waived history; never relabel it as a pass | Historical audit integrity | Binding project/intent rule |
| D-017 | Authorize Inception only; budget, staffing, schedule, Docker, and release remain uncommitted | Handoff approval is not a resource or readiness claim | Approval & Handoff answer |

## Deferred Decisions

| ID | Deferred item | Reopen trigger |
|---|---|---|
| DD-01 | Named assignees, capacity, time zones, competing priorities | Before committing Construction schedule |
| DD-02 | Docker-capable runner/owner and acceptance window | Before live acceptance execution |
| DD-03 | Production jurisdiction, residency, retention, certification | Before production compliance approval |
| DD-04 | External provider/suite, optimizer, public distribution, broader dimensions | New approved intent/business requirement |
| DD-05 | AWS account/region/IaC/cost plan | Approved cloud-deployment requirement |

## Rejected Alternatives

- Hardcoded or guessed pricing, zero/no-match pricing, and static mock completion.
- Full suite procurement or generic rules engine inside W2-03.
- Horizontal database/backend/frontend/evidence releases.
- Single root-only Charge workbench as the final navigation model.
- Separate Commercial Approver role not established by the intent actor model.
- Commodity or other deferred dimensions in forms, matching, or persistence.
- New Charge theme, palette, typography, component library, shell, or global navigation.
- Targeting the manager demo or treating failed demo guard/Docker access as a pass.

## Open Conditions

The `constraint-register` and RAID log remain active. Inception must resolve implementation-level contract/schema/routing details and vertical Unit ownership. Construction/release gates must verify real assignments, environment access, live observations, and audit results.

## Upstream Coverage

The `intent-statement`, `scope-document`, `intent-backlog`, `competitive-analysis`, `feasibility-assessment`, `constraint-register`, `team-assessment`, and `wireframes` all have corresponding decisions above; no Ideation output is orphaned.
