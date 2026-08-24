# Functional Design Questions - dnd-author-price-walking-skeleton

The approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md` resolve the architecture and observable behavior. These questions confirm the remaining implementation-level posture without reopening approved scope.

## Q1. Walking-skeleton breadth

How should the first live slice balance the representative demo with the complete owned foundation?

A. Implement generic domain/contract/migration support for all three fixed rule types, while the separately gated live demo uses one representative import-demurrage path with zero and non-zero calculations
B. Implement only import demurrage in the domain and public contract, adding the other types later through breaking changes
C. Expand the live demo to every lifecycle, historical and failure case owned by later Units
D. Split migration, contract, backend and UI into separate horizontal releases
E. Replace the walking skeleton with mocked module boundaries
X. Other (please specify)

[Answer]: A

## Q2. UI platform prerequisites

How should Functional Design handle the W2-02 `PlatformShell` and `Dialog` dependencies?

A. Consume only the merged W2-02 package revision, keep integrated evidence BLOCKED until it exists, and prohibit Charge-local shell/Dialog substitutes
B. Copy the missing primitives into the Charge application
C. Redesign the shared shell in W3-01
D. Omit shell and dialog accessibility behavior from the Unit DoD
E. Treat mockups as proof that the dependency is complete
X. Other (please specify)

[Answer]: A

## Ambiguity check

The selected answers must preserve the solo gated U01 Bolt, complete additive foundation ownership, real Reference Data/Charge/BFF/UI seams, and honest BLOCKED status for unmet platform evidence.
