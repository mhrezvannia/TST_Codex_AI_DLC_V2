# User Stories Assessment - LinerCore Enterprise

## Decision

Execute User Stories.

## Rationale

User stories add clear value for LinerCore Enterprise because the active scope is user-facing, multi-persona, cross-module, and workflow-heavy. The requirements cover commercial pricing, customer agreements, booking, D&D, container movement, authenticated operations UI, local runtime, and enterprise operation; stories are needed to translate those requirements into testable slices for Refined Mockups, Application Design, Units Generation, and Delivery Planning.

## Factors Considered

| Factor | Evidence | Assessment |
|---|---|---|
| Project type | Enterprise scope with all 32 AI-DLC stages | Stories required |
| User-facing scope | Full authenticated UI for agreements, tariffs, pricing, bookings, journeys, movements, D&D outcomes, exceptions | Stories required |
| Complexity | Five E2E flows across Shared Platform, Charge, Booking, CMM, UI, contracts, runtime, and operations | Stories required |
| Brownfield status | `business-overview.md` shows Shared Platform brownfield, Charge/Agreement partial, Booking/CMM greenfield | Stories help coordinate reuse and new work |
| Component inventory | `component-inventory.md` shows existing identity/reference/charge components and missing Booking/CMM/UI/runtime components | Stories expose implementation gaps |
| Team practices | `team-practices.md` requires an enterprise walking skeleton, tests alongside code, and Graphify-first decisions | Stories must support vertical slices |

## Key Story Areas

- Shared Platform enterprise hardening and access foundations.
- Charge Calculation and Customer Agreement pricing/D&D ownership.
- Customer Booking lifecycle, confirmation, amendments, pricing orchestration, and D&D triggers.
- Container Movement Management journey, movement capture, validation, status publication, and reconciliation.
- Frontend workflows based on the Claude UI baseline but connected to real APIs, permissions, and events.
- Local Docker runtime, deterministic seed data, contracts, observability, and operational evidence.

## Source Context

This assessment consumes `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. Graphify was used for story-shaping context through query/explain/path calls; the pricing path lookup was ambiguous and is not used as evidence.

