# Market Trends — W4-01 Module List-Detail Uplift

## Scope and Upstream

The trend assessment applies only to decisions in `ideation/intent-capture/intent-statement.md`. It covers operational UI, accessibility, API-backed truth, and container-event interoperability. It intentionally excludes macro logistics forecasts and speculative market sizing.

## Relevant Trends

### Relationship-rich operational records

Enterprise logistics products organize work around records with connected rates, partners, validity, costs, statuses, equipment, items, and events. SAP’s agreement and master-data documentation and Oracle’s shipment documentation both reinforce that list rows are entrypoints into relationship-rich operational records, not the final information surface.

**W4-01 implication:** preserve the approved domain tabs—Reference Summary/Attributes/History; Agreement Summary/Rates/D&D/Status history; Journey Summary/Movement timeline/Linked booking—and expose related records through exact links.

### API-backed domain truth and interoperability

DCSA publishes consistent Track & Trace definitions and API specifications so container events retain the same meaning across participants and systems. SAP also publishes freight-agreement integration APIs, reinforcing stable service contracts as the seam between domain systems and operational surfaces.

**W4-01 implication:** render movement vocabulary and event order from W2-04 contracts; do not infer missing events or create UI-owned domain records. Keep module-to-module navigation identifier-based rather than importing another app’s code or data.

Sources: [DCSA Track & Trace](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace) and [SAP Freight Agreement Integration](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/e2fd938fbf554ac8b719c9207de81d5a.html?locale=en-US).

### One operational platform, bounded domain ownership

Commercial suites market continuity across forwarding, transport, rates, tracking, finance, and alerts. The transferable expectation is fewer context breaks; the non-transferable choice is monolithic ownership.

**W4-01 implication:** deliver continuity in the existing LinerCore shell while keeping Reference Data, Charge, Container Movement, and Booking contracts owned by their domains. Share interaction primitives through `@erp/ui`, not business logic through app-to-app imports.

Source: [CargoWise platform overview](https://cargowise.com/).

### Accessibility as operational correctness

W3C’s WCAG 2.2 retains requirements for visible focus, predictable navigation, error identification, programmatic component states, and status messages that assistive technology can announce without moving focus. These are especially material in dense asynchronous operational tools.

**W4-01 implication:** treat focus restoration, labels, linked errors, pending/success/error announcements, and keyboard-reachable record links as acceptance evidence across every module—not optional polish.

Source: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Configuration breadth is not the first uplift target

Mature suites offer personalization, bulk operations, planning, optimization, procurement, and financial breadth. Those capabilities can be valuable, but they require domain rules, provider support, and governance beyond a presentation uplift.

**W4-01 implication:** maintain the approved defer list. First close trustworthy find → inspect → permitted action → result → recovery loops; evaluate advanced productivity only through later vertical intents with explicit provider contracts.

## Module Implications

| Module | Trend translated into W4-01 scope | Explicit non-goal |
|---|---|---|
| Reference Data | Searchable provider-backed sets/records with attributes and history in one shell | Generic master-data platform replacement or bulk governance tooling |
| Charge Agreements | Relationship-rich Agreement detail with rates, D&D, validity/status history, and exact Booking links | Strategic procurement, optimization, or new rating capability |
| Container Movement | DCSA-readable event timeline composed from W2-04 truth with exact Booking linkage | New carrier integrations, predicted events, or invented tracking data |

## Trend Conclusion

Current patterns strengthen the approved intent: operational users need coherent record navigation, domain relationships, accessible feedback, and interoperable event semantics. The product advantage comes from applying those expectations narrowly and truthfully to the existing platform, not from matching the feature inventory of a global suite.
