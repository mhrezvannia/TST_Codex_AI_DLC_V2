# CI/CD Pipeline - UOW-04 Reference Data Service Core

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Pipeline

1. Maven compile/test.
2. Domain-core purity test.
3. Application service tests.
4. Repository adapter tests.
5. OpenAPI provider checks later in B04.

## Evidence

Backend gates are blocked until Java/Maven are installed or runner evidence is available.

