# Scalability Design - UOW-03 Identity Authorization

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Catalog remains code/static for local MVP.
- Assignment repository supports many assignments per subject.
- API remains stateless and horizontally portable later.

## Growth

- Future downstream resources add catalog entries without changing service API shape.

