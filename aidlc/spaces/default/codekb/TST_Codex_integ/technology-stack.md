# Technology Stack - TST_Codex_integ

## Runtime and Build

| Area | Technology |
|---|---|
| Monorepo package manager | Yarn 4.5.3 workspaces |
| Frontend orchestration | Turborepo |
| Frontend apps | Next.js App Router style, React 18.3.1, TypeScript 5.7.2 |
| Frontend tests | Vitest, Testing Library, jsdom |
| Frontend lint/typecheck | ESLint 9, TypeScript, turbo scripts |
| Backend services | Java/Spring service modules under Maven |
| Backend build/test | Maven via `mvn -f services/pom.xml` |
| Local runtime | Docker Compose |
| Identity provider | Keycloak 24 in Compose |
| Datastore | PostgreSQL 15 in Compose |
| Async transport | Kafka 7.7.1 and Confluent Schema Registry |
| Edge | Nginx 1.27 |
| Observability profile | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, Elasticsearch, Kibana |

## Package Scripts

Root scripts include:

- `build`, `lint`, `typecheck`, `test`
- `backend:build`, `backend:test`
- `local:check`, `local:runtime`
- `seed:local`, `seed:validate`
- `contracts:validate`, `contracts:verify`, `contracts:verify:live`
- `readiness:local`, `quality:gates`
- `w1:live-acceptance`, `smoke:local`, `smoke:observability`

## W2-01 Stack Implications

- The shell should stay in TypeScript/Next.js and use Yarn workspaces.
- Browser auth/session must respect the enterprise BFF/HttpOnly-cookie baseline.
- Backend subject authorization uses Java services and identity-service APIs.
- Acceptance must run on local Compose and Nginx, not a cloud stack.

## Prohibited/Constrained Choices

Per enterprise standards and approved W2-01 scope:

- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Do not introduce public-cloud/AWS architecture for this slice.
- Do not introduce a micro-frontend platform before proving the monorepo shell path.
- Do not bypass Keycloak/identity-service with custom auth for production-like paths.
