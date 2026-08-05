# Market Trends - W2-04 Container Journey and Track-Trace

## Standards and adoption signals

The upstream [`intent-statement.md`](../intent-capture/intent-statement.md) pins
the slice to DCSA Track & Trace v2.2 and the repository's producer-owned event
contract. That is consistent with DCSA's published v2.2 documentation and
conformance programme: the standard defines common processes, data, and
interfaces, and the implementation guidance directs adopters to map the model,
use OpenAPI, and run conformance checks ([DCSA Track & Trace documentation](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace),
[DCSA implementation guide](https://developer.dcsa.org/implementing-track-and-trace),
[DCSA conformance](https://dcsa.org/standard-conformance)).

DCSA's 2026 roadmap also describes Track & Trace 3.0 alpha and beta activity.
That is a forward-looking compatibility signal, not authority to change this
intent's frozen v2.2 scope or rename its v1 event envelope. A later contract
change must follow compatibility and producer/consumer sign-off rather than be
folded into W2-04 ([DCSA standards roadmap 2026](https://dcsa.org/newsroom/dcsa-standards-roadmap-2026)).

## Workflow table stakes

Visibility products increasingly present an operational process as planned
milestones plus actual or unplanned events. The practical table stakes for this
slice are therefore:

- expected and actual milestones in one ordered timeline;
- readable DCSA code, location, occurrence time, and lifecycle state;
- manual event capture with input preserved on validation failure;
- planned-versus-actual state and exception/rejection visibility;
- source, correlation, and reporting provenance;
- a projection into the commercial shipment or Booking view; and
- accessible status semantics that do not rely on color alone.

SAP's current model explicitly distinguishes planned, actual, and unplanned
events and separates business occurrence time from technical reporting time.
Its shipment UI supports manual planned/unplanned reporting and timeline detail.
Those capabilities validate the W2-04 planned/actual and provenance direction
without requiring suite parity ([SAP basic terms](https://help.sap.com/docs/business-network-global-track-and-trace/model-administrator/basic-terms),
[SAP planned/unplanned reporting](https://help.sap.com/docs/business-network-global-track-and-trace/transportation-planner/report-planned-or-unplanned-events)).

## Trust, interoperability, and evidence

As event exchange becomes standardized, trust shifts from merely displaying an
event to demonstrating how it was classified, ordered, deduplicated, persisted,
and propagated. For W2-04, duplicate and out-of-sequence handling are first-class
operational evidence. The durable proof must link the request and audit outcome
to the unchanged journey state and show that rejected input did not advance the
Booking projection.

DCSA notes that standardized interfaces reduce bespoke mapping and onboarding,
which supports keeping the internal contract DCSA-aware now while postponing
partner connectivity ([DCSA Track & Trace success story](https://dcsa.org/newsroom/success-story-dcsa-track-trace-standard)).

## Audience and measurement implications

This is an internal carrier workflow, so market-size claims are inappropriate.
Product evidence should instead measure:

- active equipment-control and customer-service roles using the workflow;
- confirmed bookings with assigned containers;
- journeys created or reconciled and expected moves derived;
- accepted movements by DCSA code;
- duplicate and sequence rejections by reason;
- publish-to-Booking projection latency and stale/dedupe outcomes; and
- timeline usage and correction/retry success.

These measures establish real addressable volume and workflow value without
inventing external revenue estimates.
