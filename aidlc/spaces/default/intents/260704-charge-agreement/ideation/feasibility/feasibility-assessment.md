# Feasibility Assessment - Charge & Customer Agreement

## Upstream Inputs

This assessment consumes:

| Input | Use |
| --- | --- |
| `intent-statement.md` | Defines the Charge & Customer Agreement module, lifecycle, scope, and dependency on Shared Platform. |
| `competitive-analysis.md` | Confirms contract/rate management is a table-stakes logistics capability. |
| `market-trends.md` | Confirms searchable agreement/rate data and booking integration are expected capabilities. |
| `build-vs-buy.md` | Recommends build-first for the internal LinerCore MVP while preserving future integration seams. |

## Technical Viability

| Area | Assessment | Rationale |
| --- | --- | --- |
| Backend service | Feasible | The repo already has Java 21/Spring Boot/Maven multi-module services with domain-core, application-service, dataaccess, container, messaging, and published-language boundaries. |
| Frontend UI | Feasible | The repo already has Next.js App Router workspaces for `apps/auth` and `apps/reference-data`; a new `apps/charge-agreements` workspace can follow the same pattern. |
| Persistence | Feasible | Local Postgres is already running and used by existing services. The new module can add its own schema/tables. |
| Shared Platform integration | Feasible with care | Reference data and identity services are running locally; the module can consume customers, charge codes, currencies, locations, commodities, and trade lanes. |
| Local runtime | Feasible | Host-runtime mode is working today with services on `8082`, `8083`, UIs on `3000`, `3001`, and proxy on `8088`. |
| Docker/Compose runtime | Constrained | Compose config exists, but Docker Desktop is currently timing out and should be recovered separately from product implementation. |
| Downstream Booking integration | Feasible | The module can expose an active-agreement lookup contract for a future Booking module. |

## Recommended Architecture Direction

Build a new bounded context for Charge & Customer Agreement.

| Component | Recommendation |
| --- | --- |
| Backend | Add `services/charge-agreement-service` following the existing service module structure. |
| UI | Add `apps/charge-agreements` with list, detail, create/edit, and approve flows. |
| API | Expose agreement CRUD, status transitions, search, and active-agreement lookup. |
| Data | Store agreement headers and charge terms in Postgres; reference external Shared Platform IDs instead of duplicating reference data. |
| Auth | Use identity-service authorization when available; keep local bypass development-only. |
| Events | Prepare published-language events for agreement approved/changed, but do not block MVP on Kafka while Docker is unhealthy. |

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Docker Desktop remains unhealthy | High | Medium | Continue host-runtime implementation; track Compose recovery as environment work. |
| Scope expands into full RMS | Medium | High | Keep first slice to agreement lifecycle, charge terms, and active lookup; defer spot/index/carrier network features. |
| Shared reference-data coupling becomes brittle | Medium | Medium | Store stable reference IDs, validate on write where practical, and keep display metadata read-through/cached in UI. |
| Booking assumptions are unknown | Medium | Medium | Define active-agreement lookup early and keep it narrow: customer, trade lane/location, commodity, date. |
| Compliance/audit needs are under-modeled | Low | Medium | Audit status changes and retain created/updated/approved metadata from first slice. |

## Compliance Feasibility

The module appears to process internal commercial data and customer identifiers, not PCI cardholder data or PHI. Main controls are:

| Control area | Feasible control |
| --- | --- |
| Access control | Role-based operations through identity-service/local bypass gates. |
| Auditability | Record created/updated/approved/suspended metadata and expose history later if needed. |
| Data minimization | Reference Shared Platform IDs rather than duplicating full customer/reference records. |
| Environment safety | Ensure local auth bypass cannot be enabled in non-local profiles. |
| Evidence | Keep readiness, smoke, and test artifacts alongside implementation. |

## AWS / Platform Feasibility

The existing project targets Docker Compose/local and GitHub Actions on self-hosted runners, with AWS-specific provisioning deferred. For this module, AWS feasibility is not a blocker. Later cloud deployment should map the service to the same compute/database patterns chosen for Shared Platform and preserve environment parity.

## Feasibility Decision

Proceed.

Charge & Customer Agreement is feasible as the next module if the first implementation stays narrow and vertical:

1. Add backend domain/API/persistence for agreements and charge terms.
2. Add functional UI for list/detail/edit/approve.
3. Consume Shared Platform reference data by ID.
4. Add tests and local smoke/readiness checks.
5. Leave advanced rate-management, invoice settlement, and carrier integrations for later modules.
