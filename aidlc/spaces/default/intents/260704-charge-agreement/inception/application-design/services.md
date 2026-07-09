# Services - Charge & Customer Agreement

## Service Definitions

| Service | Responsibility |
| --- | --- |
| `charge-agreement-service` | Owns customer agreement lifecycle, charge terms, persistence, REST API, and active lookup. |
| `apps-charge-agreements` | Owns browser UI, BFF route handlers, local auth/reference-data calls, and view models. |
| `identity-service` | Provides authorization and local effective permission behavior. |
| `reference-data-service` | Provides reference records used by agreement fields. |

## Communication Contracts

| Source | Target | Pattern | Purpose |
| --- | --- | --- | --- |
| Browser | `apps-charge-agreements` | HTTP | UI page and BFF calls. |
| `apps-charge-agreements` | `charge-agreement-service` | REST | Agreement CRUD/status/lookup. |
| `apps-charge-agreements` | `identity-service` | REST | Permission resolution when bypass is off. |
| `apps-charge-agreements` | `reference-data-service` | REST | Reference selectors and labels. |
| Future Booking | `charge-agreement-service` | REST | Active agreement lookup. |
| `charge-agreement-service` | Event broker | Async seam | Agreement changed/approved events later. |

## Lifecycle and Scaling

The service is stateful through Postgres and otherwise horizontally scalable. First local implementation targets one host-runtime process. Later Compose/cloud deployment should mirror existing service deployment patterns.

## Local Runtime Recommendation

| Component | Suggested host port |
| --- | --- |
| `charge-agreement-service` | 8084 |
| `apps-charge-agreements` | 3002 |
| Reverse proxy route | `/charge-agreements/` |

Final port allocation should be confirmed in infrastructure design.

## Event Strategy

Agreement event publication should be designed as a port and published-language seam in the first slice, but live Kafka publication can remain optional until Docker/Compose is healthy. This preserves architecture without blocking local product functionality.
