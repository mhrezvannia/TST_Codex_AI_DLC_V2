# Team Assessment — W4-01 Module List-Detail Uplift

## Sources and Recommendation

Based on `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`, W4-01 needs one stream-aligned, cross-functional delivery team supported by stable domain and platform interfaces. Three independent module teams are not recommended: the work shares one shell, one interaction grammar, one `@erp/ui` boundary, and one integrated evidence gate.

**Recommendation:** a sequential W4-01 core mob owns delivery end to end. Seam owners join through time-boxed collaboration and formal review, then return to X-as-a-service ownership once the contract is clear.

## Required Role Set

| Role | Primary responsibility | Gate participation |
|---|---|---|
| Product owner | Scope, capability priority, blocked behavior, final approval | Every product/stage gate |
| Delivery lead | Capacity, sequence, dependency/reviewer scheduling, escalation | Planning and phase/Bolt gates |
| UX/product designer | Ordered designs, interaction/state/responsive/accessibility specification | Rough/Refined Mockups and implementation review |
| Frontend engineers | Module routes, view models, shared-component consumption, tests | Design through live evidence |
| Domain engineer/reviewer — Reference | Provider capability/action/permission truth | Unit 1 requirements/design/evidence |
| Domain engineer/reviewer — Charge | Agreement/rate/D&D/lifecycle and BFF truth | Unit 2 requirements/design/evidence |
| Domain engineer/reviewer — Container | W2-04 journey/event/action contract truth | Unit 3 requirements/design/evidence |
| UI-platform owner | `@erp/ui`, tokens, shared component changes, fidelity audit | All UI mapping/change gates |
| Shell/auth/platform owner | Navigation, session, canonical mounts, Nginx/Compose, health | Cross-module and Unit 3 gates |
| Quality/accessibility engineer | Test strategy, keyboard/WCAG/responsive/live evidence | Stories, mockups, build/test, exit |
| Security/compliance reviewer | Authz, secrets, audit context, data-scope triggers | Requirements/design and negative paths |
| SRE/operations reviewer | Health, logs, correlation, live-stack observability | Application/infra design and exit |

One person may cover multiple roles if competence and review independence remain sufficient. No artifact should invent individual availability.

## Availability and Capacity Assessment

- Core capacity is allocated sequentially by module, minimizing work in progress and shared-pattern divergence.
- Seam reviewers are scheduled before the relevant gate, not requested after implementation.
- Reference domain and UI-platform attention is front-loaded to establish the reusable pattern.
- Charge domain attention peaks during parity/regression design and validation.
- Container domain plus shell/platform attention starts during Requirements/Stories contract verification and peaks during Unit 3 mount delivery.
- Quality/accessibility participates from requirements onward; evidence work is not deferred to the final week.

Exact names, utilization percentages, time zones, leave, and competing initiatives are unconfirmed. Delivery Planning must obtain those facts before committing Bolt dates.

## Topology and Interaction Modes

| Relationship | Initial mode | Steady mode | Reason |
|---|---|---|---|
| W4-01 mob ↔ UI platform | Collaboration during mapping/gaps | `@erp/ui` as a service | Prevent local forks while preserving platform ownership |
| W4-01 mob ↔ shell/auth/platform | Collaboration for routes/mounts | Shell/auth contracts as a service | Container mount and canonical links cross the seam |
| W4-01 mob ↔ domain owners | Collaboration for capability truth | BFF/service contracts as a service | UI must not infer provider behavior |
| W4-01 mob ↔ quality/accessibility | Continuous collaboration | Shared quality gates | State/a11y evidence shapes implementation |
| W4-01 mob ↔ security/compliance/SRE | Facilitating/review | Established controls | No new platform, but affected seams require validation |

## Capacity Agreement

1. One active module slice at a time unless Delivery Planning approves a clearly independent evidence task.
2. Reviewers receive artifacts before gates with explicit decisions requested.
3. Shared-component or shell changes require owning-team approval before merge.
4. A blocked provider capability is escalated to its domain owner; frontend capacity moves only to unaffected accepted scope.
5. No overtime, hidden parallel team, or external partner is assumed to satisfy an unsupported date.

## Team Readiness Finding

**Conditionally ready.** The required competencies exist as repository ownership roles and no external partner is necessary. Readiness becomes committed only when Delivery Planning attaches named people, utilization, review calendars, and escalation contacts to the final Units/Bolts.
