# Stakeholder Map — W2-02 Design-System Closure

## Stakeholder Outcomes

| Stakeholder role | Interest and required outcome | Evidence of satisfaction |
|---|---|---|
| Booking operator | Predictable, accessible list/create/detail and create-to-confirm workflow in one authenticated shell | Keyboard Playwright journey, visible state handling, responsive/theme evidence |
| Frontend developer | Stable shared tokens/primitives and a real Booking reference consumer | Booking imports/renders `@erp/ui`; no local palette, theme, shell, or component library |
| UI Driver / W2-02 owner | Focused closure of the acceptance gap without redesign or cross-wave regressions | Diff remains inside W2-02 ownership; preflight blockers are individually closed |
| Quality and release reviewer | Reproducible proof that observed behavior meets the DoD | Isolated-stack evidence package, tests/build, lint-negative proof, both audits green |
| W4-01 delivery owner | A dependable shared foundation before wider module uplift | W2-02 backlog status changes to closed only after live evidence |
| Manager-demo owner | Continuous availability of the shared demo environment | `npm run demo:guard` passes before and after; shared Compose project is untouched |
| Security/accessibility reviewer | WCAG 2.1 AA, authenticated shell, truthful denied/error behavior | Keyboard/focus/contrast/announcement checks and denied-state proof |
| Program owner | Preserve prior intent history, ownership, and merge discipline | Baseline ancestry intact; W1 waiver remains explicit; no unrelated rewrites |

## Decision Rights

| Decision | Accountable role | Required consultation |
|---|---|---|
| W2-02 scope and acceptance | Program owner / product authority | UI Driver, quality/release reviewer |
| Shared token and primitive changes | W2-02 UI Driver | Booking consumer, accessibility reviewer |
| Booking reference migration | W2-02 UI Driver | Booking operator perspective, W2-01 shell owner |
| Shared shell/auth behavior | Existing W2-01 owner | W2-02 may integrate but must not create a competing shell |
| Audit verdict and program close | Quality/release reviewer plus program owner | UI Driver; evidence must be reproducible |
| Manager-demo protection | Manager-demo owner | Wave A acceptance operator |

## Influence And Constraints

- The active closure brief, W2-02 statement, LinerCore design-system master, and observed DoD control scope.
- The existing implementation is a protected input, not an unquestioned authority when it leaves a documented blocker.
- `ui-ux-pro-max` is advisory: data density, filtering, accessibility, and responsive guidance are retained; marketing layout, remote fonts, and alternate palettes are rejected.
- W4-01 consumers influence API stability but do not broaden this closure into other-module migration.
- Contributor modules and contracts remain under their existing owners; W2-02 records external defects instead of changing foreign seams.

## Communication And Review

| Moment | Audience | Required communication |
|---|---|---|
| Stage gates | Program owner / product authority | Artifact summary, exact scope, changes requested or approval |
| Before live acceptance | Manager-demo owner and quality reviewer | Isolated project name, demo-guard result, acceptance command sequence |
| During implementation | UI Driver and Booking consumer | Primitive mappings, semantic exceptions, route-state coverage |
| Acceptance completion | Program owner, quality reviewer, W4-01 owner | Evidence index, audit verdicts, residual risks, backlog update |
| Any external blocker | Owning contributor team | Exact failing seam and evidence; no unauthorized rewrite |

## Escalation Triggers

- Any command would target `linercore-shared-platform`, an unscoped Compose project, or the manager-demo port.
- A required closure change falls outside `packages/ui`, Booking reference migration, shared tokens/primitives, or the design-system master.
- A proposed change alters a producer/consumer contract or rewrites prior merged intent evidence.
- The live run cannot prove an expected state or either audit is not green.
- A recommendation requires a second frontend, module-local theme/navigation, marketing composition, or weakened accessibility/lint gates.
