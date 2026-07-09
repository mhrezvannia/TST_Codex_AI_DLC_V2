# Security Design - U05

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Validate DTOs at the controller boundary, pass identity context to application service, normalize errors, and echo/generate correlation IDs.

## Controls

State actions are enforced server-side even if UI buttons are disabled.
