# Competitive Analysis — W4-01 Module List-Detail Uplift

## Decision Context

This analysis tests the approved `ideation/intent-capture/intent-statement.md` against current enterprise logistics patterns. W4-01 is an internal brownfield list-detail uplift, not a procurement exercise or a commercial market-entry claim. External products are comparators for operational expectations; the LinerCore intent statement, domain contracts, design system, and provider truth remain authoritative.

## Comparator Landscape

| Comparator | Relevant strengths | Limits for W4-01 | Useful benchmark |
|---|---|---|---|
| Current LinerCore workbenches | Existing provider/BFF behavior and user familiarity | Inconsistent information architecture; duplicate or missing canonical routes | Preserve real actions and domain behavior while replacing the presentation path |
| SAP Transportation Management | Agreement management connects contracts, charge calculation, rate tables, scales, validity, and master data; its master-data cockpit exposes related objects and filtered access | Broad configurable suite with substantial implementation and operating model; not a shared-shell component source | Relationship-rich Agreement detail, validity/status context, and navigable master-data relationships |
| Oracle Transportation Management | Shipment detail joins execution, identifiers, rates, cost, status, and visibility; rate selection is tied to provider, lane, mode, equipment, and items | End-to-end planning/financial breadth exceeds W4-01; adopting it would duplicate closed LinerCore capabilities | Exact-record shipment visibility, explicit financial/rate relationships, and lifecycle actions |
| CargoWise | One logistics platform spans forwarding, transport, tracking, data accuracy, rates, accounting, alerts, and ETA-oriented operations | Platform replacement/module adoption would introduce integration, migration, training, and switching cost | Cross-workflow continuity and operational alert/visibility expectations |
| DCSA Track & Trace standard | Consistent container-event definitions and published API specifications aligned to industry vocabulary | A standard, not a UI product or implementation substitute | Container Movement timeline vocabulary and provider-backed event semantics |

Official evidence: [SAP Agreement Management](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/2dce9c51aa175f72e10000000a423f68.html), [SAP Master Data Cockpit](https://help.sap.com/docs/SAP_TRANSPORTATION_MANAGEMENT/54cf405c9d9e4c96bf091967ea29d6a7/200eb461974749a6b8c8f2df5c714e00.html), [Oracle Shipment Manager](https://docs.oracle.com/en/cloud/saas/transportation/26b/otmol/planning/shipment_manager/multi_create_shipments/multi_create_shipmnt.htm), [Oracle Transportation Management](https://www.oracle.com/europe/scm/logistics/transportation-management/), [CargoWise](https://cargowise.com/), and [DCSA Track & Trace](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace).

## Table-Stakes for W4-01

The comparison supports the following baseline, all already consistent with the intent statement:

- A filterable, sortable, paginated list only where the provider contract supports each operation.
- A named, keyboard-reachable link to a stable exact-record URL.
- Detail sections that show domain relationships rather than flattening records into generic cards.
- Lifecycle, validity, status, and timeline information close to the actions they govern.
- Loading, empty, filtered-empty, denied, read-only, validation, pending, success, conflict, provider-error, degraded, stale, and not-found handling as applicable.
- Cross-links that preserve record identity and shell context.
- Accessible focus, labels, errors, and asynchronous status messages.

## Differentiation Strategy

W4-01 should not compete on configuration breadth. Its defensible internal advantage is a thin, coherent operational surface over domain-owned truth:

1. **One authenticated operating context.** Reference Data, Charge Agreements, Container Movement, and Booking use one shell and predictable navigation.
2. **Truth before feature theater.** Unsupported provider capabilities are visibly blocked with ownership; the UI never simulates success.
3. **Domain-specific detail, shared interaction grammar.** Each module retains its vocabulary and relationships while lists, tabs, states, focus, and feedback reuse `@erp/ui`.
4. **Low switching cost between related work.** Exact Agreement↔Booking and Journey↔Booking links preserve identifiers and user context.
5. **Evidence-led completeness.** Live Compose, responsive, accessibility, and audit evidence decide closure—not screenshot polish alone.

## Competitive Risks and Responses

| Risk | Response inside W4-01 |
|---|---|
| Copying suite breadth expands scope | Keep saved views, bulk operations, global search, new domain actions, and new integration seams deferred |
| A generic shared page erases domain meaning | Share shell, tokens, and primitives; keep module view models and section semantics domain-owned |
| Visual consistency masks provider gaps | Render explicit blocked/degraded states and owning dependencies |
| Existing mature Charge routes regress during consolidation | Reuse those routes and behavior; retire only the legacy canonical workbench entrypoint |
| Container design invents data because no app exists | Compose only from verified W2-04 services/contracts and approved design artifacts |

## Positioning Conclusion

The market evidence validates W4-01’s list-detail bar but does not justify replacing the existing platform. The correct position is “focused operational continuity over owned domain services,” delivered through the one LinerCore shell. External suites remain useful regression or completeness references, never alternate design-system or business-ownership authorities.
