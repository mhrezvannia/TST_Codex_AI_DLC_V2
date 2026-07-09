# Functional Design Questions - UOW-03 Identity Authorization

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Questions and Answers

- Authorization owner: [Answer]: identity-service owns decisions and effective permissions.
- Persistence: [Answer]: Role assignments and authorization audit become durable behind repository ports.
- Denials: [Answer]: Denials return reason, policy version, and correlation id.

