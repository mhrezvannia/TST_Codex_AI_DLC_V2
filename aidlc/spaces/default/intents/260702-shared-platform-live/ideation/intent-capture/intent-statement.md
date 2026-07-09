# Intent Statement - Shared Platform Local Functionality

## Problem Statement

The previous Shared Platform AI-DLC MVP run produced a scaffold and validation surface, but it is not yet a functional local platform. The current UI is mostly read-only, authentication is a local bypass/placeholder, backend services are not running locally, BFF routes do not call real backend APIs, seed loading is dry-run oriented, and the quality-gate evidence still depends on a Java/Maven runner for backend verification.

This creates a program blocker: the LinerCore product MVP depends on Shared Platform being live enough to support Charge & Customer Agreement, Customer Booking, and Container Movement Management. If Shared Platform remains placeholder-wired, building those business modules next would compound integration debt.

## Target Customer

Primary beneficiaries:

| Stakeholder | Need |
| --- | --- |
| Platform / Architecture team | A runnable Shared Platform foundation that proves reference data, identity, and event transport patterns. |
| Reference-data administrators | A UI and API path that can create, update, deactivate, view history, and observe publication status for the nine reference sets. |
| Security / IT | Realistic local Keycloak/identity-service behavior, with a controlled development bypass only where explicitly enabled. |
| Future module teams | Stable local contracts, seeds, and service endpoints for Charge, Booking, and Container Movement integration. |
| Program owner | Confidence that the foundation is usable before funding/building the next business modules. |

## Success Metrics

| Metric | Target |
| --- | --- |
| Local backend runtime | `identity-service` and `reference-data-service` compile, test, and run locally. |
| Full local stack | Docker Compose starts required backing services and app services on documented ports. |
| Reference-data functionality | Authorized local user can create, update, deactivate, list, inspect history, and view outbox/publication status for MVP reference sets. |
| Auth functionality | Local Keycloak/identity-service path works; `AUTH_BYPASS=true` remains a deliberate development-only fallback. |
| BFF integration | `apps/auth` and `apps/reference-data` route handlers call real backend services rather than static local data for core flows. |
| Seed execution | Seed loader applies data through real service/admin APIs, not only dry-run validation. |
| Contract/event readiness | OpenAPI, Avro, outbox status, and contract catalog align with running service behavior. |
| Quality gates | Full quality gates pass locally or in CI, including backend Maven tests. |

## Initiative Trigger

The trigger is the gap discovered after the first MVP workflow: the scaffold is validated but not product-functional. The user needs to complete LinerCore modules, but the docs make Shared Platform the hard dependency for all other modules. Therefore the next value-producing step is to make Shared Platform locally functional and integration-ready before building Charge, Booking, and Container Movement.

## Initial Scope Signal

Scope: `feature`.

Rationale: this is a brownfield feature/integration initiative over an existing scaffold. It should run the full AI-DLC feature lifecycle because it touches runtime behavior, backend services, BFF integration, local infrastructure, quality gates, and Operation readiness.

## Remembered Program Roadmap

After this intent completes, continue in this order:

1. Build Charge & Customer Agreement.
2. Build Customer Booking.
3. Build Container Movement Management.
4. Run integration milestones M0-M4 to prove the full LinerCore MVP journey.
