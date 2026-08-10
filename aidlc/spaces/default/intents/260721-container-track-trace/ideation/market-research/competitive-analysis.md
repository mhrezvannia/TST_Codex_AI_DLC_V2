# Competitive Analysis - W2-04 Container Journey and Track-Trace

## Scope and evaluation frame

This analysis applies the internal-carrier capability defined in the upstream
[`intent-statement.md`](../intent-capture/intent-statement.md). It does not size a
standalone software market. The comparison asks which option best supports one
equipment-control workflow, the frozen DCSA Track & Trace v2.2 contract, the
existing LinerCore Booking and Container Movement seams, and observable live
proof.

The relevant audience is the equipment-control clerk first, customer service
second, and the release reviewer who needs broker-to-database evidence. Scale is
to be established later from actual assigned-container, journey, movement,
rejection, and projection volumes. No unsupported revenue or TAM estimate is
used.

## Alternatives and competitive fit

| Alternative | Strengths | Weaknesses / boundary | Commercial model | Fit for W2-04 |
|---|---|---|---|---|
| Extend LinerCore's existing Container Movement core | Preserves the real W1 event seam, service ownership, Booking projection, audit model, and shared-shell route; permits exact lifecycle and rejection semantics | LinerCore owns implementation, testing, operations, and later migration work | Internal build and operating cost | **High** - selected |
| Adopt DCSA standards assets and conformance tools as accelerators | Open standard, OpenAPI/reference material, common event vocabulary, and conformance sandbox reduce semantic drift | They are specifications and validation aids, not a carrier transaction system or ERP workflow | DCSA publishes standards openly; integration effort remains internal | **High as an accelerator**, not a runtime replacement |
| Buy a broad transportation visibility suite | Mature shipment views, planned/actual event matching, timelines, exception status, manual reporting, and provider integrations are available | Broader shipment network and configuration model than this thin container lifecycle; replacement would duplicate established services and seams | Subscription/enterprise pricing; public sources reviewed do not provide a decision-grade quote | **Low for this slice** |
| Partner for an external visibility or connectivity network | Can reduce future onboarding work for carrier, terminal, depot, or sensor feeds | Moves W2-04 into EDI/provider integration, which belongs to P2-05; does not remove the need for an authoritative internal journey | Typically partner/subscription plus integration; procurement evidence is not yet available | **Defer and reassess for P2-05** |
| Replace the capability with a TOS, depot, fleet, or M&R suite | Deep execution or asset-management breadth | Wrong bounded context; introduces terminal execution, depot stock, fleet registry, condition/lease, or repair scope expressly excluded by the intent | Enterprise license and implementation | **Reject for W2-04** |

DCSA's official implementation guide recommends mapping the standard to the
implementer's data, using its OpenAPI specification, and checking conformance in
the sandbox. Its conformance programme lists carrier adoption of Track & Trace
v2.2. These facts support standards reuse without treating the standard as a
complete application ([DCSA implementation guide](https://developer.dcsa.org/implementing-track-and-trace),
[DCSA conformance](https://dcsa.org/standard-conformance)).

As a representative enterprise-suite benchmark, SAP models tracked processes
with planned events and actual events that either match the plan or become
unplanned events; its UI supports planned/unplanned event reporting and a
tracking timeline. Oracle also exposes shipment status, completed stops, latest
events, and planned-versus-actual timing. These are table stakes, not reasons to
replace LinerCore's current service boundary ([SAP event model](https://help.sap.com/docs/business-network-global-track-and-trace/model-administrator/basic-terms),
[SAP reporting flow](https://help.sap.com/docs/business-network-global-track-and-trace/transportation-planner/report-planned-or-unplanned-events),
[Oracle shipment visibility](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/planning/shipment_manager/shipment_visibility.htm)).

## Table stakes and differentiation strategy

Table stakes for the W2-04 role are an ordered planned-versus-actual view,
readable status and code, location and occurrence time, manual capture,
exception feedback, and a clear relationship to the shipment/booking. SAP's
timeline also exposes planned and actual times, event status, reporting history,
sender, and reporter, reinforcing the need for provenance and chronology
([SAP timeline grouping](https://help.sap.com/docs/business-network-global-track-and-trace/purchaser-test-tenants/group-events-in-tracking-timeline)).

LinerCore should differentiate through operational trust rather than feature
count or visual novelty:

1. Use DCSA equipment-event language end to end while preserving the producer-
   owned `moveCode` wire contract.
2. Show expected LOAD/DISC and accepted actual GTOT/LOAD/DISC/GTIN together.
3. Make sequence, duplicate, correlation, and source evidence observable rather
   than silently normalizing bad input.
4. Prove one accepted movement through Kafka, persistence, Booking projection,
   and both UIs on the live stack.
5. Keep the workflow in the shared LinerCore shell and avoid a parallel portal.

This is a narrow, defensible advantage: contract-true execution and proof inside
the ERP workflow. Predictive ETA, public tracking, multi-leg planning, and broad
connectivity remain future capabilities.

## Decision

Extend the existing LinerCore core, reuse DCSA assets for vocabulary and
conformance, and defer partner/buy decisions to the external-connectivity intent.
No reviewed alternative justifies replacing the real W1 service and broker seams
for this vertical slice.
