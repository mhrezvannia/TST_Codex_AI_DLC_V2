# Deployment Architecture - U01

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Architecture

Run `charge-agreement-service` as a local Spring Boot process on `8084` and `apps/charge-agreements` as a Next.js process on `3002`. Add `/charge-agreements/` to the local reverse proxy.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable.
