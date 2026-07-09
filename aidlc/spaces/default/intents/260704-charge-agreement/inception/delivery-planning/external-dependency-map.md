# External Dependency Map - Charge & Customer Agreement

## Dependencies

| Dependency | Owner | Blocks | Lead time | Mitigation |
| --- | --- | --- | --- | --- |
| Shared Platform identity-service | Shared Platform | B04/B05 auth behavior | Already running locally | Use local bypass in development and identity API when available. |
| Shared Platform reference-data-service | Shared Platform | U07/B04 | Already running locally | Use seeded reference IDs and service client fallbacks for UI resilience. |
| Postgres | Local platform | U04/B03 | Already running locally | Use existing local DB; avoid conflicting Compose DB startup. |
| Docker Desktop / Compose | Platform environment | Full Compose parity in Operation | Unknown | Proceed host-runtime; recover Docker separately. |
| Kafka / Schema Registry | Platform environment | Live event publication | Unknown | Keep event seam optional in B05. |
| Business pricing SME | Product | Detailed pricing variants | Unknown | First slice uses generic terms; advanced variants deferred. |

## No-Go Items

No external dependency blocks B01-B04 in host-runtime mode. B05 can complete local module readiness with explicit Docker/Kafka caveats if those services remain unavailable.
