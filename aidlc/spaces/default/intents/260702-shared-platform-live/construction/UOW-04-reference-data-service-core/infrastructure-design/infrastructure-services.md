# Infrastructure Services - UOW-04 Reference Data Service Core

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Services

| Service | Use |
| --- | --- |
| PostgreSQL | Records, history, outbox. |
| identity-service | Authorization. |
| reference-data-service | Reference Data API. |

## Access

BFF calls reference-data-service; browser does not.

