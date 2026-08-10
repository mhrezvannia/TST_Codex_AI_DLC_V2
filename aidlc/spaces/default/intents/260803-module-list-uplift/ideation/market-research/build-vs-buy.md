# Build vs Buy Assessment — W4-01 Module List-Detail Uplift

## Decision and Upstream Constraints

The decision is bounded by `ideation/intent-capture/intent-statement.md`: closed W2-01/W2-02 shell and UI foundations, closed W2-03/W2-04 domain behavior, existing Reference Data services, one LinerCore shell, `@erp/ui` ownership, no new business capabilities, and an observed live-stack Definition of Done.

## Options

| Option | Fit | Benefits | Costs and risks | Verdict |
|---|---:|---|---|---|
| Build the thin composition layer | High | Reuses sunk service/BFF investment; preserves identifiers, behavior, auth, shell, and shared UI; can ship as three vertical units | Focused frontend/view-model work; shared-component gaps require platform coordination; team owns maintenance | **Select** |
| Buy a replacement enterprise suite | Low | Broad mature logistics capabilities, configuration, and vendor roadmap | Subscription/module licensing; implementation, integration, migration, training, and switching cost; duplicates closed domain services; threatens shell and ownership contracts | Reject for W4-01 |
| Partner-led delivery on LinerCore | Medium | Adds temporary specialist capacity and logistics/UX experience | Coordination and knowledge-transfer cost; partner must obey repository authority and cannot own a parallel shell/theme/component system | Contingency only |
| Defer | Low | Avoids near-term delivery cost | Preserves legacy workbenches, missing Container UI, inconsistent navigation, and audit/design-system gaps; delays value from closed W2 dependencies | Reject unless dependency truth changes |

## Commercial Model Comparison

Exact external prices are not used because enterprise offerings are frequently quote- and implementation-led. The material comparison is total commitment:

- **Internal build:** engineering time for three thin UI units, shared-platform review, accessibility/quality evidence, and ongoing maintenance. Backend replacement, major migration, and retraining are avoided.
- **Enterprise suite purchase:** product subscription or module consumption plus implementation partner, integration, data migration, identity, reporting, training, change management, and switching commitments.
- **Partner-led LinerCore build:** services spend and onboarding overhead without platform license replacement; value depends on strong design-system and domain governance.
- **Defer:** no immediate project spend, but continued operational inconsistency and duplicated support/test paths remain as opportunity and maintenance cost.

Official product evidence shows why the replacement boundary is too broad: SAP integrates agreements, rates, scales, procurement, and charge management; Oracle combines shipment planning, visibility, rate, financial, and execution functions; CargoWise spans forwarding, transport, tracking, accounting, and enterprise tooling. Those are platform adoption decisions, not substitutes for a bounded list-detail uplift.

Sources: [SAP Agreement Management](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e3dc5400c1cc41d1bc0ae0e7fd9aa5a2/2dce9c51aa175f72e10000000a423f68.html), [Oracle Transportation Management](https://www.oracle.com/europe/scm/logistics/transportation-management/), and [CargoWise](https://cargowise.com/).

## Recommendation

Build the W4-01 composition layer in the approved sequence:

1. Reference Data establishes the repeated provider-backed list/detail/state pattern.
2. Charge Agreements reuses mature routes and behavior while retiring the legacy workbench.
3. Container Movement creates the missing canonical shell route from verified W2-04 sources.

The intent closes only after integrated live evidence across all three units. Buy or partner decisions remain bounded to enabling needs that cannot reasonably be supplied by existing services or `@erp/ui`; they do not authorize a replacement shell, domain-local theme, or shared-component fork.

## Reconsideration Triggers

Reopen the recommendation only if evidence shows one of the following:

- A required provider contract is absent and cannot be delivered within the owning domain roadmap.
- Regulatory or partner interoperability demands a certified external capability beyond DCSA vocabulary/API compatibility.
- The total cost of maintaining the existing domain services materially exceeds a separately approved platform-replacement business case.
- Internal delivery capacity cannot meet the program dependency window and a governed partner engagement has a lower whole-life risk.

Until such evidence exists, external suites remain benchmarks and bounded integration candidates, not W4-01 alternatives.
