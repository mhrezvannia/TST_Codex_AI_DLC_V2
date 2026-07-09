# CI/CD Pipeline - UOW-03 Identity Authorization

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Pipeline

1. Maven compile/test when Java/Maven are available.
2. Domain-core dependency purity test.
3. Authorization policy tests.
4. Repository adapter tests.
5. Provider contract checks later in B04.

## Evidence

Missing Java/Maven reports prerequisite blocked.

