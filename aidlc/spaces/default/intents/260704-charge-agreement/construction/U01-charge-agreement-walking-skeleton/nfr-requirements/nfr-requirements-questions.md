# NFR Requirements Questions - U01 Charge Agreement Walking Skeleton

## Questions

### Q1. What performance proves the skeleton?

A. Backend health and module-info respond under 200 ms locally; UI shell first contentful render completes within 1.5 seconds and dependency placeholders do not block rendering.
B. Backend-only health is enough for the walking skeleton.
C. UI-only route rendering is enough for the walking skeleton.
X. Other (please specify)

[Answer]: A

### Q2. What security is needed?

A. Local bypass may be visible but must remain development-only and map only to `charge-agreement.admin` in an explicit local profile.
B. Defer all authorization until production identity is integrated.
C. Hide local bypass in UI only.
X. Other (please specify)

[Answer]: A

### Q3. What reliability is needed?

A. Backend and UI start independently, report degraded dependencies honestly, and recover local health without manual data recovery.
B. Treat dependency failures as generic startup failure.
C. Only backend reliability matters in the walking skeleton.
X. Other (please specify)

[Answer]: A

## Source Alignment

Answered from `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.
