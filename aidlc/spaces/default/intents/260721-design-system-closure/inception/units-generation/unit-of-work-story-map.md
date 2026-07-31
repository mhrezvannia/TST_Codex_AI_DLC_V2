# Unit-to-Story Map — W2-02 Design-System Closure

## Mapping Basis

The single Unit is shaped by `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`. It covers every `requirements.md` gate and every Must story in `stories.md`. No orphan story or evidence-only Unit is permitted.

## Story Coverage

| Story | Unit | Internal work areas | Primary requirement trace | Unit evidence |
|---|---|---|---|---|
| US-001 Shared-shell list/states | `booking-design-system-closure` | A, B, C, D | FR-001–FR-004, FR-007; NFR-001–NFR-003 | route/component tests; list state/theme/viewport Playwright |
| US-002 Keyboard create-to-confirm/recovery | `booking-design-system-closure` | A, B, C, D | FR-001–FR-007; NFR-001, NFR-004, NFR-005, NFR-009 | focused form/action tests; live keyboard journey; controlled recovery |
| US-003 Shared package/anti-drift | `booking-design-system-closure` | A, B, C | FR-002, FR-003, FR-007, FR-008; NFR-006, NFR-007 | consumption inventory; semantic exception tests; negative probes; build |
| US-004 Reproducible live matrix | `booking-design-system-closure` | D, with A–C inputs | FR-004–FR-010; NFR-001–NFR-003, NFR-007–NFR-009 | Playwright results, screenshots/traces, manifest |
| US-005 Manager-demo safety | `booking-design-system-closure` | D, E | FR-009, FR-012; NFR-008 | before/after demo-guard records; project-name assertions |
| US-006 Truthful audited closure | `booking-design-system-closure` | E, with A–D inputs | FR-010–FR-012; NFR-007, NFR-008 | both audit outputs; final guard; backlog evidence reference; W1 unchanged |

## Cross-Cutting Story Relationships

- US-003 supplies the enforceable shared presentation boundary used by US-001 and US-002.
- US-001 and US-002 supply live behavior for US-004.
- US-005 guards all stack operations supporting US-004.
- US-004 supplies the durable package evaluated by US-006.
- US-006 cannot pass unless US-001 through US-005 are green.

These are internal logical constraints. They do not define a preferred economic build order; Delivery Planning may choose among valid work sequences while respecting them.

## Within-Unit Constraint Sets

| Constraint set | Stories | Rule |
|---|---|---|
| Shared-boundary constraint | US-003 → US-001/US-002 | Applicable shared primitives/enforcement must exist before their consumption can be accepted. |
| Live-proof constraint | US-001/US-002/US-003 → US-004 | Live evidence cannot substitute for incomplete production behavior or package adoption. |
| Safety constraint | US-005 guards US-004 | Pre-guard must pass before Wave A actions; post-guard must pass before closure. |
| Closure constraint | US-001–US-005 → US-006 | Audits/backlog status are terminal evidence, not an independent implementation stream. |

## Requirement Coverage Verification

| Coverage group | Stories | Unit status rule |
|---|---|---|
| FR-001–FR-003 canonical shell/package boundary | US-001, US-003 | Must be implemented and live-observed |
| FR-004–FR-007 states/journey/themes | US-001, US-002, US-004 | Must pass focused and live evidence |
| FR-008 anti-drift | US-003 | Positive gate and negative probes required |
| FR-009–FR-010 isolated runtime/evidence | US-004, US-005 | Wrapper, guards, and manifest required |
| FR-011–FR-012 audit/truth | US-006 | Both audits green; failures retained; W1 unchanged |
| NFR-001–NFR-009 | US-001–US-006 | Accessibility, responsive, security preservation, reliability, maintainability, build quality, reproducibility, and timeout preservation all evidenced |

Every story maps to `booking-design-system-closure`, and the Unit maps to all stories. There are no orphan Units, orphan stories, or deferred Must requirements.

## Completion Semantics

Internal work-area and story progress may be recorded, but the Unit remains incomplete until every story’s acceptance criteria and all requirement groups pass together on the isolated live stack. A static-only, happy-path-only, evidence-only, or audit-waived result is not Unit completion.
