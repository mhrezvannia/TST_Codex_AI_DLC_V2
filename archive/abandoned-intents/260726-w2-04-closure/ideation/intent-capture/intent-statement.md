<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). -->

# Intent Statement - W2-04 Closure

## Context Pack (read before starting)

1. `docs/intents/W2-04-container-journey-track-trace.md` - original intent and observed Definition of Done.
2. `aidlc/spaces/default/intents/260721-container-track-trace/aidlc-state.md` - prior workflow state, treated as history rather than acceptance proof.
3. `aidlc/spaces/default/intents/260721-container-track-trace/construction/build-and-test/test-results.md` - recorded build and test gaps.
4. `aidlc/spaces/default/intents/260721-container-track-trace/operation/deployment-execution/smoke-test-results.md` - recorded live-stack gap.
5. `docs/enterprise-contracts/async-event-contract-containermovement-status.md` - authoritative status-event contract.
6. `design-system/linercore/MASTER.md`, `design-system/linercore/SESSION-PROMPT.md`, and `design-system/linercore/pages/container-movement.md` - binding UI contract.
7. `services/container-movement-service/`, `apps/booking/`, and the shared authenticated shell - existing product boundaries to preserve.

## Intent

Container Movement operations clerks can find a journey, inspect its expected and recorded movements, and manually capture the approved DCSA movement sequence on the running LinerCore stack. Customer-service users can then observe the resulting movement progression in Booking. The corrective intent replaces an unsupported completion claim with observed, reviewable evidence.

## Vertical Slice Definition

An authenticated operations clerk opens a one-leg container journey in the shared shell, records GTOT, LOAD, DISC, and GTIN movements, sees the timeline advance, and receives an explicit rejection for duplicate or out-of-sequence input. Each accepted movement persists and crosses the real status-event seam so the corresponding Booking detail displays the updated projection.

- **Layers cut through:** shared-shell CMM UI, service API, journey domain, service-owned persistence, Kafka status event, Booking projection, observable UI result.
- **Thinnest viable form:** one confirmed booking, one container, one routing leg, ACT classifier, GTOT -> LOAD -> DISC -> GTIN.
- **Explicitly deferred to later intents:** EDI ingestion, public DCSA Track and Trace API, fleet registry, depot stock, maintenance and repair, multi-leg routing, predicted or estimated classifiers.

## In Scope / Out of Scope

**In scope**

- CMM journey list and stable journey detail route in the shared authenticated shell.
- Journey detail timeline showing expected moves, accepted history, derived state, and actionable dependency state.
- Manual capture of the approved DCSA movement subset with observable duplicate and ordering rejection.
- Real status propagation to Booking on the isolated Wave A stack.
- Playwright, performance, demo-guard, `aidlc-audit`, and `erp-fidelity-audit` evidence required by the original W2-04 Definition of Done.

**Out of scope**

- EDI movement ingestion and public tracking APIs owned by later Phase 2 intents.
- Broader Container Movement redesign, shared-shell redesign, or `packages/ui` redesign.
- Changes to unrelated Booking workflows, Charge, D&D, fleet, depot, or maintenance capabilities.
- Any waiver that converts an unavailable or failing acceptance gate into PASS.

## Actors & Journey

- **Container Movement operations clerk:** searches for a journey, reviews the expected sequence, captures each actual movement, and resolves clear validation feedback.
- **Customer-service user:** opens the related Booking detail and observes the projected container movement.
- **Release reviewer:** verifies live evidence, negative-path behavior, UI evidence, performance evidence, and audit results before accepting closure.

Journey: sign in -> open CMM journeys -> select the confirmed booking's journey -> capture GTOT -> capture LOAD -> capture DISC -> capture GTIN -> observe the timeline and derived state -> open Booking detail -> observe the matching projected status.

## Cross-Module Seams (must be real)

- `booking.confirmed` must create or reconcile the CMM journey through the real broker path.
- `containermovement.status` must use the authoritative Avro contract and carry the accepted DCSA movement sequence through the real broker.
- Booking must consume and deduplicate the status event and render the resulting projection.
- Authentication and authorization must use the existing shared shell, Keycloak, identity, and service-boundary mechanisms.

## Standards Alignment

The closure uses DCSA Track and Trace v2.2 movement vocabulary, UN/LOCODE locations, and ISO 6346 equipment references at the user, domain, and contract seams. It preserves the exact approved event field names and does not extend the public or deferred standards surface.

## Definition of Done (observed, not "tests pass")

On the isolated `linercore-wave-a` stack, with the manager demo protected before and after the run:

1. An authenticated user confirms or uses a confirmed one-leg booking and a CMM journey exists with expected moves.
2. The running CMM UI exposes journey list, stable detail, timeline, and manual capture.
3. GTOT -> LOAD -> DISC -> GTIN is captured through the UI and persisted.
4. Every accepted movement emits a schema-validated real `containermovement.status` event and Booking renders the matching progression.
5. Duplicate and out-of-sequence capture are rejected observably without advancing state or publishing a second business event.
6. Responsive, keyboard, loading, empty, error, denied, light-theme, and dark-theme Playwright evidence is retained for required viewports.
7. The targeted frontend and backend suites, contract checks, performance checks, and restart or recovery checks pass.
8. `npm run demo:guard` passes before and after acceptance, and both `aidlc-audit` and `erp-fidelity-audit` are green.
9. Any red or unavailable gate keeps the closure blocked with exact evidence.

## Dependencies

- Closed W0-01 eventing foundation.
- Closed W1-01 Booking-to-CMM spine, with its historical waiver preserved separately.
- W2-01 shared shell and authentication capability.
- W2-02 design-system foundation and the current Wave A integration baseline.
- Existing W2-04 source changes are a reusable baseline but not proof of completion.

## Suggested Scope & Sizing

Use `feature` scope. The closure changes an operator-facing workflow across UI, API, domain, persistence, broker, and Booking projection, and therefore cannot be treated as a documentation fix or isolated bugfix. Keep the delivery to one primary vertical implementation unit plus its inseparable live acceptance evidence, splitting only if code ownership requires a second bounded vertical increment.

## Open Questions

1. Confirm the closure boundary.
   - A. Missing W2-04 UI and complete live evidence only (recommended)
   - B. Broaden into deferred Container Movement capabilities
   - C. Documentation correction only
   - X. Other
   - `[Answer]:` A. Missing W2-04 UI and complete live evidence only (recommended)

