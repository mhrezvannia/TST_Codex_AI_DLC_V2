# Constraint Register - Charge & Customer Agreement

## Technical Constraints

| ID | Constraint | Source | Impact | Response |
| --- | --- | --- | --- | --- |
| C-001 | Backend must follow Java/Spring hexagonal Maven module layout with pure `domain-core`. | Project rules | Prevents framework leakage into domain model. | Mirror existing service module structure. |
| C-002 | Frontend must use TypeScript strict mode, Next.js App Router, Yarn/Turborepo, and approved `@erp/*` packages. | Project rules | Shapes app scaffolding and tests. | Add a workspace consistent with existing apps. |
| C-003 | Shared Platform reference data remains upstream, not duplicated business scope. | Intent and project rules | Agreement terms must reference shared IDs. | Validate/use customer, charge code, currency, location, commodity, and trade-lane IDs. |
| C-004 | Host-runtime mode is currently the reliable local path. | Runtime evidence | Docker cannot be the only way to develop. | Keep host start/readiness support until Docker is recovered. |
| C-005 | Docker Desktop is timing out and Compose cannot be assumed healthy. | Local environment | Full Compose validation may fail for environmental reasons. | Separate Docker recovery from module implementation; document blocker. |

## Business Constraints

| ID | Constraint | Source | Impact | Response |
| --- | --- | --- | --- | --- |
| B-001 | Charge & Customer Agreement must precede Booking. | Project memory | Booking depends on active commercial terms. | Build active-agreement lookup before Booking starts. |
| B-002 | First slice must not expand into full RMS. | Market research | Prevents schedule blow-up. | Defer spot rates, benchmarks, carrier connectivity, invoice settlement. |
| B-003 | UI cannot remain view-only. | User feedback | Module must be demonstrably functional. | Include create/edit/approve controls in MVP slice. |

## Compliance and Security Constraints

| ID | Constraint | Source | Impact | Response |
| --- | --- | --- | --- | --- |
| S-001 | Auth bypass is development-only. | Shared Platform rules | Non-local profiles must not allow bypass. | Keep profile/env checks in backend and BFF flows. |
| S-002 | Agreement approval is commercially sensitive. | Compliance analysis | Status changes need traceability. | Store approver, approved timestamp, and status-transition metadata. |
| S-003 | Customer-related data is confidential/internal. | Compliance analysis | Limit duplication and expose only necessary fields. | Store reference IDs; fetch display labels from Shared Platform where needed. |

## Delivery Constraints

| ID | Constraint | Source | Impact | Response |
| --- | --- | --- | --- | --- |
| D-001 | Tests must be written alongside code and quality gates must block failures. | Project rules | No unverified module code. | Add backend unit/service tests and frontend tests for key flows. |
| D-002 | Existing Shared Platform services occupy local ports. | Runtime state | New module needs new service/UI ports. | Allocate non-conflicting ports during application design. |
| D-003 | Postgres is already running on 5432. | Runtime state | Compose postgres may conflict with host Postgres. | Avoid killing unknown DB processes; use current DB or configurable ports. |
