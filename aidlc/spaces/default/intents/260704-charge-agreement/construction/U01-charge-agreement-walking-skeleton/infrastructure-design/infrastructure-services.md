# Infrastructure Services - U01

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Services

| Service | Role |
| --- | --- |
| Java 21/Spring Boot | Backend skeleton and health. |
| Node/Next.js | UI shell. |
| Local reverse proxy | Browser route integration. |

## Exclusions

No database, Kafka, or schema registry dependency is required for U01.
