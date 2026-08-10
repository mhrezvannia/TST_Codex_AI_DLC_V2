# Logical Components — booking-design-system-closure NFR Design

## Design Inputs

This inventory places `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, and `tech-stack-decisions.md` onto the canonical flow in `business-logic-model.md`. It bridges to Infrastructure Design without authorizing new infrastructure.

## Component Inventory

| ID | Logical component | NFR responsibility | Failure domain |
|---|---|---|---|
| LC-01 | Shared UI foundation (`packages/ui`) | Tokens, focus/motion, semantic primitives, Skeleton/Table geometry | Generic presentation only |
| LC-02 | Existing authenticated ShellFrame | Session-aware chrome, one navigation/theme/main landmark | Shared shell route tree |
| LC-03 | Canonical shell Booking routes/components | State normalization, bounded list/form/detail rendering, focus/announcements | Booking presentation subtree |
| LC-04 | Shell Booking adapters/routes | Cookie/correlation forwarding and typed load/response mapping | Shell-to-BFF transport |
| LC-05 | Booking BFF | Actor/origin/JSON/idempotency/size/deadline/safe-error controls | Protected transport adapter |
| LC-06 | Existing Booking/supporting services | Domain validation, pricing, lifecycle, persistence/events | Service-owned runtime/data |
| LC-07 | Presentation anti-drift gate | Shared-boundary scan, app color/style/import rejection, negative probes | Build/quality gate |
| LC-08 | Standalone presentation redirect adapter | Trusted-origin route/query allow-list and API exclusion | Compatibility route only |
| LC-09 | Root browser/accessibility harness | Auth, real journey, state setup, matrix assertions, redaction | Test process only |
| LC-10 | Wave A wrapper and isolated Compose project | Deterministic local stack lifecycle and project identity | `linercore-wave-a` only |
| LC-11 | Evidence manifest/artifact store | Traceability, immutable failures/reruns, direct exits | Repository evidence only |
| LC-12 | Manager demo guard | Mandatory read-only pre/post closure gate for the protected demo | Guard process only; manager-demo runtime is never operated by acceptance |
| LC-13 | Closure audits/backlog gate | Final completeness/fidelity decision | Program record only |

## Dependency Direction

LC-03 consumes LC-01/LC-02 and calls LC-04. LC-04 calls LC-05; LC-05 calls LC-06. LC-08 uses trusted shell-origin configuration but does not call/import LC-02 or intercept LC-05 APIs. LC-07 inspects application/package source without entering runtime.

LC-09 drives public LC-02/LC-03 through nginx and observes LC-04/LC-05/LC-06 behavior; it calls LC-10 for lifecycle and writes LC-11. LC-12 is a mandatory closure dependency that gates before and after LC-10, while the manager-demo runtime it observes remains outside and untouched by the acceptance lifecycle. LC-13 reads LC-11 and direct command results. Production components never depend on LC-09–LC-13.

## Shared Resources and Isolation

| Resource | Shared by | Isolation rule |
|---|---|---|
| `@erp/ui` | Existing shell/module applications | W2-02 owns changes; domain props stay out |
| Auth/session/Keycloak | Shell and protected BFF | Existing mechanisms only; no test bypass |
| Booking/support services | Canonical journey | Preserve service/database/event ownership |
| Local Docker engine/ports | Wave A and manager demo processes | Wrapper project/ports only; never target manager project |
| Repository worktree | Code, tests, evidence | Single driver for overlapping files/runtime; probes restore/no-write |

## Blast Radius Map

- LC-01 regression can affect all consumers, so changes require package tests plus shell Booking proof.
- LC-02 regression can affect shared navigation/auth/theme, so only minimal seam changes are allowed.
- LC-03/LC-08 regressions affect Booking presentation/compatibility but must not affect BFF APIs.
- LC-04/LC-05 regression affects real Booking commands and requires focused contract plus live network proof.
- LC-07 failure blocks build/closure but cannot change runtime.
- LC-09/LC-11 defect invalidates evidence and keeps W2-02 pending; it cannot justify production test hooks.
- LC-10 action is isolated to `linercore-wave-a`; LC-12 failure stops action.
- LC-13 failure prevents backlog closure and cannot be waived as PASS.

## Infrastructure Boundary

Logical components map entirely to existing workspace code, local processes, and evidence. There is no AWS account, VPC, IAM role, WAF, KMS key, load balancer, CDN, autoscaling group, cloud database, deployment environment, or cost allocation component. Infrastructure Design must therefore document preservation/isolated local acceptance rather than synthesize IaC.

Historical W1 BLOCKED/waived evidence remains outside LC-13’s power to reclassify.
