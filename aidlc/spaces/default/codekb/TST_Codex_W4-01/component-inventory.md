# Component Inventory — TST_Codex_W4-01

## Backend services

| Component | Responsibility | Key dependencies | Health |
|---|---|---|---|
| Identity service | Roles, permissions, effective authorization | Own PostgreSQL DB; auth/BFF and domain callers | Healthy boundary; end-to-end session coverage incomplete |
| Reference Data service | Reference sets, records, validation, lifecycle, history, event outbox | Own PostgreSQL DB; Identity; Kafka/Avro | Healthy backend; UI route maturity at risk |
| Charge Agreement service | Agreements, versions, rates, pricing, manual cases | Own PostgreSQL DB; Identity; Reference Data; Booking consumer relationship | Healthy rich domain; route/UI overlap at risk |
| Booking service | Booking aggregate, validation, pricing snapshots, confirmation/amendment, journey projection | Own PostgreSQL DB; Charge; Reference; Identity; Kafka | Healthy integration hub; comparatively high coupling by role |
| Container Movement service | Journey aggregate, booking-event consumption, movement capture, status publication | Own PostgreSQL DB; Reference; Identity; Kafka; Booking consumer relationship | Healthy backend; degraded product surface due to absent frontend |
| Platform messaging | Shared publisher, schema registration, relay/outbox support | Kafka, Avro, Confluent Schema Registry | Healthy shared infrastructure seam; live broker behavior not reverified |

Health ratings are architectural synthesis, not runtime SLO results. “Healthy” means responsibilities and ownership are coherent in static evidence.

## Frontend applications

| Component | Responsibility | Shared dependencies | Assessment |
|---|---|---|---|
| `apps/auth` | OIDC/auth gateway and session lifecycle | `packages/auth`, config, UI | Established shared auth boundary |
| `apps/shell` | One authenticated product shell | Auth and `@erp/ui` | Canonical but Booking-centric |
| `apps/booking` | Booking list/create/detail, pricing actions, JourneyStatusPanel | auth, api-core, shared types, transformers, config, UI | Most complete shell-integrated domain UI |
| `apps/reference-data` | Reference workbench and BFF | service clients, auth, UI, TanStack Query, Zustand | Functional workbench; stable list/detail route gap |
| `apps/charge-agreements` | Agreement/rate/manual-pricing administration | auth, API/shared packages, UI | Rich routes; standalone shell and overlapping detail seams |
| Container Movement frontend | Intended journey list/detail/Booking lookup UI | Would reuse auth, API packages, UI, shell | **Absent** from indexed repository |

## Shared packages

| Package | Responsibility | Main consumers |
|---|---|---|
| `@erp/ui` (`packages/ui`) | Shared tokens, components, shell-compatible presentation primitives | All frontend apps |
| `packages/auth` | Session/auth helpers and boundary types | Auth, shell, domain BFFs |
| `packages/api-core` | Common API/BFF behavior and error/correlation support | Domain apps |
| `packages/shared-types` | Cross-workspace TypeScript contracts | Domain apps and transformers |
| `packages/transformers` | Boundary-to-view/domain translation | Domain apps |
| `packages/utils` | General utilities | Workspace consumers |
| `packages/config` | Shared runtime/build configuration | Apps and service clients |

## Ownership and coupling hotspots

- Booking is the business integration hub: it synchronously depends on Reference and Charge and asynchronously exchanges state with Container Movement.
- `@erp/ui`, auth, and the shell are shared-kernel-like frontend assets and must remain centrally owned; domain forks would create synchronized change coupling.
- Charge has the largest indexed service package and richer lifecycle surface. Its standalone UI and route overlap are change hotspots for W4-01.
- Container Movement’s backend-to-Booking seam exists, but direct operator discovery and detail navigation lack a domain frontend.
- Graph-derived service boundary call counts include static/test/artifact edges and are directional indicators, not production traffic measurements.

## Inventory limitations

This inventory covers components identified by the supplied scan and code graphs. Exact deployable artifacts, containers, Nginx locations, feature flags, runtime health, owners, and support rotations were not verified. “Absent” means no indexed repository component was found; it does not exclude an external or untracked implementation.
