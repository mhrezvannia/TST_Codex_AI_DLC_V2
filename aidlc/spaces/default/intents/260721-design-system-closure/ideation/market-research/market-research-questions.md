# Market Research Questions

This guided clarification set is scoped by the upstream intent-statement.md.

## Answered Decisions

1. **What competing solutions should be compared?** Carbon, USWDS, and WCAG are validation references; LinerCore’s shared package and authenticated shell remain authoritative.
2. **What is table-stakes?** Tokenized shared primitives, real Booking consumption, keyboard/focus behavior, responsive states, theme proof, and durable audit evidence.
3. **What is the build-vs-buy-vs-partner conclusion?** Preserve the existing @erp/ui foundation and close only documented consumption and evidence gaps.
4. **Who is the addressable audience?** Wave A operators and all LinerCore module teams consuming the shared shell, tokens, and primitives.
5. **Which trend materially affects scope?** WCAG 2.2 keyboard, focus, and target expectations plus page-level testing in context.

## Ambiguity and Contradiction Review

- The phrase “market research” could imply a greenfield component-library selection. The intent explicitly prohibits that reading, and the selected answers resolve it in favor of a closure benchmark.
- No answer conflicts with intent-statement.md, the W2-02 ownership boundary, MASTER.md, or the protected baseline.
- External systems may inform validation criteria but cannot introduce a second shell, theme, navigation model, or frontend.
