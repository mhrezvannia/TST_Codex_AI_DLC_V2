# Performance Design - U02

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Use simple collection validation over aggregate terms; avoid reflection, framework lifecycle, or persistence calls in domain methods.

## Validation

JUnit tests exercise normal and boundary aggregate sizes.
