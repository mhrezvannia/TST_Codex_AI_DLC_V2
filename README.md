# LinerCore Shared Platform

This workspace is the Shared Platform MVP baseline. It is intentionally scoped to `identity-service`, `reference-data-service`, Kafka reference event integration, `apps/auth`, and `apps/reference-data`.

Charge, Booking, and Container Movement runtime services are out of scope for this workflow.

## Commands

```bash
yarn install
yarn skeleton:validate
yarn lint
yarn typecheck
yarn test
yarn backend:test
```

Backend services use Java 21, Spring Boot 3.3, Maven, and hexagonal modules. Frontend apps use Next.js App Router, TypeScript strict mode, Turborepo, Yarn, and shared `@erp/*` packages.

Local runtime descriptors live under `infrastructure/`. Concrete domain behavior is added by later AI-DLC units.
