# User Stories Assessment — W2-03 Charge Tariffs & Agreements

## Decision

**Execute.** User stories add material value for this feature intent.

## Rationale

The reviewed [`requirements.md`](../requirements-analysis/requirements.md) defines user-facing Charge administration, Booking-visible pricing outcomes, version/lifecycle controls, and failure-state behavior across two bounded contexts. The brownfield [`business-overview.md`](../../../../codekb/TST_Codex_W2-03/business-overview.md) confirms that Charge supplies pricing authority while Booking consumes and persists the result. This is not an infrastructure-only change or isolated refactor.

## Factors Considered

- **User-facing scope:** Pricing analysts manage rate and agreement versions; Booking desk operators consume itemised prices, reprice, and see manual-pricing states; Charge readers inspect evidence.
- **Complex business logic:** agreement-first authority, tariff fallback, effective-date matching, overlap rejection, immutable approved versions, money rounding, and distinct failure semantics.
- **Cross-domain coordination:** the [`component-inventory.md`](../../../../codekb/TST_Codex_W2-03/component-inventory.md) identifies separate Charge provider and Booking consumer surfaces with an existing but incomplete integration seam.
- **Delivery discipline:** [`team-practices.md`](../practices-discovery/team-practices.md) requires a risk-first real-line skeleton, preserved domain boundaries, test evidence, and isolated Wave A acceptance.

## Areas Where Stories Add Value

Stories will make the end-to-end operator outcomes independently testable across five workflows: rate authority, agreement versioning and approval, Booking pricing, repricing with immutable history, and no-rate evidence. They will also make role restrictions, accessibility, responsive behavior, and provider-failure distinctions visible without turning W2-03 into a broader pricing or manual-resolution redesign.

