# NFR Requirements Questions - UOW-02 Auth Session and Keycloak

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Answers

- Session response target: under 500 ms locally when identity-service is healthy.
- Security target: no token exposure, safe redirect only, local bypass labelled.
- Reliability target: Keycloak unavailable produces explicit service-down state.

