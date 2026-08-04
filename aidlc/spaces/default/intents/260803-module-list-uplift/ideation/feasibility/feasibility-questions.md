# Feasibility Questions — W4-01 Module List-Detail Uplift

## Upstream and Answer Mode

Upstream sources: `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md`.

- Answer mode: Guide me.
- Confirmation: Confirmed on 2026-08-03.
- Evidence basis: indexed repository architecture, current `compose.yaml`, current Nginx routing, approved W2 dependencies, and the W4-01 Context Pack.

## Confirmed Answers

1. **Which integrations are in scope?**
   [Answer]: Existing shell/auth, module BFFs and services, Booking record links, and verified W2-04 contracts only; no new external adapter.
2. **What compliance boundary applies?**
   [Answer]: Preserve current authentication, authorization, audit, privacy/data-handling controls, plus WCAG evidence; do not claim a new certification or regulated-data category.
3. **What stack and ownership apply?**
   [Answer]: Existing TypeScript/Next.js monorepo, current shell/BFF patterns, `@erp/ui`, and current domain/platform ownership.
4. **What AWS/infrastructure scope applies?**
   [Answer]: No new AWS services or accounts. Reuse existing deployment and Compose topology; escalate only from verified contract evidence.
5. **What budget and timeline constraint applies?**
   [Answer]: Program-wave sequencing and current team/platform capacity; no replacement-suite budget or speculative monetary ceiling.
6. **How do unresolved provider or mount gaps affect delivery?**
   [Answer]: Block only affected behavior with owner and evidence, keep independent slices moving, and never simulate success.
7. **What organizational blockers are known?**
   [Answer]: No known change freeze or competing-priority block; verify dependency integrity and reviewer availability in backlog order.

## Repository Findings Used to Resolve Ambiguity

- The indexed application graph contains `auth`, `shell`, `booking`, `reference-data`, and `charge-agreements` apps; it contains no `container-movement` app.
- `compose.yaml` includes `container-movement-service` and its Kafka topic but no Container Movement frontend service.
- `infrastructure/nginx/default.conf` mounts Reference Data, Charge Agreements, Booking, auth, and the shell but has no Container Movement location.
- Charge already has mature Agreement list/detail components and BFF proxy behavior; Reference Data has provider client/error/permission seams.
- The current stack exposes health checks, real Kafka/schema registry dependencies, Keycloak auth, PostgreSQL services, and an observability profile. W4-01 need not add cloud services to expose existing domain truth.

## Ambiguity and Contradiction Analysis

- “Canonical shell route directly” means a shell-visible route backed by verified W2-04 behavior; it does not mean a UI-only mock or direct database access.
- “No new AWS services/accounts” does not exempt the change from deployment, health, logging, or live-stack evidence; it constrains topology growth.
- The internal audience does not remove privacy/security obligations: authenticated identity, authorization decisions, audit context, and business-confidential records still require existing controls.
- Independent unit merging does not permit intent closure after only Reference Data or Charge; integrated evidence across all three remains binding.
- No confirmed answer conflicts with the approved upstream artifacts.
