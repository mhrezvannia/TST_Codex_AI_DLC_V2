# NFR Design Questions - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Answers

- Design pattern: stateless BFF session summary with safe cookies and bounded identity lookup.
- Security design: safe redirect, HTTP-only cookies, no token output.
- Reliability design: controlled unauthenticated and Keycloak-down states.

