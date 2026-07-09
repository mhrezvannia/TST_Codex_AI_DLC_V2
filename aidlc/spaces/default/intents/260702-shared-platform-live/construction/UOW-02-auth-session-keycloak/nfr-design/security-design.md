# Security Design - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Store transaction/session data in HTTP-only SameSite cookies.
- Validate callback state before session creation.
- Use safe return URL filtering.
- Return safe summaries only; never return tokens, nonce, or verifier.
- Label local bypass in server-generated session summary.

## Controls

- Tests for unsafe return URL rejection.
- Tests for no token fields in session response.
- Tests for bypass label when enabled.

