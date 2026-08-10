# Competitive Analysis - W1-01 Booking Quote-to-Cash

## Research Frame

This assessment applies the outcome and scope defined in the upstream `ideation/intent-capture/intent-statement.md`: one carrier booking must move from capture through live pricing and confirmation to CMM journey status without re-keying. LinerCore is an internal carrier platform, so this is an alternatives analysis rather than a claim that W1-01 is a standalone commercial SaaS product.

The comparison uses three alternative classes:

1. Integrated liner-shipping suites, represented by Softship's public product positioning.
2. Broad transportation-management suites, represented by SAP Transportation Management and Oracle Transportation Management documentation.
3. Fragmented point tools, spreadsheets, email, and manual re-keying, the current-state substitute described in the LinerCore program vision.

Vendor capability statements are vendor claims, not independently verified product tests. Pricing and implementation cost are not publicly comparable from the reviewed sources and remain unknown.

## Alternative Profiles

### Integrated liner-shipping suite

Softship positions its products as modular software for international liner shipping across commercial, operations, equipment control, and finance processes, with hosted options and a global installed base. This establishes that broad, integrated carrier workflows are an existing buy alternative, not a greenfield category invented by LinerCore. [Softship official site](https://www.softship.com/)

Likely strengths are domain breadth, established operational practices, vendor support, and faster access to mature functions. Likely constraints for this program are migration cost, fit to LinerCore's explicit bounded contexts and contracts, control over DCSA-aligned internal names, and the risk of making W1 depend on a suite-wide adoption decision.

### Broad transportation-management suite

SAP documents ocean freight booking flows, multimodal stages, container units, and carrier message exchange in Transportation Management. Oracle documents ocean FCL planning, multiple equipment assignments, voyage schedules, rates, and integration-driven booking actions. These products demonstrate that routing, voyage, equipment, and booking state are table-stakes concepts in mature transportation systems. [SAP ocean freight process](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/ca69ceb75dad454bad9bbeb25613b198.html?version=latest), [Oracle ocean FCL booking](https://docs.oracle.com/en/cloud/saas/transportation/25c/otmol/planning/order_manager/order_rel_actions/build_shipment_on_primary_leg.htm), [Oracle voyage schedules](https://docs.oracle.com/en/cloud/saas/transportation/25c/otmol/schedule_manager/create_voyage.htm)

Their documented orientation is broader transportation planning and shipper/forwarder execution. Adopting one could provide substantial planning capability, but it would not automatically preserve LinerCore's carrier-owned Booking, Charge, and CMM boundaries or its frozen Kafka contracts.

### Fragmented tools and manual handoffs

The program vision identifies the practical substitute as spreadsheets, email, isolated operations systems, and manual status handling. Its advantages are low immediate procurement cost and local flexibility. Its structural weaknesses are stale or transcribed prices, duplicate master data, missing traceability, and manual movement-status reconciliation. This alternative directly fails W1-01's no-re-keying and auditable-live-seam outcome.

## Capability Comparison

Ratings are reasoned assessments from public documentation and the repository's stated requirements; they are not vendor benchmarks.

| Capability | LinerCore W1 target | Integrated liner suite | Broad TMS suite | Fragmented tools |
|---|---|---|---|---|
| Carrier booking domain fit | Strong for the thin slice | Strong | Adequate | Weak |
| Contract-owned Booking/Charge/CMM boundaries | Strong by design | Unknown/configuration-dependent | Weak to adequate | Absent |
| Ocean routing, voyage, and equipment concepts | Adequate in W1; extensible | Strong | Strong | Weak |
| Live pricing-to-booking integration | Strong for frozen seam | Likely strong in-suite | Configuration-dependent | Weak/manual |
| DCSA-aligned interoperability | Strong target with conformance work | Product/version-dependent | Integration-dependent | Absent |
| Real-time event and status traceability | Strong target | Product-dependent | Integration-dependent | Weak |
| Fit to existing W0 platform investment | Strong | Weak | Weak to adequate | Weak |
| Time to one narrow working slice | Moderate | Procurement/implementation-dependent | Implementation-dependent | Fast but non-compliant |
| Control over data ownership and evolution | Strong | Vendor-constrained | Vendor-constrained | Local but inconsistent |

## Table Stakes

- A booking record must represent route legs, voyage, equipment type and quantity, commercial state, and linked operational status. SAP and Oracle documentation reinforce that flat origin/destination/equipment strings are below the mature category baseline.
- Booking integrations must be interoperable and testable. DCSA's Booking implementation guide provides OpenAPI endpoints, a reference implementation, conformance framework, and sandbox guidance for adopters. [DCSA Booking implementation guide](https://developer.dcsa.org/implementing-booking)
- Track-and-trace data requires a common event vocabulary and interface. DCSA publishes Track & Trace 2.2 documentation, APIs, event naming, and reference material intended for carrier and third-party interoperability. [DCSA Track & Trace documentation](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace)
- A booking-desk workflow must expose lifecycle feedback after confirmation. A create form that cannot show the resulting journey is incomplete regardless of backend test coverage.
- Production claims require observed runtime behavior, restart safety, dedupe, and traceability; structural contract files alone are not competitive capability.

## Differentiation Strategy

W1-01 should not compete on feature count. Its defensible contribution is a small, contract-true reference implementation inside LinerCore:

- canonical names flow from domain to wire and UI through explicit mappings;
- Booking owns the commercial orchestration while Charge and CMM retain their data ownership;
- real Kafka delivery replaces hidden request-path coupling;
- envelope-id dedupe and revision handling make at-least-once delivery operationally safe;
- live evidence links user action, database state, topic records, and UI status.

This is a foundation for later breadth. It also keeps a future suite procurement or integration decision reversible because the boundaries and contracts remain explicit.

## Risks And Conclusions

- **Buy risk:** a suite could duplicate broad future capability, but selecting one is a program-level transformation decision with data migration, integration, and operating-model consequences. It should not block the thin W1 slice.
- **Build risk:** custom domain development can under-deliver mature table stakes. W1 mitigates this by adopting DCSA vocabulary, keeping scope thin, and proving the full runtime.
- **Standards risk:** the repository pins Track & Trace v2.2 while DCSA continues to evolve related models and implementation guidance. W1 must honor the frozen contract and keep mappings/versioning explicit rather than silently mixing versions.
- **Conclusion:** continue building the W1 carrier-specific spine on the existing architecture, adopt standards and infrastructure, and reassess full-suite procurement only against the broader program roadmap.
