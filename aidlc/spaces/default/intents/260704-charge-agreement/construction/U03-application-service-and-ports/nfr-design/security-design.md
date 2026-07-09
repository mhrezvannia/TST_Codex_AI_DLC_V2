# Security Design - U03

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Authorize every use case through `AuthorizationPort`; local bypass is an adapter implementation and cannot remove the authorization call from orchestration.

## Controls

Carry actor and correlation ID through commands and event facts.
