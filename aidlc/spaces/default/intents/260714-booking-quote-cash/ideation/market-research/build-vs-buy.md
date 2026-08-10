# Build-vs-Buy Assessment - W1-01 Booking Quote-to-Cash

## Decision Context

The upstream `ideation/intent-capture/intent-statement.md` commits W1-01 to a thin, observed booking journey on an existing brownfield codebase. W0 messaging and reference-data prerequisites are already live-proven. The relevant decision is therefore which W1 capabilities remain carrier-specific product code and which should reuse standards, libraries, services, or vendor components.

## Evaluation Criteria

| Criterion | Weight | W1 interpretation |
|---|---:|---|
| Carrier-domain fit | High | Must preserve Booking, Charge, and CMM ownership and frozen contracts |
| Time to live proof | High | Must deliver one narrow journey without a suite transformation |
| Standards interoperability | High | DCSA/UN/LOCODE/ISO concepts and executable schemas are required |
| Reuse of closed prerequisites | High | W0 infrastructure and canonical data should be adopted unchanged |
| Operational ownership | High | Team must diagnose outbox, broker, dedupe, and projection behavior |
| Reversibility | Medium | Future suite integration should remain possible through explicit seams |
| Three-year cost | Unknown | Vendor licensing and implementation costs are not public enough for a defensible estimate |

## Capability Decisions

| Capability | Build / Buy / Partner | Decision |
|---|---|---|
| Booking aggregate, lifecycle, and detail projection | Build | Core carrier workflow and W1 value; must match frozen contracts and current architecture |
| Booking-to-Charge orchestration | Build adapter and workflow | The bilateral behavior is domain-specific; reuse existing HTTP and resilience libraries |
| CMM journey upsert and Booking status projection | Build | Encodes owned context behavior, idempotency, and revision semantics |
| Kafka publication and outbox relay | Adopt existing W0 module | Commodity infrastructure already proven live; duplication is forbidden |
| Schema Registry integration and Avro serialization | Adopt existing W0 module and Apache/Confluent tooling | Mature protocol tooling with executable serde and compatibility checks |
| PostgreSQL persistence and migrations | Adopt existing stack | Existing service-local ownership model and migration approach fit W1 |
| DCSA schemas, vocabulary, and conformance guidance | Adopt / partner with standards ecosystem | DCSA publishes implementation guidance, models, and conformance resources; do not invent equivalents |
| Identity and authorization | Adopt existing platform; defer shell integration | W2-01 owns end-user shell/auth migration; W1 must not create a competing identity system |
| Vessel schedule source | Partner later | W0-02 provides canonical records, while production schedule sourcing remains external |
| Full liner-shipping suite | Do not buy for W1; assess separately | Procurement is a program-level replace/integrate decision, not a prerequisite for one slice |

## Options Assessment

### Option A - Continue targeted build on adopted infrastructure

**Benefits:** fastest path from current code to a contract-true live journey; preserves ownership and existing investment; supports incremental proof; keeps integrations explicit.

**Costs and risks:** team owns domain correctness and long-term maintenance; mature suite breadth must be built over later intents; standards evolution requires active governance.

**Verdict:** selected for W1-01.

### Option B - Procure and implement a liner suite now

**Benefits:** potentially broad commercial, operations, equipment-control, and finance capability with vendor support. Softship's public positioning demonstrates this category exists. [Softship official site](https://www.softship.com/)

**Costs and risks:** procurement and implementation timeline; uncertain fit to frozen boundaries and event contracts; migration of existing code and data; vendor lock-in; no evidence that it closes the specific W1 live path faster.

**Verdict:** reject as a W1 dependency; retain as a broader program option.

### Option C - Adopt a general transportation-management suite

**Benefits:** mature multimodal planning, ocean booking, rates, voyage, equipment, and integration capabilities. [SAP Transportation Management](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/6486beeb38114fdc94261ef2829d5b03.html), [Oracle Transportation Management](https://www.oracle.com/europe/scm/logistics/transportation-management/)

**Costs and risks:** broad shipper/forwarder planning orientation; configuration and integration effort; possible overlap without matching carrier-owned Charge/CMM semantics; suite adoption would exceed the thin slice.

**Verdict:** not selected for W1; useful benchmark and potential integration target.

### Option D - Keep fragmented tools and manual handoffs

**Benefits:** no immediate procurement or migration.

**Costs and risks:** directly preserves stale pricing, duplicate data, non-auditable status handoffs, and re-keying; cannot satisfy the Intent Capture DoD.

**Verdict:** reject.

## Standards Partnership

DCSA provides Booking and Track & Trace implementation guidance, OpenAPI material, reference implementations, and conformance resources. This makes standards adoption a partner/adopt decision, not custom protocol design. [DCSA Booking implementation](https://developer.dcsa.org/implementing-booking), [DCSA Track & Trace documentation](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace)

For W1, the repository's frozen `.avsc` files remain the immediate contract authority. DCSA resources guide terminology and future compatibility; they do not authorize unreviewed field or version changes during implementation.

## Recommendation And Revisit Triggers

Proceed with Option A: build the W1 carrier-domain slice while adopting W0 infrastructure and standards tooling.

Revisit suite procurement only when one of these becomes true:

- the roadmap requires broad capabilities faster than the intent sequence can deliver;
- total custom maintenance exceeds a measured vendor implementation and licensing case;
- a vendor proves compatibility with the required ownership, data residency, contract, and migration constraints;
- executive strategy changes from building a carrier platform to adopting a packaged operating model.

No such trigger is established for W1-01.
