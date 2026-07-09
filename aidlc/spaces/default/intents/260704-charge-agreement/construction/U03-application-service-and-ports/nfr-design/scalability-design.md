# Scalability Design - U03

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Application services are stateless and thread-safe when ports are thread-safe. No request state is stored in service instances.

## Growth

Repository and reference adapters own pooling/caching decisions.
