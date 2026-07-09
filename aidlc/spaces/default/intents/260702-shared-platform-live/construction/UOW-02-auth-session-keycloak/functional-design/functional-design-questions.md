# Functional Design Questions - UOW-02 Auth Session and Keycloak

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Questions and Answers

- Auth flow: [Answer]: Complete local Keycloak callback where possible; keep local bypass only as local-labelled fallback.
- Session output: [Answer]: Return safe subject, display name, roles, permissions, auth mode, policy version, and correlation id.
- Failure states: [Answer]: No session, Keycloak unavailable, invalid callback, and bypass disabled must be explicit.

