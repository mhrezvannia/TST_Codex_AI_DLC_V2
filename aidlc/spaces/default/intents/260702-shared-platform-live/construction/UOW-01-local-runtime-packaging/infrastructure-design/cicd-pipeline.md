# CI/CD Pipeline - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Pipeline

1. Checkout.
2. Run prerequisite check.
3. Install Yarn dependencies.
4. Validate Compose syntax.
5. Build app/service images or run dev-profile verification.
6. Publish evidence artifact.

## Secrets

CI masks env values and uses local/test credentials only.

