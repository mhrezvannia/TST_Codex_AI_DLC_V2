# Security Requirements - UOW-05 Reference Data BFF Clients

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Controls

- Browser sees only BFF routes.
- BFF validates request body shape before service call.
- BFF checks permission before mutation and propagates correlation id.
- BFF responses do not include tokens, stack traces, or raw service internals.
- Request-access path is visible for read-only users.

## Threats

| Threat | Requirement |
| --- | --- |
| Client bypasses authorization | Server-side BFF and service checks required. |
| Error leakage | UI-safe error mapping only. |

