# Constraint Register — W4-01 Module List-Detail Uplift

## Sources and Status Model

Sources: `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md`, plus current repository/Compose/Nginx evidence.

Statuses: **Binding** = applies now; **Verify** = evidence required before affected unit closes; **Trigger** = reassess only if scope changes.

## Binding Constraints

| ID | Category | Constraint | Status | Verification / owner |
|---|---|---|---|---|
| C-01 | Product architecture | Preserve one authenticated LinerCore shell; no domain-local shell or global navigation | Binding | Shell route review and live navigation evidence — W2-01/platform owner |
| C-02 | UI ownership | Consume shared tokens and `@erp/ui`; no local theme, shared-component fork, or alternate token system | Binding | Design-system mapping, code scan, `erp-fidelity-audit` — W2-02/UI platform owner |
| C-03 | Domain ownership | Use existing BFF/service contracts; no app-to-app business imports or direct database reads | Binding | Application design and dependency scan — module owners |
| C-04 | Provider truth | Enable query/action behavior only when the real provider supports it; unresolved cells are visibly blocked | Binding | Capability matrix and live provider evidence — domain/product owners |
| C-05 | Scope | Add no new business capability, saved views, bulk operations, global search, or backend integration seam | Binding | Requirements traceability and change control — product owner |
| C-06 | Routing | Stable list/detail URLs and exact Agreement↔Booking/Journey↔Booking identifiers must work in shell context | Binding | Route tests and live cross-link evidence — shell/module owners |
| C-07 | Accessibility | WCAG AA, keyboard/focus/error/status-announcement behavior, and responsive evidence at 375/390/768/1024/1440 | Binding | Automated and manual accessibility evidence — design/quality owners |
| C-08 | Security | Preserve server-side authn/authz, session handling, service-token boundaries, and audit/correlation context | Binding | Security tests and live denied/read-only paths — auth/domain owners |
| C-09 | Infrastructure | No new AWS services/accounts or persistence owners; reuse existing topology unless verified evidence triggers approval | Binding | Infrastructure diff and architecture review — AWS/platform owner |
| C-10 | Delivery | Merge three vertical units independently in Reference → Charge → Container order; close only after integrated evidence | Binding | Backlog/DoD audit — delivery/product owners |

## Verification Constraints

| ID | Category | Constraint / uncertainty | Status | Closure evidence / owner |
|---|---|---|---|---|
| C-11 | Container UI | No `apps/container-movement` exists | Verify | Create minimum current-stack app/BFF composition from W2-04 contracts — Container/module owner |
| C-12 | Edge mount | Compose and Nginx contain no Container Movement frontend/mount | Verify | App service, health check, canonical proxy location, authenticated live navigation — platform owner |
| C-13 | Shell routes | Current edge exposes both `/bookings` app paths and `/booking` shell composition; canonical cross-link choice must be explicit | Verify | Requirements/design route registry and redirect tests — shell owner |
| C-14 | Reference capability | Provider-supported search/filter/sort/pagination/action matrix is not yet approved | Verify | Requirements capability matrix with blocked ownership — Reference/domain owner |
| C-15 | Charge regression | Mature Agreement routes/BFF limits and legacy workbench coexist | Verify | Route/action parity tests and retirement evidence — Charge owner |
| C-16 | Shared components | Refined designs may expose missing shared primitives | Verify | File a UI-platform dependency; do not implement locally — W2-02 owner |
| C-17 | Runtime capacity | Full Compose stack has multiple JVM, Kafka, search, and UI containers | Verify | Use required profiles, resource limits, health evidence, and isolated stack naming — quality/platform owner |

## Compliance and Data Triggers

| ID | Trigger | Required response |
|---|---|---|
| C-18 | New personal-data category or external customer audience | Reclassify data and review privacy basis, retention, access, and data-subject obligations |
| C-19 | Payment-card or health information enters scope | Stop and perform formal PCI/HIPAA applicability assessment before design |
| C-20 | New region, replication, or external provider | Review residency, sovereignty, cross-border flow, contracts, and encryption controls |
| C-21 | New AWS service/account | Produce infrastructure decision, IaC/cost/security review, environment parity, and operational ownership before approval |

## Constraint Conclusion

The register contains no intent-wide blocker. C-11 through C-17 are mandatory verification items; failure closes neither the affected unit nor the overall intent. C-18 through C-21 are change triggers, not current claims of regulatory applicability.
