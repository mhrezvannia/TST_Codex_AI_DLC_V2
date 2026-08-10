# Feasibility Assessment — W4-01 Module List-Detail Uplift

## Executive Finding

**Verdict: feasible with controlled constraints.** The approved `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` describe a thin application-composition uplift over capabilities already present in the repository. Reference Data and Charge Agreements have frontend/BFF seams; Container Movement has a live service and W2-04 contracts but lacks an app and reverse-proxy mount. The three-unit sequence contains that uncertainty and preserves independent delivery.

No replacement platform, new external integration, new AWS service/account, new persistence owner, or new business capability is required. Feasibility depends on preserving the single shell, verifying real provider operations, and treating unsupported behavior as blocked rather than simulated.

## Observed Technical Baseline

| Area | Repository evidence | Feasibility implication |
|---|---|---|
| Application stack | Indexed apps are TypeScript/Next.js; shell, auth, Booking, Reference Data, and Charge Agreements exist | Current team and build system can deliver the uplift without a new framework |
| Shared UI | `packages/ui` is the shared `@erp/ui` surface and LinerCore tokens are already defined | Repeated primitives can be reused; missing shared capability must be platform-owned |
| Reference Data | App has service clients, permission resolution, correlation IDs, and provider error response handling | Unit 1 can compose real list/detail behavior over existing seams |
| Charge Agreements | App has Agreement list/detail/form components, canonical path helpers, and BFF proxy behavior | Unit 2 is primarily route/presentation consolidation with regression risk around mature behavior |
| Container Movement | `container-movement-service`, database, Kafka topic, Reference Data dependency, and seeds exist in Compose | Domain runtime exists, but Unit 3 must create the frontend/BFF composition and mount from verified contracts |
| Shell edge | Nginx mounts auth, Reference Data, Charge, Booking, and shell; Container Movement is absent | Canonical Container Movement URL, health path, Compose app service, and Nginx route are explicit deliverables |
| Runtime evidence | Compose includes health checks, Keycloak, PostgreSQL, Kafka, schema registry, observability profiles | Live integration can be observed without inventing a new infrastructure topology |

## Technical Viability by Unit

### Unit 1 — Reference Data

Feasible. The provider client and permission/error seams already exist. The main work is decomposing the legacy workbench into stable list/detail routes and mapping shared states/components without changing service ownership. Primary risks are provider capability mismatch, URL-state preservation, and action parity.

### Unit 2 — Charge Agreements

Feasible. Mature Agreement routes and detail components reduce implementation uncertainty. The uplift must preserve rate, D&D, validity/status, request validation, proxy limits, and authorization behavior while removing the legacy canonical workbench. Primary risk is regression during consolidation, not missing domain capability.

### Unit 3 — Container Movement

Feasible with a high-priority bounded issue. The backend service and event infrastructure exist, but there is no app package, Compose frontend service, shell environment/mount, or Nginx location. W2-04 contracts and designs therefore must drive the minimum frontend/BFF route. Completion requires an authenticated live route and real journey data; a visual-only page is not evidence.

## Architecture Constraints

1. **One composition boundary:** the existing LinerCore shell remains the authenticated navigation authority. Module routes may be separately deployed, but they must appear as one product and preserve shell context.
2. **No app-to-app domain imports:** cross-links carry stable identifiers through canonical URLs; business data continues through owned BFF/service contracts.
3. **Shared UI ownership:** application code consumes `@erp/ui` and `--erp-*` tokens. A missing reusable primitive is a UI-platform dependency, not permission to fork.
4. **Provider truth:** search/filter/sort/pagination and actions are enabled only when supported by the real provider contract.
5. **No new infrastructure by default:** extend the existing application/edge configuration only as needed to mount Container Movement; do not introduce an AWS service, database, topic, or account without a separately evidenced requirement.
6. **Backward-compatible routing:** route retirement uses deliberate redirect/removal behavior and preserves exact-record cross-links.

## Security, Privacy, and Compliance Feasibility

- W4-01 introduces no identified payment-card or health-data processing and therefore provides no evidence for a new PCI or HIPAA scope. That is a scope observation, not a legal certification.
- Authenticated subject, role/permission decisions, correlation/audit context, and business-partner/location data remain under existing security and privacy controls.
- UI code must not introduce production-like local users, client-held service credentials, direct service/database access, or authorization inferred from hidden controls.
- Actions require server-side authorization and auditable outcomes; denied/read-only states must reflect actual capability.
- WCAG AA evidence is part of operational correctness: named controls, visible/unobscured focus, logical order, linked validation, dialog focus restoration, non-color status meaning, and announced asynchronous results.
- If later requirements add personal-data categories, new regions, payment data, or external customer access, compliance applicability and data flows must be reassessed before construction.

## AWS and Operational Perspective

No repository evidence requires new AWS services/accounts, and the user confirmed an infrastructure-neutral scope. The existing local Compose topology is the acceptance environment, not a production orchestration claim. W4-01 must preserve current health checks, timeouts, correlation IDs, logging, resource limits, and observability seams where affected.

The Well-Architected impact is therefore change-control oriented:

- **Operational excellence:** automate build/test/audit evidence and document route/mount recovery.
- **Security:** preserve identity and least-privilege service/BFF boundaries; no new secrets in client code.
- **Reliability:** expose provider error/degraded/stale states and health-check the new frontend mount.
- **Performance:** use provider-supported pagination and measure list/detail response behavior; do not load unbounded datasets client-side.
- **Cost/sustainability:** reuse existing runtime services; a new application container is acceptable only as the minimal mount required by the established topology.

## Delivery Feasibility and Exit Conditions

The Reference → Charge → Container sequence is viable because each unit has a separate canonical route and provider seam. The intent remains open until all units pass integrated evidence. Review availability, Compose resource capacity, and the Container mount must be scheduled before Unit 3 begins.

Feasibility is preserved only if these exit conditions remain binding:

- Requirements and User Stories approve exact provider capabilities and blocked cells before refined design.
- The ordered UI/UX tasks 21, 22, and 23 execute within the single parked Refined Mockups stage.
- Every module is observed through an authenticated live Compose session at canonical list and detail URLs.
- Cross-links land on exact Booking records, and retired routes are removed or deliberately redirected.
- Accessibility/responsive evidence and `aidlc-audit` plus `erp-fidelity-audit` are green.

## Conclusion

Proceed. No feasibility blocker prevents Requirements Analysis or design. The Container Movement frontend/mount gap, canonical route alignment, provider-capability matrix, and shared-component dependency discipline are mandatory controls to carry forward. Any failure of a real provider contract blocks the affected behavior with an owner; it does not authorize simulation or a local architectural fork.
