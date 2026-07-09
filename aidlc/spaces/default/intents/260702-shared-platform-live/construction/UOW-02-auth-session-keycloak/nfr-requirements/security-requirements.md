# Security Requirements - UOW-02 Auth Session and Keycloak

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Controls

- Never expose access tokens, refresh tokens, nonce, or PKCE verifier in JSON responses.
- Use HTTP-only SameSite cookies.
- Validate callback `state` before creating a session.
- Use `safeReturnUrl` to reject external redirect targets.
- Label local bypass in every session summary when active.

## Threats

| Threat | Requirement |
| --- | --- |
| Open redirect | Return URL must be local/safe. |
| Session/token leakage | Safe summary only. |
| Bypass misuse | Local-only guard completed by UOW-11 and visible state in UOW-02. |

