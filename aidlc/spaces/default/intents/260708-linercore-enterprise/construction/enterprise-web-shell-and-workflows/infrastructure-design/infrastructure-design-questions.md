# Infrastructure Design Questions - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required. Prior stages resolve the integrated Enterprise Web app, authenticated shell, permission hints, real API/BFF calls, evidence panels, exception/audit views, and no-prototype-readiness posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Next.js Enterprise Web app in Yarn/Turbo workspace, routed through nginx in `app`/`full`. |
| Compute | Stateless frontend app with BFF/route handlers only for presentation aggregation. |
| Storage | Browser/session state only; backend services own business state. |
| Networking | Calls service OpenAPI clients or BFF routes; no direct database or fake prototype logic. |
| Monitoring | Shell load, route transitions, API errors, degraded states, evidence panel loads, accessibility, and no-fake-completion tests. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact app package path, route names, API client package names, and BFF handler boundaries are implementation details constrained by this design.
