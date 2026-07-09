# Performance Requirements - U02

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

Domain operations run in memory and complete under 10 ms for normal aggregate sizes of up to 100 terms.

## Validation

JUnit domain tests cover lifecycle transitions, charge-term validation, and active-date checks without Spring startup cost.
