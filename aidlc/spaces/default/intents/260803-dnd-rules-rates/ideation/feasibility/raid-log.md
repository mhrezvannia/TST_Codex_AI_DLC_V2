# RAID Log - W3-01 D&D Rules & Rates

**Inputs:** [Intent statement](../intent-capture/intent-statement.md), [competitive analysis](../market-research/competitive-analysis.md), [market trends](../market-research/market-trends.md), and [build-vs-buy assessment](../market-research/build-vs-buy.md)

## Risks

| ID | Risk | Likelihood | Impact | Response | Owner |
| --- | --- | --- | --- | --- | --- |
| R-01 | A D&D extension accidentally alters W2-03 price selection or public contract behavior. | Medium | High | Additive model/API only; retain regression and compatibility fixtures. | Charge |
| R-02 | Port-local day, weekend, holiday, or DST interpretation produces an irreproducible amount. | Medium | High | Make calendar source/timezone explicit and test boundary cases. | Charge |
| R-03 | Provider and consumer independently interpret request/response fields. | Medium | High | Use dual-signed OpenAPI fixtures and a compatibility gate. | Charge / Booking |
| R-04 | A stakeholder reads calculation evidence as a legal-compliance certification. | Low | High | Record the boundary in UI/API/documentation and defer invoice compliance to its owning work. | Product / Compliance |

## Assumptions

| ID | Assumption | Validation point | Owner |
| --- | --- | --- | --- |
| A-01 | Existing Charge pricing provider can host an additive D&D request/evaluation flow. | Application Design and implementation spike. | Architecture / Charge |
| A-02 | Configured port calendars are sufficient for the first supported locations. | Requirements define locations, fallback and maintenance owner. | Product / Reference data |
| A-03 | Compose stack can exercise the full provider path and consumer fixture. | Build and Test live acceptance. | QA / Delivery |

## Issues

| ID | Issue | Status | Resolution path |
| --- | --- | --- | --- |
| I-01 | The AI-DLC generated runtime graph resolves stage-memory paths outside this intent record, so automatic learning surfacing returns no candidates. | Open, framework-only | Preserve the stage diary; do not hand-edit machine-owned graph state. |

## Dependencies

| ID | Dependency | Needed by | Status |
| --- | --- | --- | --- |
| D-01 | Approved W2-03 pricing contracts and fixtures. | Data model, provider contract and regression safety. | Available; preserve unchanged. |
| D-02 | Existing Charge pricing provider and Booking provider adapter. | Bounded provider extension and later W3-02 consumption. | Present in repository. |
| D-03 | Configured port-calendar source/ownership. | Correct calendar-day evaluation. | To specify in Requirements. |
| D-04 | UI LinerCore standards and later refined-mockup approval. | Charge-side operational UI. | Available; invoke at the UI stage only. |

