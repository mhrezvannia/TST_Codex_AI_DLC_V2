# Infrastructure Design Questions - U01 Rate Authority

## Question assessment

No new user question was required for this Construction iteration. The approved
inputs already decide every infrastructure focus area:

- deployment remains additive inside the existing `charge-agreement-service`
  and `apps-charge-agreements` containers;
- the only executable topology is the isolated `linercore-wave-a` Docker
  Compose stack controlled by `scripts/wave-a-compose.mjs`;
- Wave A selects the Rate `identity-http` authorization bean explicitly and
  proves a real Identity allow/deny/unavailable decision; the local subject map
  is developer-only and cannot satisfy acceptance;
- PostgreSQL remains the sole Rate authority, with no cache, replica, shard,
  second Charge database, or asynchronous Rate command path;
- Identity and Reference Data remain fixed, fail-closed HTTP dependencies;
- the existing Prometheus/Grafana/Jaeger/OpenTelemetry profile is reused;
- forward-only Flyway migration, isolated restore, and manager-port preservation
  are mandatory;
- staging, production, AWS resources, cloud regions, and production SLOs are
  deliberately not selected or implied by this intent.

## Ambiguity analysis

The inputs contain no unresolved contradiction. Generic AWS and cloud guidance
is advisory only and cannot override the approved Compose-only boundary in
`services.md` and `logical-components.md`. The design therefore records local
development, non-Compose CI unit/Testcontainers jobs, and isolated Wave A
acceptance only. There is no second full-stack Compose project.
Production topology remains an explicit future architecture decision.
