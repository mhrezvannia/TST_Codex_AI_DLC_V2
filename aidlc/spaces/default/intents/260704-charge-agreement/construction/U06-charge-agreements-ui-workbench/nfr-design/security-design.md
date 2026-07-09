# Security Design - U06

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Use Next.js route handlers as BFF boundaries. Avoid secrets in client code. Render local bypass state clearly.

## Controls

Client validation is UX-only; backend validation/authorization remains authoritative.
