# Competitive and Alternatives Analysis

This assessment derives from the upstream intent-statement.md and evaluates closure alternatives rather than selecting a new product.

## Decision Matrix

| Alternative | Strengths | Weaknesses / closure cost | Decision |
|---|---|---|---|
| Preserve and close LinerCore @erp/ui | Existing shared shell, tokens, primitives, tests, Booking surfaces, and Wave A ownership are already present | Requires finishing real consumption and live evidence | **Selected** |
| Adopt Carbon | Mature component catalog, UI shell, data-table patterns, and accessibility guidance | Replaces settled tokens and patterns, creates migration risk, and expands the intent beyond unresolved DoD gaps | Reference only |
| Adopt USWDS | Strong token model, implementation guidance, and explicit accessibility testing practice | Government-service visual/product assumptions do not match the LinerCore operational-console contract | Reference only |
| Build a hybrid wrapper | Can reuse external internals behind @erp/ui | Adds a second abstraction and dependency migration without resolving the immediate page-level proof gap | Rejected for this intent |

## Table-Stakes Benchmark

The comparison systems reinforce the existing W2-02 contract:

- systematic reuse of shared components for visual and functional consistency;
- one coherent shell and component vocabulary;
- tokens as the styling foundation;
- keyboard, focus, contrast, zoom, touch, and assistive-technology consideration;
- component checks plus testing inside the consuming page.

Carbon describes reusable components as coordinated parts of a greater whole and includes shell, form, feedback, loading, and data-table patterns. USWDS makes tokens, components, patterns, and accessibility guidance part of one system and explicitly says consuming teams must test in their own context.

## Differentiation for LinerCore

LinerCore’s relevant differentiator is not a larger generic component catalog. It is an enterprise carrier workbench whose shared package encodes dense operational layout, status semantics, workflow feedback, one authenticated shell, light-first theming, and module interoperability. Booking is the reference migration proving that contract for downstream teams.

## Sources

- [Carbon component overview](https://carbondesignsystem.com/components/overview/components/)
- [Carbon accessibility overview](https://carbondesignsystem.com/guidelines/accessibility/overview/)
- [U.S. Web Design System](https://designsystem.digital.gov/)
- [USWDS accessibility strategy](https://designsystem.digital.gov/documentation/accessibility/)
