# Scalability Design - U02

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Aggregate rules remain suitable for 1-100 charge terms. Advanced RMS-scale term matrices are outside the first model.

## Growth

If terms grow beyond this shape, split advanced rating into a later bounded context.
