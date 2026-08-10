# Market Trends - W1-01 Booking Quote-to-Cash

## Scope And Source Standard

The upstream `ideation/intent-capture/intent-statement.md` defines W1-01 as an internal carrier-platform feature, so this report tracks trends that alter user expectations or implementation risk. It does not estimate TAM, SAM, or SOM. Sources are current standards bodies, public industry references, and official vendor documentation; vendor statements are labeled as such.

## Standards-Based Interoperability

DCSA frames Booking and Track & Trace as shared process, data, and interface standards for carriers, shippers, and third parties. Its Booking 2.0 implementation guidance points adopters to OpenAPI endpoints, reference implementations, a conformance framework, and a sandbox. Its Track & Trace material publishes the event/interface standard and recommends adopting the latest release. [DCSA Booking implementation](https://developer.dcsa.org/implementing-booking), [DCSA Track & Trace](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace)

Implication for W1-01: DCSA alignment is not merely an export adapter concern. Canonical booking, equipment, location, and event concepts should remain recognizable inside the domain and be verified at adapter boundaries. The W1 frozen event contracts remain authoritative for this release, even where later DCSA material exists.

## Conformance Over Document Presence

DCSA's implementation material includes reference implementations, conformance testing, and sandboxes rather than stopping at schema publication. This supports the W1 requirement that contracts execute against real providers and messages. [DCSA Developer Portal](https://developer.dcsa.org/)

Implication for W1-01: schema existence checks are useful preflight checks but cannot close the intent. Serde, consumer/provider, broker, persistence, redelivery, and browser evidence must all be observable.

## Connected Shipment, Equipment, And Vessel Journeys

The DCSA Industry Blueprint 2026.Q1 separates but relates shipment, equipment, and vessel journeys. It describes Booking-to-Payment, Pickup-to-Return, and Departure-to-Arrival as connected process groups across the container transport lifecycle. [DCSA Industry Blueprint 2026.Q1](https://reference.dcsa.org/content/standards/industry-blueprint/v2026-q1/industry-blueprint-2026-q1)

Implication for W1-01: Booking, CMM, and vessel/voyage reference ownership should stay distinct, but a user needs an integrated projection across those boundaries. The W1 Booking detail view is the first narrow projection, not a reason to collapse databases or bounded contexts.

## Event Timelines And At-Least-Once Reality

Track-and-trace events can be planned, estimated, actual, late, or redelivered. The repository's contract already requires event classifiers, occurred/received timestamps, dedupe, and out-of-order tolerance. This aligns with an industry shift from latest-status fields toward auditable event timelines and interoperable event semantics.

Implication for W1-01: the return status cannot be a one-off HTTP callback. It needs durable publication, envelope-id dedupe, ordering/staleness rules, and a persisted Booking projection.

## Mature Suite Breadth

Official SAP and Oracle documentation shows that mature transportation suites already cover ocean bookings, multimodal stages, vessel/voyage schedules, equipment, rates, planning, and integrations. Softship publicly positions a modular liner suite across commercial, operations, equipment control, and finance. [SAP ocean freight booking](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/b2056f4fa97041e89eb2731f62370e78.html?version=2023.latest), [Oracle Transportation Management](https://www.oracle.com/europe/scm/logistics/transportation-management/), [Softship](https://www.softship.com/)

Implication for W1-01: the program should not claim novelty for basic booking fields or routing. Its engineering advantage must come from fit to the carrier's operating model, explicit ownership, standards fidelity, and incremental proof.

## Adopted Platform Components

Reliable messaging, schema management, relational persistence, and identity are commodity capabilities with mature implementations. The program has already adopted Kafka, Confluent Schema Registry integration, PostgreSQL, Spring, and OIDC-oriented identity components.

Implication for W1-01: reuse W0 infrastructure and existing framework patterns. Reimplementing broker clients, schema registration, outbox scheduling, or database infrastructure would add maintenance without differentiating the booking journey.

## Trend Radar

| Trend | W1 stance | Rationale |
|---|---|---|
| DCSA Booking vocabulary and APIs | Adopt vocabulary; assess full API later | Reduces semantic drift; W1 is an internal thin slice, not full external eBooking |
| DCSA Track & Trace event semantics | Adopt contract-pinned v2.2 semantics | Directly governs the CMM-to-Booking event |
| Conformance sandboxes and executable contracts | Adopt | Prevents documentation-only green gates |
| Event-sourced operational timelines | Trial in narrow projection | W1 needs durable status history but not a full event-sourced architecture |
| Full liner-suite procurement | Assess at program level | Potential breadth, but outside a thin feature decision |
| Custom messaging infrastructure | Hold | W0 already provides proven shared infrastructure |

## Watch Items

- DCSA Booking 2.x and later model revisions may introduce useful external API semantics after the internal W1 spine is stable.
- Track & Trace version evolution must be handled through explicit contract versioning and compatibility analysis.
- Vessel schedule sourcing remains an external dependency even though W0-02 proves canonical vessel/voyage reference records.
- Vendor fit, licensing, data migration, and integration costs require a separate procurement discovery if the program considers replacing rather than extending LinerCore.
