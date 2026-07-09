# Deployment Pipeline Memory

## Interpretations

- 2026-07-03T22:52:00Z - Treated deployment-pipeline as local/on-prem promotion design, not public-cloud deployment; prior `ci-config`, `quality-gates`, unit `deployment-architecture`, and unit `cicd-pipeline` artifacts all constrain this to self-hosted runners and local Compose until runtime blockers clear.

## Deviations

- 2026-07-03T22:53:00Z - Did not add registry publishing workflow code; current readiness evidence shows Maven/Docker/service runtime blockers, so promotion remains documented until local runtime can build deployable images.

## Tradeoffs

- 2026-07-03T22:54:00Z - Chose recreate/blue-green local profile strategy over canary; the current scope is local Shared Platform functionality, and traffic-shifting only becomes useful after nginx and service containers are stable.

## Open questions

- 2026-07-03T22:55:00Z - Decide whether self-hosted CI should publish local container images to an internal registry once Docker runtime is available.
