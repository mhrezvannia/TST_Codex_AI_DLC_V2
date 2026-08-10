# Standards and Practice Trends

The upstream intent-statement.md requires observable closure evidence. Current authoritative guidance supports that emphasis.

## Material Trends

1. **Accessibility evidence is moving beyond component claims.** USWDS tests components but explicitly requires consuming projects to test the component in their own page context.
2. **WCAG 2.2 strengthens operational interaction expectations.** The added criteria include focus not obscured, dragging alternatives, minimum target size, consistent help, redundant-entry reduction, and accessible authentication.
3. **Design tokens and coherent component systems remain table-stakes.** Mature systems present tokens, patterns, components, and shell behavior as one adoption surface rather than module-local styling.
4. **Continuous verification matters.** Automated checks are useful, while keyboard, zoom, screen-reader, touch, and contextual manual checks remain necessary.

## Impact on W2-02

- Keep the existing token and primitive contract; do not chase visual fashion or external library breadth.
- Prove light and dark themes, responsive widths, loading/empty/error/ready states, keyboard traversal, visible focus, dialog focus behavior, and toast/feedback semantics on live Booking routes.
- Retain automated lint/type/test/build checks and add Playwright page-context evidence on the isolated Compose stack.
- Treat component-level success as necessary but insufficient until Booking consumes @erp/ui and the live workflow is observed.

## Regulatory and Standards Position

WCAG 2.2 is the current W3C Recommendation in the WCAG 2 series and W3C encourages use of the latest version. This intent therefore uses WCAG 2.2 AA-oriented evidence as a quality benchmark while preserving the project’s existing accessibility contract; it does not make a new legal-conformance claim.

## Sources

- [W3C WCAG 2 overview](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [What’s New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [USWDS accessibility strategy](https://designsystem.digital.gov/documentation/accessibility/)
